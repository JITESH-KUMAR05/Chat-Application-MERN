import dotenv from 'dotenv';
import express from 'express';
import http from "http";
import cookieParser from 'cookie-parser';
import { connect } from 'mongoose';
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";

// Route & Model Imports
import messageRoute from './APIs/MessageAPI.js';
import { userRouter } from "./APIs/UserAPI.js";
import { MessageModel } from './Models/MessageModel.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5501"],
        methods: ["GET","POST"],
        credentials: true
    }
});

io.use((socket, next) => {
  try {
    // 1. Grab the raw cookies from the socket connection
    const cookieString = socket.handshake.headers.cookie;
    if (!cookieString) throw new Error("No cookies found");

    // 2. Isolate the specific 'token=' cookie
    const tokenCookie = cookieString.split('; ').find(row => row.startsWith('token='));
    if (!tokenCookie) throw new Error("No token cookie found");

    // 3. Extract the actual JWT string
    const token = tokenCookie.split('=')[1];

    // 4. Verify it just like your Express route does
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Attach the user's ID to the socket object!
    socket.userId = decoded.userId; 
    next(); // Let them in!

  } catch (err) {
    console.log("Socket connection rejected:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  
  console.log("Socket connected! User assigned to room:", socket.userId);
  
  socket.join(socket.userId);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

// 2. Middleware
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use(cookieParser())
app.set("socketio", io);

// 3. Routes
app.use("/user-api", userRouter);
app.use('/message-api', messageRoute);

// 5. Invalid Route Handler (AFTER routes)
app.use((req, res) => {
    res.status(404).json({
        message: `${req.path} Invalid Path`
    });
});

// 4. Database & Change Stream Logic
const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("DB Connection Successful");

        
        const messageChangeStream = MessageModel.watch();

        messageChangeStream.on("change", (change) => {
            
            // 1. ONLY proceed if a brand new message was inserted
            if (change.operationType === "insert") {
                const messageDetails = change.fullDocument;

                // 2. Safety check: ensure both sender and receiver exist before emitting
                if (messageDetails && messageDetails.sender && messageDetails.receiver) {
                    
                    // 3. Safely emit to the specific rooms
                    io.to(messageDetails.receiver.toString())
                    .to(messageDetails.sender.toString())
                    .emit("message Received", messageDetails);
                    
                } else {
                    console.log("Change stream skipped: Missing sender/receiver details");
                }
            }
        });

        // 5. Start Server
        const PORT = process.env.PORT || 8080;
        server.listen(PORT, () => console.log("Server Started on Port:- ", PORT));
    } catch (err) {
        console.log("Error in DB Connection", err);
    }
};

connectDB();



// 6. Global Error Handler (MUST BE LAST)
app.use((err, req, res, next) => {
    console.error("Error details:", err);

    if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).json({ message: "error occurred", error: err.message });
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

    if (errCode === 11000) {
        const field = Object.keys(keyValue)[0];
        return res.status(409).json({
            message: "error occurred",
            error: `${field} already exists`,
        });
    }

    res.status(err.status || 500).json({
        message: "error occurred",
        error: err.message || "Server side error",
    });
});