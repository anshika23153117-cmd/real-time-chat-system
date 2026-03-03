import React, { useState } from "react";

function ChatWindow({ user, selectedUser, onLogout }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      text: message,
      sender: user.username,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-bold text-lg">
          {selectedUser ? selectedUser.username : "Select a user"}
        </h2>

        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-blue-500 text-white p-2 rounded-md w-fit"
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      {selectedUser && (
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;