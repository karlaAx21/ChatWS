require("dotenv").config(); // Load environment variables

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// const { body } = require("express-validator");
// const DOMPurify = require("dompurify");
// const jsesc = require("jsesc");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Connect to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) console.error("MySQL connection error:", err);
  else console.log("Connected to MySQL Database");
});

// AES Encryption/Decryption Functions
const encryptMessage = (message) => {
  const cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.alloc(16, 0));
  return cipher.update(message, "utf8", "hex") + cipher.final("hex");
};

const decryptMessage = (encryptedData) => {
  const decipher = crypto.createDecipheriv("aes-256-ctr", Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.alloc(16, 0));
  return decipher.update(encryptedData, "hex", "utf8") + decipher.final("utf8");
};
// for sql injection and xss
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input; // Ensure input is a string

  // Remove common SQL injection attempts, motify the input and make it safer
  const sqlInjectionPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/gi, // Common SQL commands
    /(--|\bOR\b|\bAND\b|;|\*|=|\bUNION\b)/gi, // Logical operators & union exploits
    /['"]/g, // Remove single and double quotes
  ];

  let sanitizedInput = input;
  sqlInjectionPatterns.forEach((pattern) => {
    sanitizedInput = sanitizedInput.replace(pattern, "");
  });

  // Prevent XSS by escaping HTML special characters
  sanitizedInput = sanitizedInput.replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[match]));

  return sanitizedInput.trim(); //Ensure no trailing spaces
};

//Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  //Register user (Sanitize + Encrypt + Hash Password)
 socket.on("registerUser", async (userData) => {
  try {
    let { username, password } = userData;

    //Sanitize input before processing
    username = sanitizeInput(username);
    password = sanitizeInput(password);

    // Check if username already exists
    const checkUserSQL = "SELECT username FROM users WHERE username = ?";
    db.query(checkUserSQL, [username], async (err, results) => {
      if (results.length > 0) {
        socket.emit("registrationStatus", { status: "error", message: "Username already exists!" });
        return;
      }

      // Encrypt & Hash Password
      const encryptedPassword = encryptMessage(password);
      const hashedPassword = await bcrypt.hash(encryptedPassword, 10);

      // Store New User
      const insertUserSQL = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
      db.query(insertUserSQL, [username, hashedPassword], (err, result) => {
        if (err) {
          socket.emit("registrationStatus", { status: "error", message: "Registration failed" });
        } else {
          socket.emit("registrationStatus", { status: "success", user_id: result.insertId });
        }
      });
    });

  } catch (error) {
    socket.emit("registrationStatus", { status: "error", message: "Encryption failed" });
  }
});

//Login user (Sanitize+ Compare Encrypted + Hashed Password)
socket.on("loginUser", async (loginData) => {
  try {
    let { username, password } = loginData;

    //Sanitize input before using in queries
    username = sanitizeInput(username);
    password = sanitizeInput(password);

    const sql = "SELECT user_id, password_hash FROM users WHERE username = ?";
    
    db.query(sql, [username], async (err, results) => {
      if (err || results.length === 0) {
        socket.emit("loginStatus", { status: "error", message: "Invalid username or password" });
        return;
      }

      const storedHash = results[0].password_hash;
      const userId = results[0].user_id;

      // Encrypt the input before bcrypt comparison
      const encryptedPassword = encryptMessage(password);
      const isMatch = await bcrypt.compare(encryptedPassword, storedHash);

      if (isMatch) {
        socket.emit("loginStatus", { status: "success", username, user_id: userId });
      } else {
        socket.emit("loginStatus", { status: "error", message: "Wrong password" });
      }
    });

  } catch (error) {
    socket.emit("loginStatus", { status: "error", message: "Login process failed" });
  }
});

  socket.on("sendMessage", (messageData) => {
  try {
    let { sender_id, tag_id, content, image_data } = messageData;

    //Sanitize input before using in queries
    sender_id = sanitizeInput(sender_id);
    tag_id = sanitizeInput(tag_id);
    content = sanitizeInput(content);

    // Retrieve username for the sender
    const sql = "SELECT username FROM users WHERE user_id = ?";
    db.query(sql, [sender_id], (err, results) => {
      if (err || results.length === 0) {
        socket.emit("messageStatus", { status: "error", message: "Failed to send message" });
        return;
      }

      const username = results[0].username;
      const encryptedContent = encryptMessage(content); // Encrypt message

      //Insert message into DB securely
      const insertSQL = "INSERT INTO messages (sender_id, tag_id, content, image_data) VALUES (?, ?, ?, ?)";
      db.query(insertSQL, [sender_id, tag_id, encryptedContent, image_data], (err, result) => {
        if (err) {
          socket.emit("messageStatus", { status: "error", message: "Message failed to send" });
        } else {
          io.emit("newMessage", { username, tag_id, content: encryptedContent, image_data }); //Broadcast
          socket.emit("messageStatus", { status: "success", message: "Message sent successfully" });
        }
      });
    });

  } catch (error) {
    socket.emit("messageStatus", { status: "error", message: "Message processing failed" });
  }
});
  //Retrieve recent messages from MySQL
socket.on("getMessages", () => {
  const sql = "SELECT message_id, sender_id, tag_id, content, image_data FROM messages ORDER BY message_id ASC LIMIT 50";

  db.query(sql, (err, results) => {
    if (err) {
      socket.emit("messageHistory", { status: "error", message: "Failed to retrieve messages" });
    } else {
      const messages = results.map((msg) => ({
        message_id: msg.message_id,
        sender_id: msg.sender_id,
        tag_id: msg.tag_id,
        username: null,
        content: decryptMessage(msg.content),
        image_data: msg.image_data, // Ensure images are included
      }));

      const userIds = messages.map((msg) => msg.sender_id);
      const usernameQuery = `SELECT user_id, username FROM users WHERE user_id IN (${userIds.join(",")})`;

      db.query(usernameQuery, (userErr, userResults) => {
        if (!userErr && userResults.length > 0) {
          userResults.forEach((user) => {
            messages.forEach((msg) => {
              if (msg.sender_id === user.user_id) {
                msg.username = user.username;
              }
            });
          });
        }

        socket.emit("messageHistory", { status: "success", messages });
      });
    }
  });
});

app.get("/users", (req, res) => {
  const sql = "SELECT user_id, username FROM users ORDER BY username ASC";
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch users" });
    
    res.json({ users: results });
  });
});

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(3000, () => {
  console.log("Socket.IO server running on port 3000");
}); 