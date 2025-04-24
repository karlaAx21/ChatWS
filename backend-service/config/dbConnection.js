const mysql = require('mysql2');

// Define connection details
const connection = mysql.createConnection({
    host: 'sql107.infinityfree.com', 
    user: 'if0_38816815',          
    password: 'Dg7dZmdWM2ex',     
    database: 'if0_38816815_chat_ws'      
});

// Establish connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err.message);
        return;
    }
    console.log('Connected to the database!');
});

// Close connection
connection.end();