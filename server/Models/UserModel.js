import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
    },

    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,

      required: function () {
        return !this.googleId;
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profilePic: {
      type: String,
    },

    tagLine: {
      type: String,
    },

    // ADDED FIELD
    lastSeen: {
      type: Date,
      default: null,
    },

    notes: [
      {
        text: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    strict: "throw",
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel = model("user", userSchema);