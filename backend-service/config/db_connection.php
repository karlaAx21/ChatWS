<?php
// Database credentials
$servername = "sql107.infinityfree.com";
$username = "if0_38816815"; 
$password = "Dg7dZmdWM2ex"; 
$dbname = "if0_38816815_chat_ws";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => $conn->connect_error]));
}

// Return JSON response instead of direct echo
header('Content-Type: application/json');
echo json_encode(["status" => "success"]);
?>