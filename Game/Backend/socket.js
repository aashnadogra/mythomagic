const socketIo = require("socket.io");

const rooms = {}; // Store game rooms and player states

const getRandomCards = () => {
  const allCards = Array.from({ length: 28 }, (_, i) => `${i + 1}.jpg`);
  return allCards.sort(() => Math.random() - 0.5).slice(0, 5);
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
        rooms[finalRoomId] = { players: [], turns: 0, hands: {}, myPlayedCards: {}, opponentPlayedCards: {} };
      }

      const player = { id: socket.id, username };
      rooms[finalRoomId].players.push(player);
      rooms[finalRoomId].hands[socket.id] = getRandomCards();
      rooms[finalRoomId].myPlayedCards[socket.id] = [];
      rooms[finalRoomId].opponentPlayedCards[socket.id] = [];
      socket.join(finalRoomId);

      // Emit the hand to the player who just joined
      socket.emit("hand", rooms[finalRoomId].hands[socket.id]);

      if (rooms[finalRoomId].players.length === 1) {
        socket.emit("waiting_for_opponent", finalRoomId);
      } else if (rooms[finalRoomId].players.length === 2) {
        io.to(finalRoomId).emit("game_start", {
          message: "Room is now full. Game starts!",
          players: rooms[finalRoomId].players.map((p) => p.username),
          turn: rooms[finalRoomId].players[0].id,
        });
      }
    });

    socket.on("play_card", ({ roomId, card }) => {
      const room = rooms[roomId];
      if (!room) return;

      const currentTurn = room.players[room.turns % 2].id;
      if (socket.id !== currentTurn) return;

      room.myPlayedCards[socket.id].push(card);
      room.hands[socket.id] = room.hands[socket.id].filter((c) => c !== card);
      room.turns++;

      io.to(roomId).emit("card_played", {
        player: socket.id,
        card,
        turn: room.players[room.turns % 2].id,
      });

      if (room.hands[room.players[0].id].length === 0 && room.hands[room.players[1].id].length === 0) {
        io.to(roomId).emit("game_over", { message: "Game Over! All cards played." });
        delete rooms[roomId];
      }
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