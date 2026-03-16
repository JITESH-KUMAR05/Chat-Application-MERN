import exp from 'express'
import { MessageModel } from '../Models/MessageModel.js';
export const messageRoute = exp.Router()


messageRoute.post('/send/:receiverID', async (req,res) => {

        // console.log()
        let message =  req.body.content
        let senderID = req.body.sender
        if (!message) {
            return res.status(400).json({ error: "Message content is required" });
        }

        // Create the new message document
        const newMessage = new MessageModel({
            sender: senderID,
            receiver: req.params.receiverID,
            content: message,
        });

        // Save it to MongoDB
        await newMessage.save();

        // get the socket io instance
        // const io = req.app.get("socketio")

        // emit the message
        // io.to(req.params.receiverID).to(senderID).emit("message Received", newMessage);

        // Send the saved message back to the frontend
        res.status(201).json({message:"Message Sent",payload: newMessage});

});
messageRoute.get('/messages/:id', async (req,res) => {
    let userID = req.params.id
    let messages = await MessageModel.find({receiver: userID})
    res.status(201).json({message:"List of Messages are:-",payload: messages})
})

export default messageRoute;
