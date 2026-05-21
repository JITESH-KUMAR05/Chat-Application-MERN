import dotenv from "dotenv";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import { connect } from "mongoose";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";

// Route Imports
import messageRoute from "./APIs/MessageAPI.js";
import { userRouter } from "./APIs/UserAPI.js";
import { channelRoute } from "./APIs/ChannelAPI.js";
import { analyticsRoute } from "./APIs/AnalyticsAPI.js";
import dashboardRoute from "./APIs/dashboardAPI.js";
import { messageFeaturesRoute } from "./APIs/MessageFeaturesAPI.js";
import { callRoute } from "./APIs/CallAPI.js";

// Models & Sockets
import { MessageModel } from "./Models/MessageModel.js";
import { ChannelModel } from "./Models/ChannelModel.js";
import { UserModel } from "./Models/UserModel.js";
import { registerCallSockets } from "./socket/callSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ============================
// CORS CONFIGURATION
// ============================
const defaultAllowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5501"
];

const envAllowedOrigins = (process.env.CLIENT_URL ?? "")
    .split(",")
    .map(origin => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true
};

// ============================
// SOCKET.IO SETUP
// ============================
const io = new Server(server, { cors: corsOptions });
app.set("socketio", io);

// Helper function for live dashboard updates
const broadcastDashboardUpdate = async () => {
    try {
        const totalMessages = await MessageModel.countDocuments();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMessages = await MessageModel.countDocuments({
            createdAt: { $gte: today }
        });
        
        const activeUsers = await UserModel.countDocuments();
        
        io.emit("dashboardUpdate", { totalMessages, todayMessages, activeUsers });
    } catch (err) {
        console.error("Dashboard Broadcast Error:", err);
    }
};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register WebRTC Call Sockets
    registerCallSockets(io, socket);

    socket.on("setup", async (userData) => {
        try {
            if (!userData?._id) return;

            socket.join(userData._id);
            console.log(`User ${userData._id} joined personal room`);

            const userChannels = await ChannelModel.find({ members: userData._id });
            userChannels.forEach((channel) => {
                socket.join(channel._id.toString());
            });

            await UserModel.findByIdAndUpdate(userData._id, { lastSeen: new Date() });
            socket.emit("connected");
        } catch (err) {
            console.error("Setup Error:", err);
        }
    });

    socket.on("join channel", (channelId) => {
        socket.join(channelId);
        console.log("Joined channel:", channelId);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ============================
// MIDDLEWARE
// ============================
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ============================
// ROUTES
// ============================
app.use("/user-api", userRouter);
app.use("/message-api", messageRoute);
app.use("/channel-api", channelRoute);
app.use("/analytics", analyticsRoute);
app.use("/dashboard-api", dashboardRoute);
app.use("/message-feature-api", messageFeaturesRoute);
app.use("/call-api", callRoute);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: `${req.path} Invalid Path` });
});

// ============================
// DATABASE & SERVER START
// ============================
const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("DB Connected");

        // MongoDB Change Stream for Real-time Messaging & Dashboard
        const messageChangeStream = MessageModel.watch();

        messageChangeStream.on("change", async (change) => {
            try {
                if (change.operationType !== "insert") return;

                const messageDetails = change.fullDocument;
                const populatedMessage = await MessageModel.findById(messageDetails._id)
                    .populate("sender", "firstName lastName email profilePic")
                    .populate("parentMessage");

                if (!messageDetails.sender) return;

                // Route message to Channel or Direct Message
                if (messageDetails.channel) {
                    io.to(messageDetails.channel.toString()).emit("message Received", populatedMessage);
                } else if (messageDetails.receiver) {
                    io.to(messageDetails.receiver.toString())
                      .to(messageDetails.sender.toString())
                      .emit("message Received", populatedMessage);
                }

                // Automatically update dashboard stats for all connected admins/users
                broadcastDashboardUpdate();

            } catch (err) {
                console.error("Change stream error", err);
            }
        });

        const PORT = process.env.PORT || 8080;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("DB Connection Error", err);
    }
};

connectDB();

// ============================
// GLOBAL ERROR HANDLER
// ============================
app.use((err, req, res, next) => {
    console.error(err);

    if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).json({ message: "Error occurred", error: err.message });
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

    if (errCode === 11000) {
        const field = Object.keys(keyValue)[0];
        return res.status(409).json({ message: "Conflict", error: `${field} already exists` });
    }

    res.status(err.status || 500).json({ 
        message: "Server Error", 
        error: err.message || "Internal Server Error" 
    });
});