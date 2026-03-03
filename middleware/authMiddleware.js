const jwt=require("jsonwebtoken");

const authMiddleware =(req,res,next)=>{
    const token = req.header("authorization")?.split(" ")[1];
    if(!token) return res.status(401).json({message:"no token provided"});
    try{
        const decoded= jwt.verify(token,process.env.JWT_SECRET);
        req.user= decoded; //atttach user info to request
        next();
    } catch(error){
        res.status(401).json({message: "invalid token"});
    }
};
module.exports = authMiddleware;
//Any route that requires a logged-in user can now use authMiddleware.

