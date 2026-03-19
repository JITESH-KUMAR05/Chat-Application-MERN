import express from "express"
import { UserModel } from "../Models/UserModel.js";
import {hash, compare} from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {verifyToken} from '../middleware/verifyToken.js'
import { MessageModel } from "../Models/MessageModel.js";
import { ChannelModel } from "../Models/ChannelModel.js";
import mongoose from "mongoose";

export const userRouter = express.Router();

// Check if username is uniquely available
userRouter.get("/check-username", async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ available: false });
        
        const existing = await UserModel.findOne({ username: username.toLowerCase() });
        if (existing) {
            return res.json({ available: false, message: "Username is already taken" });
        }
        return res.json({ available: true, message: "Username is available" });
    } catch (error) {
        return res.status(500).json({ error: "Server error checking username" });
    }
});

//Register the user
userRouter.post("/register",async(req,res)=>{
    try {
        // Sync indexes to fix the old MongoDB duplicate key error for sparse indexes
        await UserModel.syncIndexes();

        let userObj = req.body;
        
        // Remove empty username to trigger sparse index properly
        if (!userObj.username || userObj.username.trim() === "") {
            delete userObj.username;
        }

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
    } catch (err) {
        console.log("Registration Error: ", err);
        // Handle MongoDB duplicate key errors gracefully
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({ error: `${field} is already in use.` });
        }
        return res.status(500).json({ error: err.message || "Registration failed" });
    }
});

//login the user
userRouter.post("/login", async (req, res) => {
    //get the user object from body
    const newUserObj= req.body;
    //check whether user exists
    const user = await UserModel.findOne({email: newUserObj.email});
    //if user not exists, ask user to register
    if(!user) {
        return res.status(404).json({message:"User not found, please register"})
    }
    //compare passwords
    const isMatch =  await compare(newUserObj.password, user.password);
    // if password not matched, ask them them to enter correct message
    if(!isMatch) {
        return res.status(401).json({message:"please enter a valid password"})
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
    res.status(200).json({message : "Login Success", payload : userObj});
});

//update the password if the user knows the previous password
userRouter.patch('/change-password', verifyToken, async (req, res) => {
    let {email,currentPassword,newPassword} = req.body;
    let user = await UserModel.findOne({email:email});
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
userRouter.get('/logout', verifyToken, async (req, res) => {
    //Clear the cookie named 'token
    res.clearCookie('token', {
        httpOnly : true,
        secure : true,
        sameSite : 'none'
    })
    res.status(200).json({message : "logged out successfully"});
});

//search a user 
userRouter.get('/user', verifyToken, async (req, res) => {
  try {
    let keyword = {};
    if (req.query.search) {
      const searchStr = req.query.search.trim();
      const searchTerms = searchStr.split(/\s+/);
      
      if (searchTerms.length > 1) {
        // If there's a space, test first name and last name
        keyword = {
          $and: [
            { firstName: { $regex: searchTerms[0], $options: "i" } },
            { lastName: { $regex: searchTerms[1], $options: "i" } }
          ]
        };
      } else {
        keyword = {
          $or: [
            { firstName: { $regex: searchStr, $options: "i" } },
            { lastName: { $regex: searchStr, $options: "i" } },
            { email: { $regex: searchStr, $options: "i" } },
            { username: { $regex: searchStr, $options: "i" } }
          ],
        };
      }
    }

    const users = await UserModel.find(keyword).find({
      _id: { $ne: req.user.userId },
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get profile stats (FIXED COUNTS + MEMBER SINCE)
userRouter.get("/profile-stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. CONNECTIONS (unique users you chatted with)
    const messages = await MessageModel.find({
  $or: [
    { sender: new mongoose.Types.ObjectId(userId) },
    { receiver: new mongoose.Types.ObjectId(userId) }
  ]
});
    const connectionsSet = new Set();

    messages.forEach(msg => {
      if (msg.sender.toString() === userId.toString() && msg.receiver) {
        connectionsSet.add(msg.receiver.toString());
      }
      if (msg.receiver?.toString() === userId.toString()) {
        connectionsSet.add(msg.sender.toString());
      }
    });

    // 2. CHANNEL COUNT

const channels = await ChannelModel.countDocuments({
  members: new mongoose.Types.ObjectId(userId)
});

    // 3. MESSAGE COUNT (FIXED)
    const messageCount = messages.length;

    // 4. USER INFO
    const user = await UserModel.findById(userId);

    res.status(200).json({
      payload: {
        connections: connectionsSet.size,
        channels,
        messages: messageCount,
        memberSince: user.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching profile stats" });
  }
});

// Update profile pic
userRouter.post("/update-profile-pic", verifyToken, async (req, res) => {
  try {
    const { profilePic } = req.body;

    const updated = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { profilePic },
      { new: true }
    ).select("-password");

    res.json({ payload: updated });

  } catch (err) {
    res.status(500).json({ message: "Error updating profile pic" });
  }
});

// SAVE NOTE
userRouter.post("/save-note", verifyToken, async (req, res) => {
  try {
    const { note } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { $set: { note } },
      { new: true }
    );

    res.json({
      payload: updatedUser.note || ""
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving note" });
  }
});


userRouter.get("/get-notes", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);

    res.json({ payload: user.notes || [] });

  } catch (err) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

userRouter.post("/add-note", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.userId,
      {
        $push: {
          notes: { text }
        }
      },
      { new: true }
    );

    res.json({ payload: updatedUser.notes });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding note" });
  }
});

userRouter.delete("/delete-note/:index", verifyToken, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const user = await UserModel.findById(req.user.userId);

    user.notes.splice(index, 1);

    await user.save();

    res.json({ payload: user.notes });

  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
});