import express from "express";
import { UserModel } from "../Models/UserModel.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/verifyToken.js";

export const userRouter = express.Router();

// Register the user
userRouter.post("/register", async (req, res) => {
  let userObj = req.body;

  let userDoc = new UserModel(userObj);

  await userDoc.validate();

  userDoc.password = await hash(userDoc.password, 12);

  const created = await userDoc.save();

  const newUserObj = created.toObject();

  delete newUserObj.password;

  res.status(201).json({
    message: "User created",
    payload: newUserObj,
  });
});

// Login the user
userRouter.post("/login", async (req, res) => {
  const newUserObj = req.body;

  const user = await UserModel.findOne({
    email: newUserObj.email,
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email",
    });
  }

  const isMatch = await compare(
    newUserObj.password,
    user.password
  );

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid password",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  const userObj = user.toObject();

  delete userObj.password;

  res.status(200).json({
    message: "Login Success",
    payload: userObj,
  });
});


//update the password if the user knows the previous password
userRouter.patch('/change-password', verifyToken, async (req, res) => {
        // Normalize the username to match how it is stored (trimmed and lowercased)
        const normalizedUsername = req.params.username.trim().toLowerCase();
    //get currentpassword and new password
        const user = await UserModel.findOne({ username: normalizedUsername }).select("-password");
    if(!user) {
        return res.status(401).json({message : "User not found"});
    }

    const isMatch = await compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    let createdNewPassword = await hash(
      newPassword,
      10
    );

    let updated = await UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          password: createdNewPassword,
        },
      },
      { new: true }
    );

    const newUserObj = updated.toObject();

    delete newUserObj.password;

    res.status(200).json({
      message: "Password Updated Successfully",
      payload: newUserObj,
    });
  }
);