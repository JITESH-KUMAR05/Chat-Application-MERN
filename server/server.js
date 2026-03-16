import dotenv from 'dotenv'
import {connect} from 'mongoose'
import {userRouter} from "./APIs/UserAPI.js"
import express from 'express'

dotenv.config()

const app = express()

const connectDB = async()=>{

    try
    {
        await connect(process.env.MONGO_URI)
        console.log("DB Connection Succesful")
        // Start HTTP Server
        app.listen(process.env.PORT,()=>console.log("Server Started on Port:- ",process.env.PORT))
    }
    catch(err)
    {
        console.log("Error in DB Connection",err)
    }

}
connectDB()

app.use(express.json());
app.use("/user-api",userRouter)
