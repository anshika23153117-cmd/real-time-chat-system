const User =require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//process.env protects your secrets (the developer's keys), while hashing protects the user's secrets (their passwords).
//register
exports.register = async (req,res)=>{
    try{
        const {username,email,password} = req.body;
        const userExists= await User.findOne({email});
        if(userExists)
            return res.status(400).json({message: "user already exist"});
        const hashPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            username,
            email,
            password: hashPassword
        });
        //generate token 
        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        
        )
        res.status(201).json({
            user,
            token
              
        });
    } catch(error){
        res.status(500).json({message: error.message})
    }
};
    //LOGIN
    exports.login= async (req,res)=>{
        try{
            const{email,password}= req.body;
            const user= await User.findOne({email});
            if(!user)
                return res.status(400).json({message: "invalid credentials"});
            const ismatch = await bcrypt.compare(password,user.password)
            if(!ismatch)
                return res.status(400).json({message: "invalid credentials"});
            const token = jwt.sign(
                {id: user._id},
                process.env.JWT_SECRET,
                {expiresIn: "1d"}
                //Why process.env? As we discussed, you keep this key in your .env file so it stays off of GitHub.
            );
            res.json({
                token,
                user:{
                    id: user._id,
                    username: user.username,
                    email:user.email
                }
            })
        } catch(error){
            res.status(500).json({message: error.message})
            //THERE CAN BE ERROR HERE
        }
    };