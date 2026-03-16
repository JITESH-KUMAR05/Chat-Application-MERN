import exp  from 'express'
import dotenv from 'dotenv'
import {connect} from 'mongoose'

dotenv.config()

const app = exp()
app.use(exp.json())

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
