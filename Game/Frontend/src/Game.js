import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const Game = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [hand, setHand] = useState([]);
  const [myPlayedCards, setMyPlayedCards] = useState([]);
  const [opponentPlayedCards, setOpponentPlayedCards] = useState([]);
  const [turn, setTurn] = useState(null);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [gameCode, setGameCode] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRoomId = localStorage.getItem("roomId");
    if (storedUsername) {
      if (storedRoomId) {
        
        socket.emit("join_room", storedRoomId, storedUsername, false);
      }
      else{
        socket.emit("join_room", storedRoomId, storedUsername, true);
      }
      setUsername(storedUsername);

      socket.on("room_created", (roomId) => {
        setRoomId(roomId);
      });
    }

    socket.on("game_start", ({ players, turn }) => {
      setPlayers(players);
      setTurn(turn);
      setWaitingForOpponent(false);
    });

    socket.on("card_played", ({ player, card, turn }) => {
      if (player === socket.id) {
        setMyPlayedCards((prev) => [...prev, card]);
      } else {
        setOpponentPlayedCards((prev) => [...prev, card]);
      }
      setTurn(turn);
    });

    socket.on("game_over", ({ message }) => {
      alert(message);
      navigate("/dashboard");
    });

    socket.on("game_ended", ({ message }) => {
      alert(message);
      navigate("/dashboard");
    });

    socket.on("hand", (cards) => {
      setHand(cards);
    });

    socket.on("waiting_for_opponent", (code) => {
      setWaitingForOpponent(true);
      setGameCode(code);
    });

    return () => {
      socket.off("game_start");
      socket.off("card_played");
      socket.off("game_over");
      socket.off("game_ended");
      socket.off("hand");
      socket.off("waiting_for_opponent");
    };
  }, [navigate]);

  const playCard = (card) => {
    if (turn !== socket.id) return;
    socket.emit("play_card", { roomId, card });
    setHand(hand.filter((c) => c !== card));
  };

  return (
    <div
      className="game-container"
      style={{
        textAlign: "center",
        padding: "20px",
        background: "linear-gradient(to bottom, #0a3d62, #1e3c72)",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
        MythoMagic
      </h1>

      {waitingForOpponent ? (
        <div>
          <h3>Waiting for opponent to join...</h3>
          <h4>Game Code: {gameCode}</h4>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h3>Players: {players.join(", ")}</h3>
            <h3 style={{ color: turn === socket.id ? "#4caf50" : "#ff5722" }}>
              {turn === socket.id ? "Your Turn" : "Opponent's Turn"}
            </h3>
          </div>

          {/* Opponent's Play Area */}
          <div
            style={{
              marginBottom: "20px",
              padding: "20px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>Opponent's Cards</h3>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              {opponentPlayedCards.map((card, index) => (
                <motion.img
                  key={index}
                  src={`/cards/${card}`}
                  alt={card}
                  style={{ width: "100px", margin: "10px", borderRadius: "8px" }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
          </div>

          {/* Player's Play Area */}
          <div
            style={{
              marginBottom: "20px",
              padding: "20px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>Your Cards</h3>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              {myPlayedCards.map((card, index) => (
                <motion.img
                  key={index}
                  src={`/cards/${card}`}
                  alt={card}
                  style={{ width: "100px", margin: "10px", borderRadius: "8px" }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
          </div>

          {/* Player's Hand */}
          <div
            style={{
              padding: "20px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>Your Hand</h3>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              {hand.map((card) => (
                <motion.img
                  key={card}
                  src={`/cards/${card}`}
                  alt={card}
                  className="card"
                  whileHover={{ scale: 1.1, y: -10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => playCard(card)}
                  style={{
                    width: "100px",
                    margin: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Game;