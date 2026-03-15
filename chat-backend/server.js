const dotenv = require("dotenv");
dotenv.config();
const express= require('express');
const http = require("http");
const{Server}= require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");//this will work after dotenv
const Message = require("./models/Message");
const app = express();
 //This tells Socket.io: "Hey, keep an eye on this specific server. If a request comes in that looks like a WebSocket handshake, take over. If it looks like a normal webpage request, let Express handle it."

//The Handshake: Every WebSocket connection starts as a standard HTTP request. Because io is attached to server, it can "intercept" that request and upgrade the connection to a permanent, open pipe.

const server=http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:process.env.FRONTEND_URL || "http://localhost:3000", //later restrict this to frontend url
        methods: ["GET","POST"]
    }
   
});
const onlineUsers = new Map();


// socket.IO connection
io.on("connection",async (socket)=>{

    
    console.log('user connected',socket.id);


    // --- NEW: JOIN ROOM LOGIC ---
    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
        try{
            const oldMessages = await Message.find({roomId}).sort({ createdAt:1});
            socket.emit("old-messages",oldMessages);
        }catch(error){
            console.log(error);
        }
    });
    socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room: ${roomId}`);
    });
    //listen for messages 
    socket.on("send-message",async (data)=>{ //smjhna abhi ye sb
        try{
            const newMessage =new Message({
                sender: data.sender,
                text: data.text,
                roomId: data.roomId
            });
            await newMessage.save();
           // This sends the message ONLY to the specific roomId
            socket.to(data.roomId).emit("receive-message",{
                ...data,
                id: newMessage._id,
                createdAt: newMessage.createdAt
            });
        } catch(error){
            console.log(error);
        }
        
        
    });
    socket.on("typing", (roomId) => {
        socket.to(roomId).emit("user-typing");
    });

    socket.on("stop-typing", (roomId) => {
        socket.to(roomId).emit("user-stop-typing");
    });
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        // Announce the updated list of online IDs to EVERYONE
        io.emit("get-online-users", Array.from(onlineUsers.keys())); 
    });

    socket.on('disconnect',()=>{
        console.log('user disconnected',socket.id)
   
    for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
            onlineUsers.delete(userId);
            break;
        }
    }
    // Announce the updated list to everyone else
    io.emit("get-online-users", Array.from(onlineUsers.keys()));
  });
});

connectDB();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users",require("./routes/userRoutes"));
app.use("/api/chat",require("./routes/chatRoutes"));


app.get("/",(req,res)=>{
    res.send("chat backend running....");
});

const PORT = process.env.PORT|| 8000;
server.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
});



