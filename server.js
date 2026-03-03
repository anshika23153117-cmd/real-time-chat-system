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
        origin:"*", //later restrict this to frontend url
        methods: ["GET","POST"]
    }
});



// socket.IO connection
io.on("connection",async (socket)=>{
    
    console.log('user connected',socket.id);
    try{
        const oldMessages = await Message.find().sort({ createdAt:1});
        socket.emit("old-messages",oldMessages);
    }catch(error){
        console.log(error);
    }
    //listen for messages 
    socket.on("send-message",async (data)=>{ //smjhna abhi ye sb
        try{
            const newMessage =new Message({
                sender: data.sender,
                text: data.text
            });
            await newMessage.save();
            //broadcast message for everyone except sender 
            socket.broadcast.emit("receive-message",newMessage);
        } catch(error){
            console.log(error);
        }
        
    });
    socket.on('disconnect',()=>{
        console.log('user disconnected',socket.id)
    });
});

connectDB();
app.use(cors());
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



