import express from "express"
import { UserModel } from "../Models/UserModel.js";
import {hash} from 'bcryptjs';

export const userRouter = express.Router();

userRouter.post("/register",async(req,res)=>{
    let userObj = req.body;

    // document
    let userDoc = new UserModel(userObj);
    await userDoc.validate();

    // hash the password
    userDoc.password = await hash(userDoc.password, 12);
    //save
    const created = await userDoc.save();
    //convert document to object to remove password feild
    const newUserObj = created.toObject();
    //remove password
    delete newUserObj.password;
    //return respnse
    res.status(201).json({message:"User created",payload:newUserObj});
});