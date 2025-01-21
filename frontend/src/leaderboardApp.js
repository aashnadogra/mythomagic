const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set up PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
app.use(express.json()); // For parsing JSON request bodies
app.use(express.static('public')); // Serve static files like HTML, CSS, JS

const PORT = process.env.PORT || 3000;

// API endpoint to fetch leaderboard data
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.username, l.wins, l.losses, l.rank
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.rank;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
