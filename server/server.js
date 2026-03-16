import dotenv from 'dotenv'
import {connect} from 'mongoose'
import http from "http"
import {Server} from "socket.io"
import express from 'express'
import cors from "cors"


import {userRouter} from "./APIs/UserAPI.js"


dotenv.config()

const app = express()

// create the HTTP server using express app
const server = http.createServer(app);

// initialize the socket.io

const io = new Server(server, {
    cors:{
        origin: "http://localhost:5173"
    }
})



io.on("connection", (socket) => {
    console.log("A user connected via socket", socket.id);

    // message handling logic here

    socket.on("disconnect", () => {
        console.log("user disconnected ", socket.id)
    });
});

app.use(express.json());
app.use(cors())
app.use("/user-api",userRouter)
const connectDB = async()=>{

    try
    {
        await connect(process.env.MONGO_URI)
        console.log("DB Connection Succesful")
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