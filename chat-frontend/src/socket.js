import { io } from "socket.io-client";

// Replace with your backend URL if it's different
const URL = "http://localhost:8000"; 

export const socket = io(URL, {
  autoConnect: true, 
});