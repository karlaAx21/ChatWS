import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [usersCount, setUsersCount] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('https://67c8d76f0acf98d07087de29.mockapi.io/chat/ws/user');
      const users = response.data;
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        setMessage('Login successful!');
        onLoginSuccess(username); // Pass the username on successful login
        updateUsersCount(); // Update the user count
      } else {
        setMessage('Login failed: Invalid username or password');
      }
    } catch (error) {
      console.error('There was an error fetching the users!', error);
      setMessage('Login failed: An error occurred.');
    }
  };

  const updateUsersCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/count'); // Fetch the current user count from the server
      setUsersCount(response.data.usersCount);
    } catch (error) {
      console.error('There was an error fetching the user count!', error);
    }
  };

  useEffect(() => {
    updateUsersCount();
  }, []);

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && (
        <p className={`login-message ${message.includes('successful') ? 'success' : 'failure'}`}>
          {message}
        </p>
      )}
      <p className="user-count">Number of logged-in users: {usersCount}</p>
    </div>
  );
};

export default Login;
