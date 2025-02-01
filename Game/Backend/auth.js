// auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db'); // Import database connection

// Login route logic
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Username not found' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const { password: _, ...userData } = user;
    res.status(200).json({ message: 'Login successful', user: userData, token });

  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Error logging in', details: err.message });
  }
};

// Signup route logic
const signupUser = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, email]
    );

    const { password: _, ...userData } = result.rows[0];

    const token = jwt.sign({ id: userData.id, username: userData.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ message: 'User created successfully!', user: userData, token });

  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Error creating user', details: err.message });
  }
};

module.exports = { loginUser, signupUser };
