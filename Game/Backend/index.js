// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { loginUser, signupUser } = require('./auth');
const { authenticateToken } = require('./middleware');
const initSocket = require('./socket');
const { startGame, endGame } = require('./gameLogic');
const db = require('./db');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Login route
app.post('/login', loginUser);

// Sign up route
app.post('/signup', signupUser);

// Protected route example
app.get('/dashboard', authenticateToken, (req, res) => {
  res.send(`Welcome to your dashboard, ${req.user.username}!`);
});

// Game Routes
app.post('/game/start', authenticateToken, (req, res) => {
  const { players } = req.body;
  startGame(players);
  res.status(200).json({ message: 'Game started!' });
});

app.post('/game/end', authenticateToken, (req, res) => {
  const { winner } = req.body;
  endGame(winner);
  res.status(200).json({ message: 'Game ended!' });
});

// Start server and socket
const io = initSocket(server);
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

module.exports = { db, io };
