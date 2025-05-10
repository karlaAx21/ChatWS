import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Chat from "./Chat";
import Users from "./Users"; 

const App = () => {
  return (
    <Router>
      <div>

        {/* Define routes */}
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/users" element={<Users />} /> 
        </Routes>
      </div>
    </Router>
  );
};

export default App;