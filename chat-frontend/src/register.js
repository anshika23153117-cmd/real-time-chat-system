import { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:8000";

function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        username,
        email,
        password,
      });
      setUser(res.data.user);
      alert("Registration successful!");
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (error) {
      alert("Registration failed!");
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-green-200">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Register</h2>

        <input
          type="text"
          placeholder="Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-200"
        >
          Register
        </button>

       
      </div>
    </div>
  );
}

export default Register;