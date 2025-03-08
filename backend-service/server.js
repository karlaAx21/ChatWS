const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/users'); // Ensure this path is correct
const CryptoJS = require('crypto-js'); // Import the crypto-js library

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

let usersCount = 0; // Variable to keep track of the number of logged-in users
let onlineUsers = 0; // Variable to keep track of the number of online users
let messageHistory = []; // In-memory array to store message history

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust the origin as needed
    methods: ["GET", "POST"]
  }
});

// WebSocket connection
io.on('connection', async (socket) => {
  if (onlineUsers >= 3) {
    socket.emit('chat message', 'Chat room is full. Please try again later.');
    socket.disconnect(); // Disconnect the client if the chat room is full
    return;
  }

  onlineUsers++; // Increment the count of online users
  console.log('A user connected:', socket.id);
  console.log('Number of connected users:', onlineUsers);

  // Send message history to the new user
  const encryptedHistory = messageHistory.map((msg) => {
    const encryptedMsg = CryptoJS.AES.encrypt(JSON.stringify(msg), 'your_secret_key').toString();
    return encryptedMsg;
  });
  socket.emit('message history', encryptedHistory);

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg); // Log the received message
    // Decrypt the message and store it in the history array
    const bytes = CryptoJS.AES.decrypt(msg, 'your_secret_key');
    const decryptedMessage = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    messageHistory.push(decryptedMessage);
    io.emit('chat message', msg); // Emit the encrypted message to all connected clients
  });

  socket.on('disconnect', () => {
    onlineUsers--; // Decrement the count of online users
    console.log('User disconnected:', socket.id);
    console.log('Number of connected users:', onlineUsers);
  });
});

// Define a simple route
app.get('/', (req, res) => {
  res.send('Welcome to the backend service');
});

// Define API routes
app.use('/api/users', userRoutes);

// Endpoint to get the current user count
app.get('/api/users/count', (req, res) => {
  res.json({ usersCount });
});

// Add login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const MOCK_API_URL = 'https://67c8d76f0acf98d07087de29.mockapi.io/chat/ws/user';

  try {
    const response = await axios.get(MOCK_API_URL);
    const users = response.data;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      usersCount++; // Increment the user count on successful login
      res.json({ success: true, message: 'Login successful!' });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error fetching users from MockAPI:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
