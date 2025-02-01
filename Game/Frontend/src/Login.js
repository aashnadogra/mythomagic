import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");  // Display errors here

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
        password
      });

      // On success, log the message and token
      setErrorMessage("");  // Clear any previous error messages
      console.log("Token:", response.data.token);  // Token returned by backend

      // You can store the token for future use (like localStorage or sessionStorage)
      localStorage.setItem("authToken", response.data.token);  // Store token in localStorage
      window.location.href = "/dashboard"; // Redirect to the dashboard
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
