import dotenv from 'dotenv'
import {connect} from 'mongoose'
import http from "http"
import {Server} from "socket.io"
import messageRoute from './APIs/MessageAPI.js'
import express from 'express'
import cors from "cors"
import jwt from "jsonwebtoken"


import {userRouter} from "./APIs/UserAPI.js"
import { MessageModel } from './Models/MessageModel.js'


dotenv.config()

const app = express()

// create the HTTP server using express app
const server = http.createServer(app);

// initialize the socket.io


const io = new Server(server, {
    cors:{
        origin: ["http://localhost:5173","http://127.0.0.1:5501"]
    }
})


// io.use((socket, next) => {
//   // We'll pass the token from the frontend connection options
//   const token = socket.handshake.auth.token; 
  
//   if (!token) {
//     return next(new Error("Authentication error: No token provided"));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // Attach the verified user ID safely to the socket object!
//     socket.userId = decoded._id; 
//     next();
//   } catch (err) {
//     return next(new Error("Authentication error: Invalid token"));
//   }
// });


io.on("connection", (socket) => {
    console.log("A user connected via socket", socket.id);

    // message handling logic here
   socket.on("setup", (userData) => {
        // 1. Join Personal Room for Direct Messages
        if(userData._id) {
            socket.join(userData._id); 
            console.log(`User ${userData._id} joined personal room`);
        }

        // 2. Join Channel Rooms
        // Expecting frontend to pass an array: channels: ["channelID1", "channelID2"]
        if (userData.channels && Array.isArray(userData.channels)) {
            userData.channels.forEach(channelId => {
                socket.join(channelId);
                console.log(`User joined channel: ${channelId}`);
            });
        }
        
        socket.emit("connected");
    });

    socket.on("disconnect", () => {
        console.log("user disconnected ", socket.id)
    });
});

app.use(express.json());
app.use(cors())
app.set("socketio", io);
app.use("/user-api",userRouter)
const connectDB = async()=>{

    try
    {
        await connect(process.env.MONGO_URI)
        console.log("DB Connection Succesful")
        const messageChangeStream = MessageModel.watch();

        messageChangeStream.on('change', (change) => {
            // When a new document is inserted into the collection
            if (change.operationType === 'insert') {
                const messageDetails = change.fullDocument;
                
                // Emit the real-time update to both the sender and receiver's specific rooms
                io.to(messageDetails.receiver.toString())
                  .to(messageDetails.sender.toString())
                  .emit("message Received", messageDetails);
        messageChangeStream.on('change', async (change) => {
            if (change.operationType === 'insert') {
                // MongoDB Change Streams don't automatically populate referenced fields.
                // We need to fetch the full populated document so the frontend has sender details (Name, Avatar, etc)
                const messageDetails = change.fullDocument;
                
                // Let's grab the populated message to send to the frontend
                const populatedMessage = await MessageModel.findById(messageDetails._id)
                    .populate("sender", "name email profilePic") // Send public user details to UI

                if (messageDetails.channel) {
                    // It's a Group Channel Message. Broadcast to everyone in that channel's room.
                    console.log(`Broadcasting to channel: ${messageDetails.channel}`);
                    io.to(messageDetails.channel.toString()).emit("message Received", populatedMessage);
                    
                } else if (messageDetails.receiver) {
                    // It's a Direct Message. Send to Receiver AND Sender.
                    console.log(`Broadcasting DM to: ${messageDetails.receiver}`);
                    io.to(messageDetails.receiver.toString())
                      .to(messageDetails.sender.toString())
                      .emit("message Received", populatedMessage);
                }
            }
        });
        // Start HTTP Server
        const PORT = process.env.PORT;
        server.listen(PORT,()=>console.log("Server Started on Port:- ",PORT))
    }
    catch(err)
    {
        console.log("Error in DB Connection",err)
    }

}
connectDB()




app.use((err, req, res, next) => {

  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Full error:", err);

  // mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  // ✅ HANDLE CUSTOM ERRORS
  if (err.status) {
    return res.status(err.status).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // default server error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});
app.use(express.json());
app.use("/user-api",userRouter)
app.use('/message-api',messageRoute)
