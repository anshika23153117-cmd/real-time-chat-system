import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

function ChatWindow({ user, selectedUser, onLogout }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Typing state
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null); // Stopwatch for typing

  // Safely grab the IDs and create the unified Room ID
  const myId = String(user?.id || user?._id);
  const theirId = String(selectedUser?.id || selectedUser?._id);
  const roomId = [myId, theirId].sort().join("_");

  // 1. Unified Setup for Room & Listeners
  useEffect(() => {
    if (!roomId || !theirId) return;

    // Join the specific private room
    socket.emit("join-room", roomId);

    // Define exactly what happens when signals come in
    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleOldMessages = (history) => {
      setMessages(history);
    };

    const handleUserTyping = () => setIsTyping(true);
    const handleUserStopTyping = () => setIsTyping(false);

    // Turn ON the listeners
    socket.on("receive-message", handleReceiveMessage);
    socket.on("old-messages", handleOldMessages);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    // Turn OFF the exact listeners when leaving the chat
    return () => {
      socket.emit("leave-room", roomId);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("old-messages", handleOldMessages);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [roomId, theirId]);

  // 2. Auto-scroll down when new messages arrive OR someone starts typing
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 3. Format time for the timestamps
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 4. Smart function to handle typing signals
  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Tell server we are typing
    socket.emit("typing", roomId);

    // Clear old stopwatch
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start 1.5s stopwatch to tell server we stopped
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", roomId);
    }, 1500);
  };

  // 5. Send Message Function
  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    
    const messageData = {
      roomId,
      text: message,
      sender: myId,
      username: user.username,
      createdAt: new Date().toISOString(), // Attach timestamp
    };
    
    socket.emit("send-message", messageData);
    socket.emit("stop-typing", roomId); // Stop typing immediately when sent
    
    setMessages((prev) => [...prev, messageData]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50">
      {/* HEADER */}
      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {selectedUser ? selectedUser.username.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="font-bold text-slate-800">{selectedUser?.username || "Chat"}</span>
        </div>
        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
          Logout
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender === myId;
          return (
            <div key={index} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                
                {/* Chat Bubble */}
                <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                  isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-700 border rounded-bl-none"
                }`}>
                  {msg.text || msg.message}
                </div>
                
                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatTime(msg.createdAt)}
                </span>
                
              </div>
            </div>
          );
        })}
        
        {/* TYPING INDICATOR UI */}
        {isTyping && (
          <div className="flex w-full justify-start mt-2">
            <div className="bg-slate-200 text-slate-500 text-xs italic py-2 px-4 rounded-full animate-pulse">
              {selectedUser.username} is typing...
            </div>
          </div>
        )}
        
        {/* Invisible div to scroll to */}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      {selectedUser && (
        <div className="p-4 bg-white border-t flex gap-2">
          <input
            type="text"
            className="flex-1 border p-3 rounded-xl outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="Type your message..."
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button 
            onClick={handleSend} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;