const socketIo = require("socket.io");
const pool = require('./db');

const rooms = {}; // Store game rooms and player states

const mapCardIds = () => {
  const cardMap = {};
  for (let i = 1; i <= 30; i++) {
    cardMap[i] = Math.floor(Math.random() * 11) + 8;
  }
  return cardMap;
};


const generateRoomCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const initSocket = (server) => {
  const io = socketIo(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on("join_room", (roomId, username, isCreatingNewGame) => {
      let finalRoomId = roomId;

      if (isCreatingNewGame) {
        // Generate a unique room code
        do {
          finalRoomId = generateRoomCode();
        } while (rooms[finalRoomId]);

      }
      socket.emit("room_created", finalRoomId);

      if (!rooms[finalRoomId]) {
        rooms[finalRoomId] = { players: [], turn: Math.floor(Math.random() * 2), libraries: {}, cardMaps: {}, lifes: {}, attackers: [] };
      }

      const player = { id: socket.id, username };
      rooms[finalRoomId].players.push(player);
      socket.join(finalRoomId);

      // Emit library to the player who just joined
      let cardMap = mapCardIds();
      let library = Object.keys(cardMap);
      rooms[finalRoomId].libraries[socket.id] = library;
      rooms[finalRoomId].cardMaps[socket.id] = cardMap;
      rooms[finalRoomId].lifes[socket.id] = 20;
      socket.emit("library", { library, cardMap });
      for (let i = 0; i < 5; i++) {
        let card = rooms[finalRoomId].libraries[socket.id].pop();
        socket.emit("draw", card);
      }

      if (rooms[finalRoomId].players.length === 1) {
        socket.emit("waiting_for_opponent", finalRoomId);
      } else if (rooms[finalRoomId].players.length === 2) {
        io.to(finalRoomId).emit("game_start", {
          players: rooms[finalRoomId].players.map((p) => p.username),
          turn: rooms[finalRoomId].players[rooms[finalRoomId].turn % 2].id,
        });
      }
    });

    socket.on("play_card", ({ roomId, card }) => {
      const room = rooms[roomId];
      if (!room) return;

      const currentTurn = room.players[room.turn % 2].id;
      if (socket.id !== currentTurn) return;



      io.to(roomId).emit("card_played", {
        player: socket.id,
        card,
        map: room.cardMaps[socket.id][card],
      });

    
    });

    socket.on("declare_attack", ({ roomId, attackers }) => {
      console.log(attackers);
      const room = rooms[roomId];
      if (!room) return;

      const currentTurn = room.players[room.turn % 2].id;
      if (socket.id !== currentTurn) return;

      io.to(roomId).emit("attack_declared", { attackers });
      room.attackers = attackers;
    });

    socket.on("declare_block", ({ roomId, attackerToBlockersMap }) => {
      console.log(attackerToBlockersMap);
      const room = rooms[roomId];
      if (!room) return;

      const currentTurn = room.players[room.turn % 2].id;
      if (socket.id === currentTurn) return;

      let totalDamage = 0;
      const promises = [];
      const opponentId = room.players.find(p => p.id !== socket.id).id;
      const OppMap = room.cardMaps[opponentId];
      const MyMap = room.cardMaps[socket.id];

      // Add attackers with no blockers to the attackerToBlockersMap
      attackerToBlockersMap = attackerToBlockersMap || {};
      room.attackers.forEach(attacker => {
        if (!attackerToBlockersMap[attacker]) {
          attackerToBlockersMap[attacker] = [];
        }
      });

      // Iterate over each attacker and their corresponding blockers
      for (const [attacker, blockers] of Object.entries(attackerToBlockersMap)) {
        promises.push(
          // Fetch the attacker's stats from the database
          pool.query('SELECT attack, defense FROM cards WHERE card_id = $1', [OppMap[attacker]])
            .then(res => {
              const attackerStats = res.rows[0];
              let attackerDefense = attackerStats.defense;
              let attackerAttack = attackerStats.attack;
              console.log(attackerStats);

              // Array to store promises for each blocker's damage calculation
              const blockerPromises = blockers.map(blocker => {
                return pool.query('SELECT attack, defense FROM cards WHERE card_id = $1', [MyMap[blocker]])
                  .then(res => {
                    const blockerStats = res.rows[0];

                    // Emit event if the blocker dies
                    if (attackerAttack >= blockerStats.defense) {
                      io.to(roomId).emit("discard", { player: socket.id, card: blocker });
                    }
                    attackerAttack -= blockerStats.defense;
                    console.log(attackerAttack);

                    return blockerStats.attack;
                  });
              });

              // Wait for all blocker promises to resolve
              return Promise.all(blockerPromises).then(blockerResults => {
                console.log(blockerResults);
        
                totalDamage += Math.max(attackerAttack, 0);
                const totalBlockerAttack = blockerResults.reduce((sum, result) => sum + result, 0);


                // Reduce the attacker's defense by the total damage received
                attackerDefense -= totalBlockerAttack;

                // Emit event if the attacker dies
                if (attackerDefense <= 0) {
                  io.to(roomId).emit("discard", { player: opponentId,card: attacker });
                }
              });
            })
        );
      }

      // Wait for all attacker-blocker interactions to complete
      Promise.all(promises).then(() => {
        

        // Reduce the opponent's life by the total damage dealt
        room.lifes[socket.id] -= totalDamage;

        // Emit event to update the opponent's life
        io.to(roomId).emit("life", { player: socket.id, life: room.lifes[socket.id] });
        if (room.lifes[socket.id] <= 0) {
          const winner = room.players.find((p) => p.id === opponentId).username;
          io.to(roomId).emit("game_over", { message: `Game Over! ${winner} wins!` });
          delete rooms[roomId];
          return;
        }
        io.to(roomId).emit("last_phase");
      });
    });

    socket.on("end_turn", (roomId) => {
      const room = rooms[roomId];
      if (!room) return;
      const currentTurn = room.players[room.turn % 2].id;
      if (socket.id !== currentTurn) return;


       // Increment the turn counter and emit event to change the turn
       room.turn++;
       io.to(roomId).emit("turn_change", { turn: room.players[room.turn % 2].id });
      if (room.libraries[room.players[room.turn % 2].id].length === 0) {
       const winner = room.players.find((p) => p.id !== room.players[room.turn % 2].id).username;
       io.to(roomId).emit("game_over", { message: `Game Over! Library is empty. ${winner} wins!` });
       delete rooms[roomId];
       return;
     }
       io.to(room.players[room.turn % 2].id).emit("draw", room.libraries[room.players[room.turn % 2].id].pop());
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id}`);
      for (const roomId in rooms) {
        const room = rooms[roomId];
        const disconnectedPlayer = room.players.find((p) => p.id === socket.id);
        if (disconnectedPlayer) {
          // Notify the other player that the game has ended
          room.players.forEach((player) => {
            if (player.id !== socket.id) {
              io.to(player.id).emit("game_ended", { message: "Game Ended. A player disconnected." });
            }
          });
          // Clean up the room
          delete rooms[roomId];
        }
      }
    });
  });

  return io;
};

module.exports = initSocket;