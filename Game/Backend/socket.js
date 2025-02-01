const socketIo = require("socket.io");

const rooms = {}; // Store game rooms

const initSocket = (server) => {
  const io = socketIo(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Handle joining a room
    socket.on("join_room", (roomId, username) => {
      if (!rooms[roomId]) {
        rooms[roomId] = { players: [], selected: null, buttonClicks: {} };
      }

      // Check if the room is full
      if (rooms[roomId].players.length >= 2) {
        socket.emit("room_full", "Game room is full");
        return;
      }

      // Add player to room
      const player = { id: socket.id, username };
      rooms[roomId].players.push(player);
      socket.join(roomId);

      // Notify all players in the room
      io.to(roomId).emit("game_status", {
        players: rooms[roomId].players.map((p) => p.username),
        selected: rooms[roomId].selected,
        buttonClicks: rooms[roomId].buttonClicks, // Include button clicks
      });

      // Notify when the room is full
      if (rooms[roomId].players.length === 2) {
        io.to(roomId).emit("room_full", "Room is now full. Game starts!");
      }
    });

    // Handle button selection
    socket.on("select_button", ({ roomId, button, username }) => {
      console.log(`Button selected in room ${roomId} by ${username}: ${button}`);

      if (rooms[roomId]) {
        // Track who clicked which button
        rooms[roomId].buttonClicks[button] = username;
        
        // Broadcast updated button clicks to the room
        io.to(roomId).emit("button_selected", { buttonClicks: rooms[roomId].buttonClicks });
      }
    });

    // Handle disconnects
    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id}`);
      for (const roomId in rooms) {
        rooms[roomId].players = rooms[roomId].players.filter((p) => p.id !== socket.id);
        if (rooms[roomId].players.length === 0) delete rooms[roomId];
      }
    });
  });

  return io;
};

module.exports = initSocket;
