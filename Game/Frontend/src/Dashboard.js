import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usernameToAdd, setUsernameToAdd] = useState(""); // State to store the username to add
  const [errorMessage, setErrorMessage] = useState(""); // To show errors when joining the game

  // Check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");  // Redirect to login if no token
    } else {
      setLoading(false);  // User is authenticated, allow dashboard access
    }
  }, [navigate]);

  // Handle the join game process
  const handleJoinGame = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");  // If no token, redirect to login page
      return;
    }

    try {
      // Make the API call to join the game
      const response = await axios.post(
        "http://localhost:5000/api/game/join", 
        { username: usernameToAdd },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Pass the token in the headers
          },
        }
      );

      console.log(response.data);
      navigate("/game");  // Navigate to the game page after joining
    } catch (error) {
      console.error("Error during joining the game:", error);
      setErrorMessage("Failed to join the game. Please try again.");  // Handle error
    }
  };

  // Show loading indicator until we validate the token
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome to the Dashboard!</h2>
      {/* Add a form or input to add a username to join the game */}
      <div>
        <input
          type="text"
          value={usernameToAdd}
          onChange={(e) => setUsernameToAdd(e.target.value)} // Update the state as user types
          placeholder="Enter username to join"
        />
        <button onClick={handleJoinGame}>Join Game</button>
      </div>

      {/* Display error message if any */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Dashboard;
