import React, { useState } from "react";
import Chat from "./chat";
import Register from "./register";
import Login from "./login";
import './index.css';
// eslint-disable-next-line
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user"))||null);
  const [isRegister, setIsRegister] = useState(false);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  if (user) {
    // Pass the logout function to the Chat component
    return <Chat user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all">
        {isRegister ? (
          <Register setUser={setUser} />
        ) : (
          <Login setUser={setUser} />
        )}

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;