import React, { useState } from 'react';
import Login from './Login'; // Ensure this path is correct
import Chat from './Chat'; // Import the Chat component
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Function to handle successful login
  const handleLoginSuccess = (username) => {
    setUsername(username);
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="Title">Spring 2025 CPSC 455-02 Project 1 Part II</h1>
      </header>
      {isLoggedIn ? <Chat username={username} /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

export default App;
