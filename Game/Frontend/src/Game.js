import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const Game = () => {
  const [players, setPlayers] = useState([]);
  const [message, setMessage] = useState("");
  const [buttonClicks, setButtonClicks] = useState({});
  const [username, setUsername] = useState("");
  const [roomId] = useState("room1"); // Using fixed room1 as in Dashboard

  useEffect(() => {
    // Get username from localStorage or URL params if needed
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      socket.emit("join_room", roomId, storedUsername);
    }

    socket.on("game_status", (data) => {
      setPlayers(data.players);
      setButtonClicks(data.buttonClicks || {});
    });

    socket.on("room_full", (msg) => {
      setMessage(msg);
    });

    socket.on("button_selected", ({ buttonClicks }) => {
      setButtonClicks(buttonClicks);
    });

    return () => {
      socket.off("game_status");
      socket.off("room_full");
      socket.off("button_selected");
    };
  }, [roomId]);

  const handleButtonClick = (button) => {
    socket.emit("select_button", { roomId, button, username });
  };

  const getButtonLabel = (button) => {
    if (buttonClicks[button]) {
      return `${button} (Selected by ${buttonClicks[button]})`;
    }
    return button;
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Game Room: {roomId}</h2>
      {message && <h3>{message}</h3>}
      <h4>Players: {players.join(", ")}</h4>

      <div style={{ marginTop: "20px" }}>
        {["A", "B", "C"].map((button) => (
          <button
            key={button}
            onClick={() => handleButtonClick(button)}
            style={{
              backgroundColor: buttonClicks[button] ? "black" : "white",
              color: buttonClicks[button] ? "white" : "black",
              fontSize: "20px",
              margin: "10px",
              padding: "15px 30px",
              border: "2px solid black",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            disabled={buttonClicks[button]}
          >
            {getButtonLabel(button)}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Button Selections:</h3>
        {Object.entries(buttonClicks).map(([button, user]) => (
          <p key={button}>
            Button {button} was selected by {user}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Game;