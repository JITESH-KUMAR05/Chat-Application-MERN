import { CallModel } from "../Models/CallModel.js";

export const registerCallSockets = (io, socket) => {
  socket.on("call-user", async (data) => {
    try {
      const call = await CallModel.create({
        caller: data.from._id,

        receiver: data.to,

        type: data.callType,

        status: "calling",

        startedAt: new Date(),
      });

      io.to(data.to).emit("incoming-call", {
        from: data.from,

        offer: data.offer,

        callType: data.callType,

        callId: call._id,
      });
    } catch (err) {
      console.log("CALL ERROR", err);
    }
  });

  socket.on("answer-call", async (data) => {
    try {
      await CallModel.findByIdAndUpdate(data.callId, {
        status: "answered",
      });

      io.to(data.to).emit("call-answered", {
        answer: data.answer,
      });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("ice-candidate", (data) => {
    io.to(data.to).emit("ice-candidate", {
      candidate: data.candidate,
    });
  });

  socket.on("end-call", async ({ to, callId }) => {
  try {
    console.log(`Attempting to end call: ${callId} for user: ${to}`);

    if (callId) {
      await CallModel.findByIdAndUpdate(callId, {
        status: "ended",
        endedAt: new Date(),
      });
    }

    io.to(to).emit("call-ended");
    
  } catch (err) {
    console.error("Backend Error Ending Call:", err);
  }
});
};
