import Message from "../models/message.model.js";

// Send message with optional file
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    let fileUrl = "";
    let fileName = "";
    let fileType = "";

    // If file exists
    if (req.file) {
      fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      fileUrl,
      fileName,
      fileType,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending message" });
  }
};