import express from "express"
import { verifyToken } from "../middleware/verifyToken.js";
import { ChannelModel } from "../Models/ChannelModel.js";
import { MessageModel } from "../Models/MessageModel.js"; // NEED THIS FOR SORTING

export const channelRoute = express.Router();

// create a new channel
channelRoute.post("/create", verifyToken, async(req,res)=>{
    // name and members
    let {name,members} = req.body;
    let admin = req.user?.userId;
    
    // Safety check just in case frontend doesn't send members array
    if(!members) members = [];
    
    members.push(admin);

    // create the channel
    let channelDoc = new ChannelModel({name:name,admin:admin,members:members});
    await channelDoc.validate()

    let newChannel = await channelDoc.save();

    res.status(201).json({message:"channel created", payload:newChannel})

})

// get my channels
channelRoute.get("/my-channels",verifyToken, async(req,res)=> {
    // get the current user
    let currUser = req.user?.userId;
    // find all the channels of this user
    let allChannels = await ChannelModel.find({members:currUser}).lean();

    // 1. Fetch the latest message for each channel to sort them
    for (let channel of allChannels) {
        const latestMessage = await MessageModel.findOne({ channel: channel._id }).sort({ createdAt: -1 });
        channel.lastMessageTime = latestMessage ? new Date(latestMessage.createdAt).getTime() : new Date(channel.createdAt || 0).getTime();
    }

    // 2. Sort so newest channels/chats show up on top
    allChannels.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    res.status(200).json({message:"your channels", payload:allChannels})
})

