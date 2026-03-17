import dotenv from 'dotenv';
import express from 'express';
import http from "http";
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
        origin: ["http://localhost:5173", "http://127.0.0.1:5501"]
    }
});

io.on("connection", (socket) => {
    console.log("A user connected via socket", socket.id);

    socket.on("setup", (userData) => {
        if (userData._id) {
            socket.join(userData._id);
            console.log(`User ${userData._id} joined personal room`);
        }

        if (userData.channels && Array.isArray(userData.channels)) {
            userData.channels.forEach(channelId => {
                socket.join(channelId);
                console.log(`User joined channel: ${channelId}`);
            });
        }
        socket.emit("connected");
    });

    socket.on("disconnect", () => {
        console.log("user disconnected ", socket.id);
    });
});

// 2. Middleware
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());
app.set("socketio", io);

// 3. Routes
app.use("/user-api", userRouter);
app.use('/message-api', messageRoute);

// 4. Database & Change Stream Logic
const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("DB Connection Successful");

        const messageChangeStream = MessageModel.watch();

        messageChangeStream.on('change', async (change) => {
            if (change.operationType === 'insert') {
                const messageDetails = change.fullDocument;
                const populatedMessage = await MessageModel.findById(messageDetails._id)
                    .populate("sender", "firstName lastName email profilePic");

                if (messageDetails.channel) {
                    io.to(messageDetails.channel.toString()).emit("message Received", populatedMessage);
                } else if (messageDetails.receiver) {
                    io.to(messageDetails.receiver.toString())
                      .to(messageDetails.sender.toString())
                      .emit("message Received", populatedMessage);
                }
            }
        });

        // 5. Start Server
        const PORT = process.env.PORT || 5000;
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