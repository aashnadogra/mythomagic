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
  const [cardColors, setCardColors] = useState({}); // Stores { cardId: "color" }
  const [opponentSelectedCards, setOpponentSelectedCards] = useState({}); // State for opponent selected cards

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
  }, []);

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
      // Clear all visual selections when turn changes
      setCardColors({});
      setOpponentSelectedCards({});
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

    // Handling opponent's card selections
    socket.on("card_selected", ({ cardId, color, selectionType }) => {
      setOpponentSelectedCards(prev => ({
        ...prev,
        [cardId]: { color, selectionType }
      }));
    });

    socket.on("card_deselected", ({ cardId }) => {
      setOpponentSelectedCards(prev => {
        const newSelectedCards = { ...prev };
        delete newSelectedCards[cardId];
        return newSelectedCards;
      });
    });

    socket.on("selection_reset", () => {
      setOpponentSelectedCards({});
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
      socket.off("card_selected");
      socket.off("card_deselected");
      socket.off("selection_reset");
    };
  }, [navigate, turn, myLibrary]);

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
      // Don't reset selections here - keep them visible to opponent
      // We'll only reset when turn changes
    } else if (buttonText === "Declare Blockers") {
      setSelectingBlockers(true);
      setButtonText("Confirm Block");
    } else if (buttonText === "Confirm Block") {
      setSelectingBlockers(false);
      setButtonText("");
      socket.emit("declare_block", { roomId, attackerToBlockersMap });
      // Don't reset selections here either
    } else if (buttonText === "End Turn") {
      setButtonText("");
      // Reset all selections when ending turn
      setCardColors({});
      socket.emit("selection_reset", { roomId });
      socket.emit("end_turn", roomId);
    }
  };

  // Utility function to generate random color
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleMyCardClick = (card) => {
    if (selectingAttackers) {
      if (selectedAttackers.includes(card)) {
        setSelectedAttackers(selectedAttackers.filter((c) => c !== card));
        setCardColors((prevColors) => {
          const newColors = { ...prevColors };
          delete newColors[card]; // Remove color when deselecting
          return newColors;
        });
        // Emit card deselection to opponent
        socket.emit("card_deselected", { roomId, cardId: card });
      } else {
        const randomColor = getRandomColor();
        setSelectedAttackers([...selectedAttackers, card]);
        setCardColors((prevColors) => ({
          ...prevColors,
          [card]: randomColor, // Assign color to selected card
        }));
        // Emit card selection to opponent with color and type
        socket.emit("card_selected", { 
          roomId, 
          cardId: card, 
          color: randomColor,
          selectionType: "attacker" 
        });
      }
    }

    if (selectingBlockers) {
      const isAlreadyBlocker = Object.values(attackerToBlockersMap).some((blockers) =>
        blockers.includes(card)
      );

      if (isAlreadyBlocker) {
        setAttackerToBlockersMap((prevMap) => {
          const newMap = { ...prevMap };
          for (const attacker in newMap) {
            newMap[attacker] = newMap[attacker].filter((blocker) => blocker !== card);
          }
          return newMap;
        });
        setCardColors((prevColors) => {
          const newColors = { ...prevColors };
          delete newColors[card]; // Remove color when deselecting
          return newColors;
        });
        // Emit card deselection to opponent
        socket.emit("card_deselected", { roomId, cardId: card });
      } else if (attackerToBlock) {
        const attackerColor = cardColors[attackerToBlock] || getRandomColor();
        setAttackerToBlockersMap((prevMap) => ({
          ...prevMap,
          [attackerToBlock]: [...(prevMap[attackerToBlock] || []), card],
        }));
        setCardColors((prevColors) => ({
          ...prevColors,
          [card]: attackerColor, // Assign same color as attacker
        }));
        // Emit card selection to opponent with color and type
        socket.emit("card_selected", { 
          roomId, 
          cardId: card, 
          color: attackerColor,
          selectionType: "blocker" 
        });
      }
    }
  };

  const handleOpponentCardClick = (card) => {
    if (selectingBlockers) {
      if (attackersDeclared.includes(card)) {
        setAttackerToBlock(card);
        const randomColor = cardColors[card] || getRandomColor();
        setCardColors((prevColors) => ({
          ...prevColors,
          [card]: randomColor, // Assign color to opponent's card
        }));
        // Emit card selection to opponent with color and type
        socket.emit("card_selected", { 
          roomId, 
          cardId: card, 
          color: randomColor,
          selectionType: "blocking-target" 
        });
      }
    }
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
              {opponentPlayedCards.map((card) => {
                // Check if this card is selected by the opponent and highlight accordingly
                const isOpponentSelecting = opponentSelectedCards[card];
                const borderStyle = isOpponentSelecting ? 
                  `3px solid ${isOpponentSelecting.color}` : 
                  (attackersDeclared.includes(card) ? "3px solid #ff0000" : "none");
                
                const boxShadowStyle = isOpponentSelecting || attackersDeclared.includes(card) ?
                  "0 0 10px rgba(255,255,255,0.8)" : "none";
                
                return (
                  <motion.img
                    key={card}
                    src={`/cards/${opponentCardMap[card]}.png`}
                    alt={card}
                    style={{
                      width: "100px", 
                      margin: "10px", 
                      borderRadius: "8px",
                      border: borderStyle,
                      boxShadow: boxShadowStyle
                    }}
                    className="card"
                    whileHover={{ scale: 1.1, y: -10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleOpponentCardClick(card)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                );
              })}
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
              {myPlayedCards.map((card) => {
                const isAttacker = selectedAttackers.includes(card);
                const isBlocker = Object.values(attackerToBlockersMap).some(blockers => blockers.includes(card));
                const isSelected = isAttacker || isBlocker;
                const cardColor = cardColors[card] || "#ff0000";
                // Check if this card is also being visually selected by opponent
                const isOpponentSelecting = opponentSelectedCards[card];
                const finalBorderColor = isOpponentSelecting ? isOpponentSelecting.color : (isSelected ? cardColor : "none");
                const finalBoxShadow = (isSelected || isOpponentSelecting) ? "0 0 10px rgba(255,255,255,0.8)" : "none";

                return (
                  <motion.img
                    key={card}
                    src={`/cards/${myCardMap[card]}.png`}
                    alt={card}
                    className="card"
                    whileHover={{ scale: 1.1, y: -10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMyCardClick(card)}
                    style={{
                      width: "100px",
                      margin: "10px",
                      borderRadius: "8px",
                      border: finalBorderColor !== "none" ? `3px solid ${finalBorderColor}` : "none",
                      boxShadow: finalBoxShadow,
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                );
              })}
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
                display: buttonText ? "inline-block" : "none" // Hide when no text
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