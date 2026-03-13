const jwt=require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req,res,next)=>{
    const token = req.header("authorization")?.split(" ")[1];
    console.log("TOKEN RECEIVED:", token); 
    if(!token) return res.status(401).json({message:"no token provided"});
    try{
        const decoded= jwt.verify(token,process.env.JWT_SECRET);
        console.log("DECODED:", decoded); 
        req.user= await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(404).json({ message: "User not found" }); //atttach user info to request
        next();
    } catch(error){
        res.status(401).json({message: "invalid token"});
    }
    if(!token){
        return res.status(401).json({message:"no token"});
    }
};
module.exports = authMiddleware;
//Any route that requires a logged-in user can now use authMiddleware.

