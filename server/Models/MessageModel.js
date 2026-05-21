import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    channel: {
      type: Schema.Types.ObjectId,
      ref: "channel",
    },

    parentMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
      default: null,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    content: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      default: "",
    },

    reactions: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
          },

          emoji: String,
        },
      ],

      default: [],
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  {
    strict: "throw",
    timestamps: true,
    versionKey: false,
  },
);

export const MessageModel = model("message", messageSchema);
