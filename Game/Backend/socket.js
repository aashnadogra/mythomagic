const socketIo = require("socket.io");
const pool = require('./db');

const rooms = {}; // Store game rooms and player states
const deck1 = [6, 5, 4, 5, 2, 2, 4, 11, 6, 9, 7, 8, 9, 11, 7, 8, 14, 18, 14, 18 ]
const deck2 = [1, 1, 1, 1, 3, 3, 3, 3, 8, 8, 10, 10, 12, 12, 13, 15, 16, 15, 16, 13];
const mapCardIds = (i) => {
  const cardMap = {};
  let deck = []
  //shuffle deck1
  if (i % 2 == 0){
    deck = deck1.slice();
  }
  else{
    deck = deck2.slice();
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = deck1[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  for (let i = 1; i <= 20; i++) {
    cardMap[i] = deck[i-1];
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
        rooms[finalRoomId] = { 
          players: [], 
          turn: Math.floor(Math.random() * 2), 
          libraries: {}, 
          cardMaps: {}, 
          lifes: {}, 
          attackers: [],
          total_resorces: {},
          available_resorces: {},
          rishis:{},
          untapped_rishis:{}
        };
      }
 

      if (!rooms[finalRoomId]) {
        socket.emit("room_not_found");
        return
      }

      socket.emit("room_created", finalRoomId);
      const player = { id: socket.id, username };
      rooms[finalRoomId].players.push(player);
      socket.join(finalRoomId);

      // Emit library to the player who just joined
      let cardMap = mapCardIds(rooms[finalRoomId].players.length % 2);
      let library = Object.keys(cardMap);
      rooms[finalRoomId].libraries[socket.id] = library;
      rooms[finalRoomId].cardMaps[socket.id] = cardMap;
      rooms[finalRoomId].lifes[socket.id] = 20;
      rooms[finalRoomId].total_resorces[socket.id] = {'G':0, 'W':0, 'F':0, 'B':0};
      rooms[finalRoomId].available_resorces[socket.id] = {'G':0, 'W':0, 'F':0, 'B':0};
      rooms[finalRoomId].rishis[socket.id] = {'G': [], 'W': [], 'F': [], 'B': []};
      rooms[finalRoomId].untapped_rishis[socket.id] = {'G': [], 'W': [], 'F': [], 'B': []};
      
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

    // Add the new socket events for card selection syncing
    socket.on("card_selected", ({ roomId, cardId, color}) => {
      // Broadcast card selection to all other players in the room
      io.to(roomId).emit("card_selected", { cardId, color});
    });

    socket.on("card_deselected", ({ roomId, cardId }) => {
      // Broadcast card deselection to all other players in the room
      io.to(roomId).emit("card_deselected", { cardId });
    });


    socket.on("play_card", ({ roomId, card }) => {
      const room = rooms[roomId];
      if (!room) return;

      const currentTurn = room.players[room.turn % 2].id;
      if (socket.id !== currentTurn) return;

      pool.query('SELECT type, attack, defense, firecost, goldcost, woodcost, bloodcost, extracost, rtype FROM cards WHERE card_id = $1', [room.cardMaps[socket.id][card]])
        .then(res => {
          const cardStats = res.rows[0];
          if (cardStats.type === 'R'){
            room.total_resorces[socket.id][cardStats.rtype] += 1;
            room.available_resorces[socket.id][cardStats.rtype] += 1;
            room.rishis[socket.id][cardStats.rtype].push(card);
            room.untapped_rishis[socket.id][cardStats.rtype].push(card);
            io.to(roomId).emit("rishi", {
              player: socket.id,
              card,
              map: room.cardMaps[socket.id][card],
            });
          }
          else{
            if (room.available_resorces[socket.id]['F'] >= cardStats.firecost && room.available_resorces[socket.id]['G'] >= cardStats.goldcost && room.available_resorces[socket.id]['W'] >= cardStats.woodcost && room.available_resorces[socket.id]['B'] >= cardStats.bloodcost && (room.available_resorces[socket.id]['F'] + room.available_resorces[socket.id]['B'] + room.available_resorces[socket.id]['G'] + room.available_resorces[socket.id]['W']) - (cardStats.firecost + cardStats.goldcost + cardStats.woodcost + cardStats.bloodcost) >= cardStats.extracost){
              let fc = cardStats.firecost;
              let gc = cardStats.goldcost;
              let wc = cardStats.woodcost;
              let bc = cardStats.bloodcost;
              let ec = cardStats.extracost;
              while (fc >  0){
                room.available_resorces[socket.id]['F'] -= 1;
                fc -= 1;
                let card = room.untapped_rishis[socket.id]['F'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              while(ec > 0 && room.available_resorces[socket.id]['F'] > 0){
                room.available_resorces[socket.id]['F'] -= 1;
                ec -= 1;
                let card = room.untapped_rishis[socket.id]['F'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              while (gc >  0){
                room.available_resorces[socket.id]['G'] -= 1;
                gc -= 1;
                let card = room.untapped_rishis[socket.id]['G'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              while(ec > 0 && room.available_resorces[socket.id]['G'] > 0){
                room.available_resorces[socket.id]['G'] -= 1;
                ec -= 1;
                let card = room.untapped_rishis[socket.id]['G'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              while (wc >  0){
                room.available_resorces[socket.id]['W'] -= 1;
                wc -= 1;
                let card = room.untapped_rishis[socket.id]['W'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              while(ec > 0 && room.available_resorces[socket.id]['W'] > 0){
                room.available_resorces[socket.id]['W'] -= 1;
                ec -= 1;
                let card = room.untapped_rishis[socket.id]['W'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              while (bc >  0){
                room.available_resorces[socket.id]['B'] -= 1;
                bc -= 1;
                let card = room.untapped_rishis[socket.id]['B'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              while(ec > 0 && room.available_resorces[socket.id]['B'] > 0){
                room.available_resorces[socket.id]['B'] -= 1;
                ec -= 1;
                let card = room.untapped_rishis[socket.id]['B'].pop();
                io.to(roomId).emit("tap", { player: socket.id, card: card });
              }
              io.to(roomId).emit("card_played", {
                player: socket.id,
                card,
                map: room.cardMaps[socket.id][card],
              });
            }
            else{
              socket.emit("not_enough_resorces", {card: card, msg: "Not enough resorces to play card."});
            }
          }
        });

      
    });

    socket.on("declare_attack", ({ roomId, attackers }) => {
      const room = rooms[roomId];
      if (!room) return;

      const currentTurn = room.players[room.turn % 2].id;
      if (socket.id !== currentTurn) return;

      io.to(roomId).emit("attack_declared", { attackers });
      room.attackers = attackers;
    });

    socket.on("declare_block", ({ roomId, attackerToBlockersMap }) => {
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

                    return blockerStats.attack;
                  });
              });

              // Wait for all blocker promises to resolve
              return Promise.all(blockerPromises).then(blockerResults => {
        
                totalDamage += Math.max(attackerAttack, 0);
                const totalBlockerAttack = blockerResults.reduce((sum, result) => sum + result, 0);

                // Reduce the attacker's defense by the total damage received
                attackerDefense -= totalBlockerAttack;

                // Emit event if the attacker dies
                if (attackerDefense <= 0) {
                  io.to(roomId).emit("discard", { player: opponentId, card: attacker });
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
      let curr = room.players.find(p => p.id !== socket.id).id;
      io.to(roomId).emit("untap", { player: curr });
      room.available_resorces[curr] = {'G':room.total_resorces[curr]['G'], 'W':room.total_resorces[curr]['W'], 'F':room.total_resorces[curr]['F'], 'B':room.total_resorces[curr]['B']};
      room.untapped_rishis[curr] = {'G':room.rishis[curr]['G'].slice(), 'W':room.rishis[curr]['W'].slice(), 'F':room.rishis[curr]['F'].slice(), 'B':room.rishis[curr]['B'].slice()};
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