import exp from 'express'
import { MessageModel } from '../Models/MessageModel.js';
import { UserModel } from '../Models/UserModel.js';
import { verifyToken } from '../middleware/verifyToken.js';
export const messageRoute = exp.Router()

messageRoute.post('/send', verifyToken, async (req,res) => {

        const { content, receiver, channel } = req.body;
        const sender = req.user.userId;
        if (!content) {
            return res.status(400).json({ error: "Message content is required" });
        }
        if (!receiver && !channel) {
            return res.status(400).json({ error: "Must specify a receiver or a channel" });
        }

        // Create the new message document
        const newMessage = new MessageModel({
            sender,
            content,
            ...(receiver && { receiver }),
            ...(channel && { channel })
        });

        // Save it to MongoDB
        await newMessage.save();
        // Send the saved message back to the frontend
        res.status(201).json({message:"Message Sent",payload: newMessage});

});
messageRoute.get('/messages/:id', verifyToken, async (req,res) => {
    let myId = req.user.userId;
    let chatPartnerId = req.params.id;
    let messages = await MessageModel.find({
            $or: [
                { sender: myId, receiver: chatPartnerId },
                { sender: chatPartnerId, receiver: myId }
            ]
        }).sort({ createdAt: 1 }).populate("reactions.userId", "username lastName email"); // Sort by oldest to newest to build the chat UI

    res.status(200).json({message:"List of Messages:",payload: messages})
})

messageRoute.get("/sidebar-users", verifyToken, async(req,res) => {
    const myId = req.user.userId;

        // 1. Find all messages involving me
        const messages = await MessageModel.find({
            $or: [{ sender: myId }, { receiver: myId }]
        }).sort({ createdAt: -1 });

        // 2. Find unique partner IDs
        const contactIds = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() === myId.toString() && msg.receiver) {
                contactIds.add(msg.receiver.toString());
            }
            if (msg.receiver?.toString() === myId.toString()) {
                contactIds.add(msg.sender.toString());
            }
        });

        // 3. Fetch their actual profiles
        const contactIdsArray = Array.from(contactIds)
        const sidebarUsers = await UserModel.find({
            _id: { $in: Array.from(contactIds) }
        }).select("-password");

        // 4. Sort the users to match the 'contactIdsArray' timeline (most recent first)
        sidebarUsers.sort((a, b) => {
            return contactIdsArray.indexOf(a._id.toString()) - contactIdsArray.indexOf(b._id.toString());
        });

        res.status(200).json({ message: "Sidebar users loaded", payload: sidebarUsers });
   
})


messageRoute.get("/channel-messages/:channelId", verifyToken, async(req,res)=> {
    let channelId = req.params?.channelId;
    // find all the messages from this channel
    let allChannelMessage = await MessageModel.find({channel:channelId}).sort({ createdAt: 1 }).populate("reactions.userId", "username lastName email");

    res.status(200).json({message:"all channel message",payload:allChannelMessage})
});

//api for reactions
messageRoute.post("/messages/:messageId/react", async (req, res) => {
    //get content from body
    const { emoji, userId } = req.body;
    // get message id
    const { messageId } = req.params;
    //check whether message exist or not
    const message = await MessageModel.findById(messageId);
    //if message not found
    if (!message) {
        return res.status(404).json({
        message: "Message not found"
        });
    }
    if (!message.reactions) {
      message.reactions = [];
    }
    // // Check if user already reacted → update
    const existingIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString());

    if (existingIndex !== -1) {
        const existing = message.reactions[existingIndex];

        if (existing.emoji === emoji) {
            message.reactions.splice(existingIndex, 1);
        } else {
            existing.emoji = emoji;
        }
    } else {
        // ✅ ADD
        message.reactions.push({ userId, emoji });
    }
    //save the message
    await message.save();
    const updatedMessage = await MessageModel.findById(messageId).populate("reactions.userId", "username firstName email");
    // Emit real-time update
    const io = req.app.get("socketio");

    if (message.channel) {
    io.to(message.channel.toString()).emit("reactionUpdated", updatedMessage);
    } else {
    io.to(message.receiver.toString())
        .to(message.sender.toString())
        .emit("reactionUpdated", updatedMessage);
    }
    //send res
    res.status(200).json({message: "Reaction added successfully", payload:updatedMessage});
})


export default messageRoute;
