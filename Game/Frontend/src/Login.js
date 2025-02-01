// Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import useNavigate from react-router-dom
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");  // Display errors here
  const navigate = useNavigate();  // Initialize useNavigate

  // Handle changes to username and password fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sending username and password to backend
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      console.log("Login response:", response.data);  // Log the response to check the structure

      // On success, log the message and token
      setErrorMessage(""); // Clear any previous error messages
      const token = response.data.token;
      console.log("Token:", token); // Check if token is valid

      if (token) {
        // Store the token for future use (localStorage or sessionStorage)
        localStorage.setItem("authToken", token);  // Store token in localStorage

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setErrorMessage("Token not received.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Handle error: either show a specific error message or a generic one
      setErrorMessage(error.response ? error.response.data.error : "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-box">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="user-box">
          <input
            type="text"
            name="username"
            value={username}
            onChange={handleChange}
            required
          />
          <label>Username</label>
        </div>
        <div className="user-box">
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
          <label>Password</label>
        </div>
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Login;
