import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "./ChatWindow";
import { io } from "socket.io-client"; // 1. Import Socket.io

const BACKEND_URL = "http://localhost:8000";
const socket = io(BACKEND_URL); // 2. Connect to the server

function Chat({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 3. New state to hold the list of online user IDs
  const [onlineUsers, setOnlineUsers] = useState([]); 

  // --- Socket.io connection for Online Status ---
  useEffect(() => {
    const myId = user._id || user.id;
    
    // Tell the server we are online
    socket.emit("add-user", myId);

    // Listen for the updated list of who is online
    socket.on("get-online-users", (activeUsers) => {
      setOnlineUsers(activeUsers);
    });

    return () => {
      socket.off("get-online-users");
    };
  }, [user]);

  // --- Fetch Users List ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user"));
        const token = userInfo?.token;

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const res = await axios.get(`${BACKEND_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove logged-in user from sidebar
        const filteredUsers = res.data.filter(
            (u) => (u._id || u.id) !== (user._id || user.id)
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
      <div className="hidden md:flex md:w-80 flex-col bg-white border-r shadow-lg z-10">
        {/* User Profile Header */}
        <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user.username}</h2>
            <p className="text-sm text-green-600 font-medium">● Online</p>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Contacts</h3>
          
          {loading ? (
            <div className="text-center text-slate-400 p-4 animate-pulse">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-slate-400 p-4">No users found</div>
          ) : (
            users.map((u) => {
              const uId = String(u._id || u.id);
              // 4. Check if this user's ID is inside the onlineUsers array
              const isOnline = onlineUsers.includes(uId); 

              return (
                <div
                  key={uId}
                  onClick={() => setSelectedUser(u)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    (selectedUser?._id || selectedUser?.id) === uId
                      ? "bg-blue-600 text-white shadow-md"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {/* Avatar wrapper (relative positioning for the dot) */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    {/* 5. The Green Dot */}
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium truncate">
                    {u.username}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 h-full bg-white relative">
      {selectedUser ? (
          <ChatWindow
            key={selectedUser._id|| selectedUser.id} 
            user={user}
            selectedUser={selectedUser}
            onLogout={onLogout}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-2xl">
               💬
            </div>
            <p className="text-lg font-medium">Select a contact to start a private chat</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;