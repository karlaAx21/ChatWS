const express = require('express');
const db = require('./config/dbConnection'); // Import dbConnection.js from the config folder

// Initialize the Express app
const app = express();
const PORT = 3000;

// Test database connection
app.get('/', (req, res) => {
    db.connect((err) => {
        if (err) {
            console.error('Database connection failed:', err.message);
            res.status(500).send('Failed to connect to the database.');
        } else {
            console.log('Database connected successfully!');
            res.send('Database connected successfully!');
        }
        db.end(); // Close the connection after the check
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});