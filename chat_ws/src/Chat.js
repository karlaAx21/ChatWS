import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js'; // Import the crypto-js library
import './Chat.css'; // Import the CSS file

const socket = io('http://localhost:5000'); // Connect to the WebSocket server
const SECRET_KEY = 'your_secret_key'; // Define a secret key for encryption/decryption

const Chat = ({ username }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Receive message history from the server
    socket.on('message history', (history) => {
      const decryptedHistory = history.map((encryptedMsg) => {
        const bytes = CryptoJS.AES.decrypt(encryptedMsg, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      });
      setMessages(decryptedHistory);
    });

    // Receive messages from the server
    socket.on('chat message', (encryptedMsg) => {
      if (encryptedMsg === 'Chat room is full. Please try again later.') {
        setErrorMessage(encryptedMsg);
      } else {
        // Decrypt the received message
        const bytes = CryptoJS.AES.decrypt(encryptedMsg, SECRET_KEY);
        const decryptedMessage = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
      }
    });

    return () => {
      socket.off('message history');
      socket.off('chat message');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && !errorMessage) {
      // Encrypt the message before sending
      const messageObject = { username, text: message };
      const encryptedMessage = CryptoJS.AES.encrypt(JSON.stringify(messageObject), SECRET_KEY).toString();
      socket.emit('chat message', encryptedMessage);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      {errorMessage ? (
        <p className="error-message">{errorMessage}</p>
      ) : (
        <>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.username === username ? 'sent' : 'received'}`}>
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
              required
            />
            <button type="submit">Send</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;
