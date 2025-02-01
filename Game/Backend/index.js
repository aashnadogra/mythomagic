const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { loginUser, signupUser } = require("./auth");
const { authenticateToken } = require("./middleware");
const initSocket = require("./socket");

dotenv.config();
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/login", loginUser);
app.post("/signup", signupUser);

// Protected Dashboard Route
app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!` });
});

// Initialize Socket.io
const io = initSocket(server);

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

module.exports = { io };
