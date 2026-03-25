import express from "express"
import { UserModel } from "../Models/UserModel.js";
import {hash, compare} from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {verifyToken} from '../middleware/verifyToken.js'

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
    const isMatch =  compare(newUserObj.password, user.password);
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
        sameSite : 'none',
        secure : true
    });
    const userObj = user.toObject();
    delete userObj.password;
    //send res
    return res.status(200).json({message : "Login Success", payload : userObj});
});

//search a user 
userRouter.get('/user', verifyToken, async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await UserModel.find(keyword).find({
      _id: { $ne: req.user._id },
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

//update the password if the user knows the previous password
userRouter.patch('/change-password', verifyToken, async (req, res) => {
    let {email,currentPassword,newPassword} = req.body;
    if(!user) {
        return res.status(401).json({message : "User not found"});
    }
    //check the current password is correct or not
    const isMatch = await compare(currentPassword, user.password);
    if(!isMatch) {
        const err = new Error("Invalid password");
        err.status = 401;
        throw err;
    }
    //replace current password with new password
    let createdNewPassword = await hash(newPassword, 12);
    let updated = await UserModel.findOneAndUpdate({ email }, {$set : {"password" : createdNewPassword}}, { new : true });
    //convert document to object to remove password
    const newUserObj = updated.toObject();
    //remove password
    delete newUserObj.password;
    //return user obj without password
    res.status(200).json({message : "Password Updated Successfully", payload : newUserObj});
    //send res
});

//logout
userRouter.get('/logout', async (req, res) => {
    //Clear the cookie named 'token
    res.clearCookie('token', {
        httpOnly : true,
        secure : false,
        sameSite : 'none'
    })
    res.status(200).json({message : "logged out successfully"});
});
