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

    // Thread replies
    parentMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
      default: null,
    },

    // Edited status
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    // Text message
    content: {
      type: String,
      default: "",
    },

    // FILE URL
    fileUrl: {
      type: String,
      default: "",
    },

    // ORIGINAL FILE NAME
    fileName: {
      type: String,
      default: "",
    },

    // FILE TYPE
    fileType: {
      type: String,
      default: "",
    },

    // Reactions
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
  },
  {
    strict: "throw",
    timestamps: true,
    versionKey: false,
  }
);

export const MessageModel = model(
  "message",
  messageSchema
);