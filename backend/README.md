# Backend Setup

Follow these steps to set up and run the backend of your project.

## 1. Install Node.js and PostgreSQL
Make sure **Node.js** and **PostgreSQL** are installed on your system before proceeding.

---

## 2. Initialize the Backend Directory
Run the following commands to create and initialize the backend:

```bash
mkdir backend
cd backend
npm init -y

Install Dependencies
Install the required dependencies for the backend:

npm install express pg bcrypt jsonwebtoken dotenv body-parser cors
npm install --save-dev nodemon


Set Up PostgreSQL Database
Follow these steps to configure the PostgreSQL database:

Log in to the PostgreSQL CLI:

bash
psql -U postgres


Create a new database:

sql
CREATE DATABASE your_database_name;
Switch to the new database:

sql
\c your_database_name



Create a table for users:

sql

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);


Create a new PostgreSQL user and grant privileges:

sql

CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;

Configure the .env File
Create a .env file in the backend directory with the following content:

makefile
PORT=5000
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
JWT_SECRET=your_jwt_secret
Replace your_username, your_password, your_database_name, and your_jwt_secret with your actual values.

6. Start the Server
Run the server using the following command:

bash

npx nodemon index.js

You can now access the backend at http://localhost:5000.


