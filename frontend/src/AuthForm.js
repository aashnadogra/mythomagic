import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Ensure this path is correct

const AuthForm = () => {
  const [signInData, setSignInData] = useState({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    repeatPassword: '',
    email: '',
  });

  const [message, setMessage] = useState('');

  const handleSignInChange = (e) => {
    setSignInData({ ...signInData, [e.target.id]: e.target.value });
  };

  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.id]: e.target.value });
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', signInData);
      setMessage(`Welcome, ${response.data.message}`);
      console.log('Token:', response.data.token); // Save the token for later use
    } catch (error) {
      console.error('Error during sign-in:', error);
      setMessage(error.response ? error.response.data.error : 'Sign-in failed. Please check your credentials.');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.repeatPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(signUpData.password)) {
      setMessage('Password must contain at least 6 characters, including letters and numbers.');
      return;
    }

    try {
      const { username, password, email } = signUpData;
      const response = await axios.post('http://localhost:5000/signup', { username, password, email });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error during sign-up:', error);
      setMessage(error.response ? error.response.data.error : 'Sign-up failed. Try again later.');
    }
  };

  return (
    <div className="login-wrap">
      <div className="game-title">
        <h1>Mythomagic</h1>
        <p>An Indian Take on Magic: The Gathering</p>
      </div>

      <div className="login-html">
        <input id="tab-1" type="radio" name="tab" className="sign-in" defaultChecked />
        <label htmlFor="tab-1" className="tab">Sign In</label>
        <input id="tab-2" type="radio" name="tab" className="sign-up" />
        <label htmlFor="tab-2" className="tab">Sign Up</label>

        <div className="login-form">
          {/* Sign-In Form */}
          <div className="sign-in-htm">
            <form onSubmit={handleSignInSubmit}>
              <div className="group">
                <label htmlFor="signInUsername" className="label">Username</label>
                <input id="signInUsername" type="text" className="input" value={signInData.username} onChange={handleSignInChange} />
              </div>
              <div className="group">
                <label htmlFor="signInPassword" className="label">Password</label>
                <input id="signInPassword" type="password" className="input" value={signInData.password} onChange={handleSignInChange} />
              </div>
              <div className="group">
                <input type="submit" className="button" value="Sign In" />
              </div>
            </form>
            <div className="hr"></div>
            <div className="foot-lnk">
              <a href="#forgot">Forgot Password?</a>
            </div>
          </div>

          {/* Sign-Up Form */}
          <div className="sign-up-htm">
            <form onSubmit={handleSignUpSubmit}>
              <div className="group">
                <label htmlFor="signUpUsername" className="label">Username</label>
                <input id="signUpUsername" type="text" className="input" value={signUpData.username} onChange={handleSignUpChange} />
              </div>
              <div className="group">
                <label htmlFor="signUpPassword" className="label">Password</label>
                <input id="signUpPassword" type="password" className="input" value={signUpData.password} onChange={handleSignUpChange} />
              </div>
              <div className="group">
                <label htmlFor="repeatPassword" className="label">Repeat Password</label>
                <input id="repeatPassword" type="password" className="input" value={signUpData.repeatPassword} onChange={handleSignUpChange} />
              </div>
              <div className="group">
                <label htmlFor="email" className="label">Email Address</label>
                <input id="email" type="email" className="input" value={signUpData.email} onChange={handleSignUpChange} />
              </div>
              <div className="group">
                <input type="submit" className="button" value="Sign Up" />
              </div>
            </form>
            <div className="hr"></div>
            <div className="foot-lnk">
              <label htmlFor="tab-1">Already Member?</label>
            </div>
          </div>
        </div>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AuthForm;
