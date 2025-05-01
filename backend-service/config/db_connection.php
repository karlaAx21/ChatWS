


<?php
// Database credentials
$servername = "sql107.infinityfree.com"; // Use the hostname provided by InfinityFree
$username = "if0_38816815"; // Your InfinityFree database username
$password = "Dg7dZmdWM2ex"; // Your InfinityFree database password
$dbname = "if0_38816815_chat_ws"; // Your InfinityFree database name
//C:\Users\alexa\Documents\GitHub\RandomChat\backend

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
//backend/db_connection.php
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully";
?>
