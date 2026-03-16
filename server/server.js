import dotenv from 'dotenv'
import {connect} from 'mongoose'
import http from "http"
import {Server} from "socket.io"
import messageRoute from './APIs/MessageAPI.js'
import express from 'express'
import cors from "cors"


import {userRouter} from "./APIs/UserAPI.js"
import { MessageModel } from './Models/MessageModel.js'


dotenv.config()

const app = express()

// create the HTTP server using express app
const server = http.createServer(app);

// initialize the socket.io


const io = new Server(server, {
    cors:{
        origin: ["http://localhost:5173","http://127.0.0.1:5500"]
    }
})



io.on("connection", (socket) => {
    console.log("A user connected via socket", socket.id);

    // message handling logic here
    socket.on("setup", (userData) => {
        socket.join(userData._id); // Join a room specifically for this user
        socket.emit("connected");
        console.log("User joined personal room:", userData._id);
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
