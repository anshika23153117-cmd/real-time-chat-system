import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Use an environment variable or a consistent constant for the backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const socket = io(BACKEND_URL);

function ChatWindow({ user, selectedUser, onLogout }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  // Safely normalize IDs to strings to ensure the Room ID is consistent
  const myId = String(user?.id || user?._id);
  const theirId = String(selectedUser?.id || selectedUser?._id);
  const roomId = [myId, theirId].sort().join("_");

  useEffect(() => {
    if (!roomId || !theirId) return;

    // Join the private room on the server
    socket.emit("join-room", roomId);

    const handleReceiveMessage = (newMessage) => {
      // Only add if it's not a duplicate (to prevent ghosting/double messages)
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    };

    const handleOldMessages = (history) => {
      setMessages(history);
    };

    const handleUserTyping = () => setIsTyping(true);
    const handleUserStopTyping = () => setIsTyping(false);

    // Set up listeners
    socket.on("receive-message", handleReceiveMessage);
    socket.on("old-messages", handleOldMessages);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.emit("leave-room", roomId);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("old-messages", handleOldMessages);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [roomId, theirId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", roomId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", roomId);
    }, 1500);
  };

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    
    const messageData = {
      roomId,
      text: message,
      sender: myId,
      username: user.username,
      createdAt: new Date().toISOString(),
    };
    
    // Emit message to server
    socket.emit("send-message", messageData);
    socket.emit("stop-typing", roomId);
    
    // Optimistically update UI to avoid lag, but ensure ID is unique
    setMessages((prev) => [...prev, { ...messageData, id: Date.now() }]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50">
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

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender === myId;
          return (
            <div key={msg.id || index} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                  isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-700 border rounded-bl-none"
                }`}>
                  {msg.text || msg.message}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex w-full justify-start mt-2">
            <div className="bg-slate-200 text-slate-500 text-xs italic py-2 px-4 rounded-full animate-pulse">
              {selectedUser.username} is typing...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

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