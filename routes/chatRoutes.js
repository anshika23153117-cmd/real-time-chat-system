const express= require('express');
const router= express.Router();
const Message = require("../models/Message");

router.post('/add',async (req,res)=>{
    try{
        //in a real chat app, you usually don't use this router.post for every single message. Instead, you use Socket.io to save the message. Why? Because router.post requires a page refresh or a separate "Fetch" call, while Sockets do it instantly.
     const message = await Message.create(req.body);//create message
     res.status(201).json(message);
    } catch(err){
        res.status(500).json({error: err.message});

    }
});

router.get("/",async (req,res)=>{ //fetches history
    try{
    const messages=await Message.find().sort({ createAt:1});
    res.status(200).json(messages);
    } catch(err){
        res.status(500).json({ error: err.message});
    }
});
module.exports = router;
