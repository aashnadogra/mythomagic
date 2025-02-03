import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreatingNewGame, setIsCreatingNewGame] = useState(false);
  const [isJoiningExistingGame, setIsJoiningExistingGame] = useState(false);

  const handleCreateNewGame = () => {
    setIsCreatingNewGame(true);
    setIsJoiningExistingGame(false);
  };

  const handleJoinExistingGame = () => {
    setIsJoiningExistingGame(true);
    setIsCreatingNewGame(false);
  };

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
    if (isJoiningExistingGame && !roomId.trim()) {
      alert("Please enter a game code");
      return;
    }
    // Store username and roomId in localStorage
    localStorage.setItem("username", username);
    localStorage.removeItem("roomId");
    if (isJoiningExistingGame) {
      localStorage.setItem("roomId", roomId);
    }
    navigate("/game");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Game Dashboard</h2>
      <div style={{ marginTop: "20px" }}>
        {!isCreatingNewGame && !isJoiningExistingGame ? (
          <div>
            <button
              onClick={handleCreateNewGame}
              style={{
                padding: "8px 16px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                margin: "5px",
              }}
            >
              Create New Game
            </button>
            <button
              onClick={handleJoinExistingGame}
              style={{
                padding: "8px 16px",
                fontSize: "16px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                margin: "5px",
              }}
            >
              Join Existing Game
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username"
              style={{
                padding: "8px",
                margin: "10px",
                fontSize: "16px",
              }}
            />
            {isJoiningExistingGame && (
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Game Code"
                style={{
                  padding: "8px",
                  margin: "10px",
                  fontSize: "16px",
                }}
              />
            )}
            <button
              onClick={handleJoinRoom}
              style={{
                padding: "8px 16px",
                fontSize: "16px",
                backgroundColor: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isCreatingNewGame ? "Create and Join Game" : "Join Game"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;