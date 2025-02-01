import React, { useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./Homepage.css"; // Ensure the CSS file is correctly imported

const Homepage = () => {
  useEffect(() => {
    const snowContainer = document.querySelector(".mythomagic");
    if (snowContainer) {
      for (let i = 0; i < 9; i++) {
        const snowflake = document.createElement("span");
        snowContainer.appendChild(snowflake);
      }
    }
  }, []);

  return (
    <div className="homepage-container">
      <h1>MythoMagic</h1>
      <div className="mythomagic"></div>
      
      <div className="auth-buttons">
        {/* Link for Login and Sign Up */}
        <Link to="/login" className="auth-button">Login</Link>
        <Link to="/signup" className="auth-button">Sign Up</Link>
      </div>
    </div>
  );
};

export default Homepage;
