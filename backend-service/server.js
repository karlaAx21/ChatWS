const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios"); // Communicate with PHP backend

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"]
  }
});

// Handle socket connections
io.on("connection"), (socket) => {
  console.log(`User connected: ${socket.id}`);

// Register a user via proxy.php
socket.on("registerUser", async (userData) => {
    try {
      const response = await axios.post("http://karlaa.infinityfreeapp.com/proxy.php", userData, {
        headers: { "Content-Type": "application/json" } // Ensures proper data format
      });
  
      socket.emit("registrationStatus", response.data);
    } catch (error) {
      socket.emit("registrationStatus", { status: "error", message: "Cannot reach backend" });
    }
  });
  // Log in a user via login_proxy.php
socket.on("loginUser", async (loginData) => {
    try {
      const response = await axios.post("http://karlaa.infinityfreeapp.com/login_proxy.php", loginData, {
        headers: { "Content-Type": "application/json" } // Ensure correct data format
      });
  
      socket.emit("loginStatus", response.data);
    } catch (error) {
      socket.emit("loginStatus", { status: "error", message: "Cannot reach backend" });
    }
  });
  
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

// Start server
server.listen(3000, () => {
  console.log("Socket.IO server running on port 3000");
});
}