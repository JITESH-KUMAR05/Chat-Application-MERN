import express from "express"
import { UserModel } from "../Models/UserModel.js";
import {hash, compare} from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const userRouter = express.Router();

//Register the user
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

//login the user
userRouter.post("/login", async (req, res) => {
    //get the user object from body
    const newUserObj= req.body;
    //check whether user exists
    const user = await UserModel.findOne({email: newUserObj.email});
    //if user not exists, ask user to register
    if(!user) {
        const err = new Error("Invalid email");
        err.status = 401;
        return;
    }
    //compare passwords
    const isMatch = await compare(newUserObj.password, user.password);
    // if password not matched, ask them them to enter correct message
    if(!isMatch) {
        const err = new Error("Invalid password");
        err.status = 401;
        return;
    }
    //generate token
    const token = jwt.sign({userId:user._id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '1h'});

    //save the token in httpOnly
    res.cookie("token", token, {
        httpOnly : true,
        sameSite : 'lax',
        secure : false
    });
    const userObj = user.toObject();
    delete userObj.password;
    //send res
    res.status(200).json({message : "Login Success", payload : userObj});
});

// Search for a user by username
userRouter.get("/search/:username", verifyToken, async (req, res) => {
    try {
        // Find the user by username, but exclude their password from the result
        const user = await UserModel.findOne({ username: req.params.username }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User found", payload: user });
    } catch (err) {
        res.status(500).json({ error: "Failed to search user" });
    }
});