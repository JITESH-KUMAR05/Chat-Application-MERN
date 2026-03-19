import { Schema, model } from "mongoose";

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    username: {              
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse:true,
        // Remove required: true if you want to allow Google users 
        // to set a username later, or generate one from their email.
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // Set required only if there is no googleId
        required: function() { return !this.googleId; } 
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows nulls for traditional email/pass users
    },
    profilePic: {
        type: String,
    },
    tagLine: {
        type: String,
    },
  notes: [
  {
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
],
}, {
    strict: "throw",
    timestamps: true,
    versionKey: false
});

export const UserModel = model("user", userSchema);