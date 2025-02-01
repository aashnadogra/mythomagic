import React, { useState } from "react";
import axios from "axios";
import "./Login.css";  // Reuse the same CSS file for styling

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");  // Display errors here

  // Handle changes to username, password, and email fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
    if (name === "email") setEmail(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Sending username, password, and email to the backend for signup
      const response = await axios.post("http://localhost:5000/signup", {
        username,
        password,
        email
      });

      // On success, log the message
      setErrorMessage("");  // Clear any previous error messages
      console.log("Account created successfully:", response.data.message); // Backend response message

      // Optionally, you can redirect the user to the login page after successful signup
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Error during signup:", error);
      
      // Handle error: either show a specific error message or a generic one
      setErrorMessage(error.response ? error.response.data.error : "Signup failed. Please try again.");
    }
  };

  return (
    <div className="login-box">
      <h2>Sign Up</h2>
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
        <div className="user-box">
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
          <label>Email</label>
        </div>
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default SignUp;
