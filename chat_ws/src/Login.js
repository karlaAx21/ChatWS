import React, { useState } from "react";
import { io } from "socket.io-client";
import { Link, useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    socket.emit("loginUser", { username, password });

    socket.on("loginStatus", (response) => {
      if (response.status === "success") {
        setMessage(`Welcome, ${response.username}! Redirecting to chat...`);
        localStorage.setItem("user_id", response.user_id);
        localStorage.setItem("username", response.username); //Store username
        setTimeout(() => navigate("/chat"), 2000);
      } else {
        setMessage(`Login failed: ${response.message}`);
      }
    });
  };

  return (
    <div className="login-container"> 
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>

      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

export default Login;