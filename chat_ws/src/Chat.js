import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./Chat.css"; 

const socket = io("http://localhost:3000");

const Chat = () => {  //Wrap JSX inside this function
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) navigate("/login");

    socket.on("newMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.emit("getMessages");
    socket.on("messageHistory", (response) => {
      if (response.status === "success") {
        setMessages(response.messages);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageHistory");
    };
  }, [userId]);

  const sendMessage = () => {
    if (!message.trim() && !image) return;
    if (!userId) return;

    const messageData = { sender_id: userId, content: message, image_data: image };
    socket.emit("sendMessage", messageData);

    setMessage("");
    setImage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return ( //This must be inside the function
    <div className="chat-container">
      <h2>Chat Room</h2>

      {/* Buttons for Logout & Users Page */}
      <div className="buttons-container">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <button className="users-button" onClick={() => navigate("/users")}>Users</button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.username === username ? "self" : "other"}`}>
            <p>
              <strong>{msg.username}:</strong> {msg.content}
            </p>
            {msg.image_data && <img src={`data:image/png;base64,${msg.image_data}`} alt="Uploaded" className="message-image" />}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat; 