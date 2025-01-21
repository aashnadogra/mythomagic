# Backend Setup Guide

## 1. Initialize Backend Directory
Run the following commands to set up the backend directory:

```bash
mkdir backend
cd backend
npm init -y
```
## 2. Install Dependencies
Install the required dependencies for the backend:

```bash

npm install express pg bcrypt jsonwebtoken dotenv body-parser cors
npm install --save-dev nodemon
```
## 3. Set Up PostgreSQL Database

Follow these steps to configure the PostgreSQL database:

Log in to the PostgreSQL CLI:

```bash

psql -U postgres
```
Create a new database:

```sql

CREATE DATABASE your_database_name;
```

Switch to the new database:

```sql

\c your_database_name
```
Create a table for users:
```sql

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```
Create a new PostgreSQL user and grant privileges:

```sql

CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
```

## 4. Configure the .env File
Create a .env file in the backend directory with the following content:

```env

PORT=5000
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
JWT_SECRET=your_jwt_secret
```
Replace your_username, your_password, your_database_name, and your_jwt_secret with your actual values.

## 5. Start the Server
Run the server using the following command:

```bash
npx nodemon index.js
```

You can now access the backend at http://localhost:5000.


# Backend setup for the leaderboard

## 1. Connect to database
```bash
--psql -U postgres
```
update the password

## 2. Create database called leaderboard
``` sql
--CREATE TABLE leaderboard
```

## 3. Connect to the database
``` sql
-- \c leaderboard
```

## 4. Create Users table
```sql
--CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Create gamers table
```sql
--CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    player1_id INT REFERENCES users(id) ON DELETE CASCADE,
    player2_id INT REFERENCES users(id) ON DELETE CASCADE,
    winner_id INT REFERENCES users(id) ON DELETE CASCADE,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. Create leaderboard table
```sql
--CREATE TABLE leaderboard (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    rank INT DEFAULT NULL
);
```

## 7. Inserting records to test
```sql
--INSERT INTO users (username, email) VALUES
('player1', 'player1@example.com'),
('player2', 'player2@example.com'),
('player3', 'player3@example.com');
```
```sql
--INSERT INTO games (player1_id, player2_id, winner_id) VALUES
(1, 2, 1),
(1, 3, 1),
(2, 3, 3);
```

## 8. Update leaderboard
```sql
--INSERT INTO leaderboard (user_id, wins, losses)
SELECT
    id,
    COALESCE(wins.wins, 0) AS wins,
    COALESCE(losses.losses, 0) AS losses
FROM users
LEFT JOIN (
    SELECT winner_id AS user_id, COUNT(*) AS wins
    FROM games
    GROUP BY winner_id
) wins ON users.id = wins.user_id
LEFT JOIN (
    SELECT 
        CASE 
            WHEN player1_id = winner_id THEN player2_id
            ELSE player1_id
        END AS user_id, COUNT(*) AS losses
    FROM games
    GROUP BY user_id
) losses ON users.id = losses.user_id
ON CONFLICT (user_id) DO UPDATE
SET
    wins = EXCLUDED.wins,
    losses = EXCLUDED.losses;
```

## 9. Update ranks
```sql
--UPDATE leaderboard
SET rank = subquery.rank
FROM (
    SELECT user_id, RANK() OVER (ORDER BY wins DESC, losses ASC) AS rank
    FROM leaderboard
) subquery
WHERE leaderboard.user_id = subquery.user_id;
```

## 10. Test the leaderboard
```sql
--SELECT u.username, l.wins, l.losses, l.rank
FROM leaderboard l
JOIN users u ON l.user_id = u.id
ORDER BY l.rank;
```












