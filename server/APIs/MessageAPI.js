import exp from "express";
import { MessageModel } from "../Models/MessageModel.js";
import { UserModel } from "../Models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { upload } from "../middleware/upload.js";

export const messageRoute = exp.Router();

/* ======================================================
   SEND MESSAGE WITH FILE SUPPORT
====================================================== */

messageRoute.post(
  "/send",
  verifyToken,
  upload.single("file"),
  async (req, res) => {

    try {

      const {
        content,
        receiver,
        channel,
        parentMessage,
      } = req.body;

      const sender = req.user.userId;

      // File variables

      let fileUrl = "";
      let fileName = "";
      let fileType = "";

      // If file uploaded

      if (req.file) {

        fileUrl =
          `http://localhost:4000/uploads/${req.file.filename}`;

        fileName = req.file.originalname;

        fileType = req.file.mimetype;
      }

      // Validation

      if (!content && !req.file) {

        return res.status(400).json({
          error: "Message or file is required",
        });
      }

      if (!receiver && !channel) {

        return res.status(400).json({
          error:
            "Must specify a receiver or a channel",
        });
      }

      // Create message

      const newMessage = new MessageModel({

        sender,

        content,

        // File fields

        fileUrl,
        fileName,
        fileType,

        // Thread reply support

        parentMessage:
          parentMessage || null,

        ...(receiver && { receiver }),

        ...(channel && { channel }),
      });

      // Save message

      await newMessage.save();

      console.log("BODY:", req.body);

      console.log("FILE:", req.file);

      console.log(
        "NEW MESSAGE:",
        newMessage
      );

      // Response

      res.status(201).json({
        message: "Message Sent",
        payload: newMessage,
      });

    } catch (err) {

      console.log(
        "Error details:",
        err
      );

      res.status(500).json({
        error: "Server Error",
      });
    }
  }
);

/* ======================================================
   GET PERSONAL CHAT MESSAGES
====================================================== */

messageRoute.get(
  "/messages/:id",
  verifyToken,
  async (req, res) => {

    let myId = req.user.userId;

    let chatPartnerId =
      req.params.id;

    let messages =
      await MessageModel.find({

        $or: [

          {
            sender: myId,
            receiver: chatPartnerId
          },

          {
            sender: chatPartnerId,
            receiver: myId
          },
        ],
      })

        .sort({ createdAt: 1 })

        .populate(
          "reactions.userId",
          "username lastName email"
        )

        // Thread parent populate

        .populate("parentMessage");

    res.status(200).json({

      message: "List of Messages:",

      payload: messages,
    });
  }
);

/* ======================================================
   SIDEBAR USERS
====================================================== */

messageRoute.get(
  "/sidebar-users",
  verifyToken,
  async (req, res) => {

    const myId =
      req.user.userId;

    // Find all messages involving me

    const messages =
      await MessageModel.find({

        $or: [
          { sender: myId },
          { receiver: myId }
        ],

      }).sort({ createdAt: -1 });

    // Unique partner IDs

    const contactIds =
      new Set();

    messages.forEach((msg) => {

      if (
        msg.sender.toString() ===
        myId.toString() &&
        msg.receiver
      ) {

        contactIds.add(
          msg.receiver.toString()
        );
      }

      if (
        msg.receiver?.toString() ===
        myId.toString()
      ) {

        contactIds.add(
          msg.sender.toString()
        );
      }
    });

    // Fetch user profiles

    const contactIdsArray =
      Array.from(contactIds);

    const sidebarUsers =
      await UserModel.find({

        _id: {
          $in: Array.from(contactIds)
        },

      }).select("-password");

    // Sort users

    sidebarUsers.sort((a, b) => {

      return (

        contactIdsArray.indexOf(
          a._id.toString()
        )

        -

        contactIdsArray.indexOf(
          b._id.toString()
        )
      );
    });

    res.status(200).json({

      message:
        "Sidebar users loaded",

      payload: sidebarUsers,
    });
  }
);

/* ======================================================
   CHANNEL MESSAGES
====================================================== */

messageRoute.get(
  "/channel-messages/:channelId",
  verifyToken,
  async (req, res) => {

    let channelId =
      req.params?.channelId;

    let allChannelMessage =
      await MessageModel.find({

        channel: channelId,

      })

        .sort({ createdAt: 1 })

        .populate(
          "reactions.userId",
          "username lastName email"
        )

        // Thread parent populate

        .populate("parentMessage");

    res.status(200).json({

      message:
        "all channel message",

      payload: allChannelMessage,
    });
  }
);

/* ======================================================
   REACTIONS API
====================================================== */

messageRoute.post(
  "/messages/:messageId/react",
  async (req, res) => {

    // Body

    const {
      emoji,
      userId
    } = req.body;

    // Params

    const { messageId } =
      req.params;

    // Find message

    const message =
      await MessageModel.findById(
        messageId
      );

    // Not found

    if (!message) {

      return res.status(404).json({
        message:
          "Message not found",
      });
    }

    if (!message.reactions) {

      message.reactions = [];
    }

    // Existing reaction

    const existingIndex =
      message.reactions.findIndex(

        (r) =>

          r.userId.toString() ===
          userId.toString()
      );

    if (existingIndex !== -1) {

      const existing =
        message.reactions[
          existingIndex
        ];

      // Remove same emoji

      if (
        existing.emoji === emoji
      ) {

        message.reactions.splice(
          existingIndex,
          1
        );

      } else {

        // Update emoji

        existing.emoji = emoji;
      }

    } else {

      // Add reaction

      message.reactions.push({

        userId,

        emoji,
      });
    }

    // Save

    await message.save();

    const updatedMessage =
      await MessageModel.findById(
        messageId
      )

        .populate(
          "reactions.userId",
          "username firstName email"
        )

        .populate("parentMessage");

    // Socket

    const io =
      req.app.get("socketio");

    if (message.channel) {

      io.to(
        message.channel.toString()
      ).emit(
        "reactionUpdated",
        updatedMessage
      );

    } else {

      io.to(
        message.receiver.toString()
      )

        .to(
          message.sender.toString()
        )

        .emit(
          "reactionUpdated",
          updatedMessage
        );
    }

    // Response

    res.status(200).json({

      message:
        "Reaction added successfully",

      payload: updatedMessage,
    });
  }
);

export default messageRoute;