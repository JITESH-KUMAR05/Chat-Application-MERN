import express from "express"
import { UserModel } from "../Models/UserModel";
import bcrypt from 'bcrypt';

const userRouter = express.Router();

userRouter.post("/register",async(req,res)=>{
    let userObj = req.body;

    // document
    let userDoc = new UserModel(userObj);
    await userDoc.validate();

    // hash the password
    userDoc.password = await bcrypt.hash(userDoc.password, 12);
    //save
    const created = await userDoc.save();
    //convert document to object to remove password feild
    const newUserObj = created.toObject();
    //remove password
    delete newUserObj.password;
    //return respnse
    res.status(201).json({message:"User created",payload:newUserObj});
});