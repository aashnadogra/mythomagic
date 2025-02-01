import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleJoinRoom = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    // Store username in localStorage
    localStorage.setItem("username", username);
    navigate("/game");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Game Dashboard</h2>
      <div style={{ marginTop: "20px" }}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Enter Username"
          style={{
            padding: "8px",
            marginRight: "10px",
            fontSize: "16px"
          }}
        />
        <button 
          onClick={handleJoinRoom}
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default Dashboard;