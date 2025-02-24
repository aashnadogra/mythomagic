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
  const [myLife, setMyLife] = useState(20);
  const [opponentLife, setOpponentLife] = useState(20);
  const [myLibrary, setMyLibrary] = useState([]);
  const [myCardMap, setMyCardMap] = useState({});
  const [opponentCardMap, setOpponentCardMap] = useState({});
  const [selectingAttackers, setSelectingAttackers] = useState(false);
  const [selectedAttackers, setSelectedAttackers] = useState([]);
  const [attackDeclared, setAttackDeclared] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [lastPhase, setLastPhase] = useState(false);
  const [attackersDeclared, setAttackersDeclared] = useState([]);
  const [selectingBlockers, setSelectingBlockers] = useState(false);
  const [attackerToBlock, setAttackerToBlock] = useState(null);
  const [attackerToBlockersMap, setAttackerToBlockersMap] = useState({});
  const [myDiscardCards, setMyDiscardCards] = useState([]);
  const [opponentDiscardCards, setOpponentDiscardCards] = useState([]);
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
      else {
        socket.emit("join_room", storedRoomId, storedUsername, true);
      }
      setUsername(storedUsername);

    }
    
  } , []);

  useEffect(() => {


    socket.on("room_created", (roomId) => {
      setRoomId(roomId);
    });

    socket.on("game_start", ({ players, turn }) => {
      setPlayers(players);

      setTurn(turn);
      if (turn === socket.id) {
        setButtonText("Declare Attackers");
      }
      setWaitingForOpponent(false);
    });

    socket.on("card_played", ({ player, card, map }) => {
      if (player === socket.id) {
        setMyPlayedCards((prev) => [...prev, card]);
      } else {
        setOpponentCardMap((prev) => {
          const newMap = { ...prev, [card]: map };
          return newMap;
        });
        setOpponentPlayedCards((prev) => [...prev, card]);
      }
    });

    socket.on("turn_change", ({ turn }) => {
      setTurn(turn);
      setSelectingAttackers(false);
      setSelectingBlockers(false);
      setAttackDeclared(false);
      setLastPhase(false);
      setAttackersDeclared([]);
      setAttackerToBlock(null);
      setAttackerToBlockersMap({});
      setSelectedAttackers([]);
      if (turn === socket.id) {
        setButtonText("Declare Attackers");
      } else {
        setButtonText("");
      }
    });

    socket.on("game_over", ({ message }) => {
      alert(message);
      navigate("/dashboard");
    });

    socket.on("game_ended", ({ message }) => {
      alert(message);
      navigate("/dashboard");
    });

    socket.on("life", ({ player, life }) => {
      if (player === socket.id) {
        setMyLife(life);
      } else {
        setOpponentLife(life);
      }
    });

    socket.on("library", ({ library, cardMap }) => {
      setMyLibrary(library);
      setMyCardMap(cardMap);
    });

    socket.on("discard", ({ player, card }) => {
      if (player === socket.id) {
        setMyDiscardCards((prev) => [...prev, card]);
        setMyPlayedCards((prev) => prev.filter((c) => c !== card));
      } else {
        setOpponentDiscardCards((prev) => [...prev, card]);
        setOpponentPlayedCards((prev) => prev.filter((c) => c !== card));
      }
    });

    socket.on("draw", (card) => {
      setHand((prev) => [...prev, card]);
      setMyLibrary(myLibrary.filter((c) => c !== card));
    });

    // socket.on("hand", (cards) => {
    //   setHand(cards);
    // });

    socket.on("waiting_for_opponent", (code) => {
      setWaitingForOpponent(true);
      setGameCode(code);
    });

    socket.on("attack_declared", ({ attackers }) => {
      setAttackersDeclared(attackers);
      if (socket.id !== turn) {
        setButtonText("Declare Blockers");
      }
    });

    socket.on("last_phase", () => {
      setLastPhase(true);
      if (socket.id === turn) {
        setButtonText("End Turn");
      }
    });


    return () => {
      socket.off("room_created");
      socket.off("game_start");
      socket.off("card_played");
      socket.off("game_over");
      socket.off("game_ended");
      socket.off("waiting_for_opponent");
      socket.off("attack_declared");
      socket.off("last_phase");
      socket.off("turn_change");
      socket.off("life");
      socket.off("library");
      socket.off("discard");
      socket.off("draw");
    };
  }, [navigate, turn, myLibrary, lastPhase, myPlayedCards, hand, myLife, selectedAttackers, selectedAttackers, myCardMap, attackDeclared, buttonText,attackersDeclared, selectingBlockers, attackerToBlock, attackerToBlockersMap, myDiscardCards, opponentDiscardCards, opponentLife, opponentPlayedCards, opponentCardMap]);

  const playCard = (card) => {
    if (turn !== socket.id) return;
    if (selectingAttackers) return;
    socket.emit("play_card", { roomId, card });
    setHand(hand.filter((c) => c !== card));
  };

  const handleButtonPress = () => {
    if (buttonText === "Declare Attackers") {
      setSelectingAttackers(true);
      setButtonText("Confirm Attack");
    } else if (buttonText === "Confirm Attack") {
      setSelectingAttackers(false);
      setButtonText("");
      setAttackDeclared(true);
      setAttackersDeclared(selectedAttackers);
      socket.emit("declare_attack", { roomId, attackers: selectedAttackers });
    } else if (buttonText === "Declare Blockers") {
      setSelectingBlockers(true);
      setButtonText("Confirm Block");
    } else if (buttonText === "Confirm Block") {
      setSelectingBlockers(false);
      setButtonText("");
      socket.emit("declare_block", { roomId, attackerToBlockersMap });
    } else if (buttonText === "End Turn") {
      setButtonText("");
      socket.emit("end_turn", roomId);
    }
  };

  const handleMyCardClick = (card) => {
    if (selectingAttackers) {
      if (selectedAttackers.includes(card)) {
        setSelectedAttackers(selectedAttackers.filter((c) => c !== card));
      } else {
        setSelectedAttackers([...selectedAttackers, card]);
      }
    }
    if (selectingBlockers) {
      const isAlreadyBlocker = Object.values(attackerToBlockersMap).some(blockers => blockers.includes(card));
      if (isAlreadyBlocker) {
        setAttackerToBlockersMap((prevMap) => {
          const newMap = { ...prevMap };
          for (const attacker in newMap) {
            newMap[attacker] = newMap[attacker].filter((blocker) => blocker !== card);
          }
          return newMap;
        });
      }

      if (attackerToBlock) {
        setAttackerToBlockersMap((prevMap) => ({
          ...prevMap,
          [attackerToBlock]: [
            ...(prevMap[attackerToBlock] || []),
            card
          ]
        }));
      }
    }
  };

  const handleOpponentCardClick = (card) => {
    if (selectingBlockers) {
      if (attackersDeclared.includes(card)) {
        setAttackerToBlock(card);
      }
    }
  }


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
            <h3>
              {"Your Life: " + myLife}
              <br />
              {"Opponent's Life: " + opponentLife}
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
              {opponentPlayedCards.map((card) => (
                <motion.img
                  key={card}
                  src={`/cards/${opponentCardMap[card]}.png`}
                  alt={card}
                  style={{ width: "100px", margin: "10px", borderRadius: "8px" }}
                  className="card"
                  whileHover={{ scale: 1.1, y: -10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleOpponentCardClick(card)}
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
              {myPlayedCards.map((card) => (
                <motion.img
                  key={card}
                  src={`/cards/${myCardMap[card]}.png`}
                  alt={card}
                  className="card"
                  whileHover={{ scale: 1.1, y: -10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleMyCardClick(card)}
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
                  src={`/cards/${myCardMap[card]}.png`}
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
          {/* Attack and Defend Button */}
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => handleButtonPress()}
              style={{
                padding: "8px 16px",
                fontSize: "16px",
                backgroundColor: "#FF5722",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                margin: "5px",
              }}
            >
              {buttonText}
            </button>

          </div>
        </>
      )}
    </div>
  );
};

export default Game;