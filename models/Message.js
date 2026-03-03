const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    sender: {type: String, ref:"user"},//later i will add required: true
    text: {type: String,required: true},

},{timestamps: true}
);
module.exports = mongoose.model("Message",messageSchema);

//Use String: If you just want to store the temporary socket.id. (Note: socket.id changes every time a user refreshes!)

//Use ObjectId: If you have a User Collection where people register with an email and password. In that case, the sender would be their permanent User ID.