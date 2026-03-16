import exp from 'express'
import { MessageModel } from '../Models/MessageModel.js';
import { verifyToken } from '../middleware/verifyToken.js';
export const messageRoute = exp.Router()

messageRoute.post('/send', async (req,res) => {

        const { content, sender, receiver } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Message content is required" });
        }
        // if (!receiver && !channel) {
        //     return res.status(400).json({ error: "Must specify either a receiver or a channel" });
        // }

        // Create the new message document
        const newMessage = new MessageModel({
            sender,
            content,
            ...(receiver && {receiver}),
            // ...(channel && {channel}),
            // ...(parent && {parentMessage})
            
        });

        // Save it to MongoDB
        await newMessage.save();

        // get the socket io instance
        // const io = req.app.get("socketio")
// io.to(receiver).to(sender).emit("message Received", newMessage);
        // if (receiver) {
        //     // Direct Message -> Send to User's personal room
        //     io.to(receiver).to(sender).emit("message Received", newMessage);
        // } else if (channel) {
        //     // Channel Message -> Send to the Channel's room
        //     io.to(channel).emit("message Received", newMessage);
        // }
        // Send the saved message back to the frontend
        res.status(201).json({message:"Message Sent",payload: newMessage});

});
messageRoute.get('/messages/:id', async (req,res) => {
    let userID = req.params.id
    let messages = await MessageModel.find({receiver: userID})
    res.status(201).json({message:"List of Messages are:-",payload: messages})
})

export default messageRoute;
