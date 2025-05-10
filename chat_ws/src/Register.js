import React, { useState } from "react";
import { io } from "socket.io-client";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

const socket = io("http://localhost:3000");

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize navigation

  // Password condition checks
  const conditions = {
    length: password.length >= 9,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d.*\d/.test(password), // At least 2 numbers
    specialChars: /[@$!%*?&].*[@$!%*?&]/.test(password), // At least 2 special characters
  };

  // Validation function
  const validatePassword = Object.values(conditions).every(Boolean);

  const handleRegister = () => {
  if (!validatePassword) {
    setMessage("Password does not meet requirements.");
    return;
  }

  socket.emit("registerUser", { username, password });

  socket.on("registrationStatus", (response) => {
    if (response.status === "success") {
      setMessage(`Registration successful! Redirecting to login...`);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setMessage(`${response.message}`); // Shows "Username already exists!" if duplicate
    }
  });
};

  return (
    <div className="register-container"> {/* Added class name */}
      <h2>Register</h2>
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

      {/* Display conditions */}
      <ul>
        <li style={{ color: conditions.length ? "green" : "red" }}> At least 9 characters</li>
        <li style={{ color: conditions.lowercase ? "green" : "red" }}> At least 1 lowercase letter</li>
        <li style={{ color: conditions.uppercase ? "green" : "red" }}> At least 1 uppercase letter</li>
        <li style={{ color: conditions.numbers ? "green" : "red" }}> At least 2 numbers</li>
        <li style={{ color: conditions.specialChars ? "green" : "red" }}> At least 2 special characters (@$!%*?&)</li>
      </ul>

      <button onClick={handleRegister}>Register</button>
      <p>{message}</p>

      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default Register;