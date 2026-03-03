import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "./ChatWindow";

const BACKEND_URL = "http://localhost:8000";

function Chat({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BACKEND_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove logged-in user from sidebar
        const filteredUsers = res.data.filter(
          (u) => u._id !== user._id
        );

        setUsers(filteredUsers);
      } catch (error) {
        console.log("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-slate-100 to-slate-200 overflow-hidden">

      {/* SIDEBAR */}
      <div className="hidden md:flex md:w-1/4 bg-white border-r border-slate-200 flex-col shadow-sm">

        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <p className="text-center text-gray-400 mt-4">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-400 mt-4">No users found</p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedUser?._id === u._id
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium truncate">
                  {u.username}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-white">
        <ChatWindow
          user={user}
          selectedUser={selectedUser}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}

export default Chat;