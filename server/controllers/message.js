import { MessageModel } from "../Models/MessageModel.js";

export const sendMessage =
  async (req, res) => {

    try {

      const {

        sender,

        receiver,

        content,

      } = req.body;



      // =================================================
      // FILE DETAILS
      // =================================================

      let fileUrl = "";

      let fileName = "";

      let fileType = "";



      // CLOUDINARY FILE
      if (req.file) {

        fileUrl =
          req.file.path;

        fileName =
          req.file.originalname;

        fileType =
          req.file.mimetype;

      }



      // =================================================
      // CREATE MESSAGE
      // =================================================

      const newMessage =
        await MessageModel.create({

          sender,

          receiver,

          content,

          fileUrl,

          fileName,

          fileType,

          messageType:
            req.file
              ? "file"
              : "text",

        });



      // =================================================
      // POPULATE MESSAGE
      // =================================================

      const populatedMessage =
        await MessageModel.findById(
          newMessage._id,
        )

          .populate(

            "sender",

            "firstName lastName profilePic",

          )

          .populate(

            "receiver",

            "firstName lastName profilePic",

          );



      // =================================================
      // SOCKET REALTIME
      // =================================================

      const io =
        req.app.get("socketio");



      io.to(
        sender.toString(),
      )

      .to(
        receiver.toString(),
      )

      .emit(
        "message Received",
        populatedMessage,
      );



      // =================================================
      // RESPONSE
      // =================================================

      res.status(201).json(
        populatedMessage,
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Error sending message",

      });

    }

  };