const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const CryptoJS = require('crypto-js');
const fs = require('fs'); 


const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

let loggedInUsers = []; // Array to track users logged into the chat
let onlineUsersCount = 0; // Counter to track active users in the chat
let messageHistory = []; // Store message

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin
    methods: ["GET", "POST"]
  }
});

// Function to log and update active users
const updateActiveUsers = () => {
  console.log(`Active users in chat: ${onlineUsersCount}`);
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle "login" event to add user to the chat
  socket.on('login', (username) => {
    if (!loggedInUsers.includes(username)) {
      loggedInUsers.push(username); // Add username to the list of logged-in users
      onlineUsersCount++; // Increment active user 
      updateActiveUsers(); // Log updated count
      console.log(`User logged in: ${username}`);
    }

    // Send encrypted message history to the newly connected user
    const encryptedHistory = messageHistory.map((msg) => {
      const encryptedMsg = CryptoJS.AES.encrypt(JSON.stringify(msg), 'sdfG@#1$7fh^we89AqOPz!dmX435vnL').toString();
      return encryptedMsg;
    });
    socket.emit('message history', encryptedHistory);
  });

  // Handle "chat message" events
  socket.on('chat message', (encryptedMsg) => {
    try {
      // Log the encrypted message received from the client
      console.log(`Message received: ${encryptedMsg}`);
      
      // Decrypt the received message
      const bytes = CryptoJS.AES.decrypt(encryptedMsg, 'sdfG@#1$7fh^we89AqOPz!dmX435vnL');
      const decryptedMessage = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  
      // Log the decrypted message
      // console.log(`Decrypted message received: ${decryptedMessage.username}: ${decryptedMessage.text}`);
  
      // Store the decrypted message in the history
      messageHistory.push(decryptedMessage);
      // Write the decrypted message to a text file
    const messageToWrite = `${new Date().toISOString()} - ${decryptedMessage.username}: ${decryptedMessage.text}\n`;
    fs.appendFile(' messageHistory.txt', messageToWrite, (err) => {
      if (err) {
        console.error('Error writing message to file:', err);
      } else {
        console.log('Message written to file:  messageHistory.txt');
      }
    });

      //Re-encrypt the message to broadcast to other clients
      const encryptedMsgToBroadcast = CryptoJS.AES.encrypt(JSON.stringify(decryptedMessage), 'sdfG@#1$7fh^we89AqOPz!dmX435vnL').toString();
      io.emit('chat message', encryptedMsgToBroadcast); // Broadcast the encrypted message
    } catch (error) {
      console.error('Error decrypting message:', error);
     }
  });

  // Handle "logout" events
  socket.on('logout', (username) => {
    if (loggedInUsers.includes(username)) {
      loggedInUsers = loggedInUsers.filter((user) => user !== username);
      onlineUsersCount--; // Decrement active user counter
      updateActiveUsers();
      console.log(`User logged out: ${username}`);
    }

    // Explicitly trigger disconnection logic
    socket.disconnect(true); // Disconnect the user
  });

  // Handle user disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Ensure we decrement the user count only if they were logged in
    onlineUsersCount = Math.max(0, onlineUsersCount - 1);
    updateActiveUsers();
  });
});

// Define a simple HTTP route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the backend service');
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});