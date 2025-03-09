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
  const [waitingForOpponent, setWaitingForOpponent] = useState(true);
  const [gameCode, setGameCode] = useState("");
  const [myCardColors, setMyCardColors] = useState({}); // Stores { cardId: "color" }
  const [opponentCardColors, setOpponentCardColors] = useState({}); // Stores { cardId: "color" }
  const [rishis, setRishis] = useState([]);
  const [opponentRishis, setOpponentRishis] = useState([]);
  const [myTappedRishis, setMyTappedRishis] = useState([]);
  const [opponentTappedRishis, setOpponentTappedRishis] = useState([]);

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
        setHand(hand.filter((c) => c !== card));
        setMyPlayedCards((prev) => [...prev, card]);
      } else {
        setOpponentCardMap((prev) => {
          const newMap = { ...prev, [card]: map };
          return newMap;
        });
        setOpponentPlayedCards((prev) => [...prev, card]);
      }
    });


    socket.on("rishi", ({ player, card, map }) => {
      if (player === socket.id) {
        setRishis((prev) => [...prev, card]);
        setHand(hand.filter((c) => c !== card));
      } else {
        setOpponentCardMap((prev) => {
          const newMap = { ...prev, [card]: map };
          return newMap;
        });
        setOpponentRishis((prev) => [...prev, card]);
      }
    });

    socket.on("tap", ({ player, card }) => {
      if (player === socket.id) {
        setMyTappedRishis((prev) => [...prev, card]);
      }
      else {
        setOpponentTappedRishis((prev) => [...prev, card]);
      }
    });

    socket.on("untap", ({ player }) => {
      if (player === socket.id) {
        setMyTappedRishis([]);
      }
      else {
        setOpponentTappedRishis([]);
      }
    });

    socket.on("not_enough_resorces", ({ card, msg }) => {
      alert(msg);
    }
    );

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

    socket.on("room_not_found", () => {
      alert("Room not found. Please try again.");
      navigate("/dashboard");
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
      setMyCardColors({});
      setOpponentCardColors({});
      if (socket.id === turn) {
        setButtonText("End Turn");
      }
    });

    // Handling opponent's card selections
    socket.on("card_selected", ({ cardId, color }) => {
      if ((turn === socket.id && !attackDeclared) || (turn !== socket.id && selectingBlockers)) {
        console.log("Opponent selected card", cardId);
        setMyCardColors((prevColors) => {
          const newColors = { ...prevColors, [cardId]: color };
          return newColors;
        });
      }
      else {
        setOpponentCardColors((prevColors) => {
          const newColors = { ...prevColors, [cardId]: color };
          return newColors;
        }
        );
      }

    });

    socket.on("card_deselected", ({ cardId }) => {
      if (turn === socket.id) {
        setMyCardColors((prevColors) => {
          const newColors = { ...prevColors };
          delete newColors[cardId]; // Remove color when deselecting
          return newColors;
        });
      }
      else {
        setOpponentCardColors((prevColors) => {
          const newColors = { ...prevColors };
          delete newColors[cardId]; // Remove color when deselecting
          return newColors;
        }
        );
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
      socket.off("card_selected");
      socket.off("card_deselected");
      socket.off("room_not_found");
      socket.off("rishi");
      socket.off("tap");
      socket.off("untap");
      socket.off("not_enough_resorces");

    };
  }, [navigate, turn, myLibrary, lastPhase, myPlayedCards, hand, myLife, selectedAttackers, selectedAttackers, myCardMap, attackDeclared, buttonText, attackersDeclared, selectingBlockers, attackerToBlock, attackerToBlockersMap, myDiscardCards, opponentDiscardCards, opponentLife, opponentPlayedCards, opponentCardMap, myCardColors, opponentCardColors, rishis, opponentRishis, myTappedRishis, opponentTappedRishis]);

  const playCard = (card) => {
    if (turn !== socket.id) return;
    if (selectingAttackers) return;
    socket.emit("play_card", { roomId, card });
    
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
      setAttackerToBlock(null);
      // Don't reset selections here either
    } else if (buttonText === "End Turn") {
      setButtonText("");
      // Reset all selections when ending turn
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
        socket.emit("card_deselected", { roomId, cardId: card });
      } else {
        let randomColor = getRandomColor();
        setSelectedAttackers([...selectedAttackers, card]);
        socket.emit("card_selected", {
          roomId,
          cardId: card,
          color: randomColor,
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
        socket.emit("card_deselected", { roomId, cardId: card });
      } else if (attackerToBlock) {
        const attackerColor = opponentCardColors[attackerToBlock] || getRandomColor();
        setAttackerToBlockersMap((prevMap) => ({
          ...prevMap,
          [attackerToBlock]: [...(prevMap[attackerToBlock] || []), card],
        }));
        // Emit card selection to opponent with color and type
        socket.emit("card_selected", {
          roomId,
          cardId: card,
          color: attackerColor,
        });
      }
    }
  };

  const handleOpponentCardClick = (card) => {
    if (selectingBlockers) {
      if (attackersDeclared.includes(card)) {

        setAttackerToBlock(card);

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
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "20px",
              padding: "20px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Opponent's Played Cards */}
            <div style={{ flex: 1 }}>
              <h3>Opponent's Cards</h3>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                {opponentPlayedCards.map((card) => {
                  const borderStyle = opponentCardColors[card] ? `6px solid ${opponentCardColors[card]}` : "none";
                  const boxShadowStyle = card === attackerToBlock ? "0 0 25px rgba(240, 26, 26, 0.8)" : (opponentCardColors[card] ? "0 0 10px rgba(255,255,255,0.8)" : "none");

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

            {/* Opponent's Rishis */}
            <div style={{ flex: 1 }}>
              <h3>Opponent's Rishis</h3>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                {opponentRishis.map((card) => (
                  <motion.img
                    key={card}
                    src={`/cards/${opponentCardMap[card]}.png`}
                    alt={card}
                    style={{
                      width: "100px",
                      margin: "10px",
                      borderRadius: "8px",
                      filter: opponentTappedRishis.includes(card) ? "grayscale(100%)" : "none",
                      transform: opponentTappedRishis.includes(card) ? "rotate(90deg)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Player's Play Area */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "20px",
              padding: "20px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3>Your Cards</h3>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                {myPlayedCards.map((card) => {
                  const borderStyle = myCardColors[card] ? `6px solid ${myCardColors[card]}` : "none";
                  const boxShadowStyle = myCardColors[card] ? "0 0 10px rgba(255,255,255,0.8)" : "none";

                  return (
                    <motion.img
                      key={card}
                      src={`/cards/${myCardMap[card]}.png`}
                      alt={card}
                      style={{
                        width: "100px",
                        margin: "10px",
                        borderRadius: "8px",
                        border: borderStyle,
                        boxShadow: boxShadowStyle,
                      }}
                      whileHover={{ scale: 1.1, y: -10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMyCardClick(card)}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Player's Rishis */}
            <div style={{ flex: 1 }}>
              <h3>Your Rishis</h3>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                {rishis.map((card) => (
                  <motion.img
                    key={card}
                    src={`/cards/${myCardMap[card]}.png`}
                    alt={card}
                    style={{
                      width: "100px",
                      margin: "10px",
                      borderRadius: "8px",
                      filter: myTappedRishis.includes(card) ? "grayscale(100%)" : "none",
                      transform: myTappedRishis.includes(card) ? "rotate(90deg)" : "none",
                    }}
                  />
                ))}
              </div>
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