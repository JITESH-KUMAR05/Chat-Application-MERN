import exp from 'express'
import { MessageModel } from '../Models/MessageModel.js';
import { verifyToken } from '../middleware/verifyToken.js';
export const messageRoute = exp.Router()

messageRoute.post('/send', verifyToken, async (req,res) => {

        const { content, receiver } = req.body;
        const sender = req.user.userId;
        if (!content) {
            return res.status(400).json({ error: "Message content is required" });
        }
        if (!receiver) {
            return res.status(400).json({ error: "Must specify a receiver" });
        }

        // Create the new message document
        const newMessage = new MessageModel({
            sender: sender,
            content: content,
            receiver: receiver
            
        });

        // Save it to MongoDB
        await newMessage.save();
        // Send the saved message back to the frontend
        res.status(201).json({message:"Message Sent",payload: newMessage});

});
messageRoute.get('/messages/:id', verifyToken, async (req, res) => {
    try {
        let myId = req.user._id;
        let chatPartnerId = req.params.id;
        
        let messages = await MessageModel.find({
            $or: [
                { sender: myId, receiver: chatPartnerId },
                { sender: chatPartnerId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ message: "List of Messages", payload: messages });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
});
export default messageRoute;
