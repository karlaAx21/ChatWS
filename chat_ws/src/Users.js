import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Users.css"; // Ensure styles are applied

const Users = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/users") // Fetch usernames from the backend
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div className="users-container">
      <h2>Registered Users</h2>
      
      {/* Back to Chat Button */}
      <button className="back-button" onClick={() => navigate("/chat")}>Back to Chat</button>

      {/* User List Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th> {/*Only displays usernames */}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => ( // Use index as key since user_id is removed
            <tr key={index}>
              <td>{user.username}</td> {/*Show only the username */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;