// import { useEffect } from "react";
// import socket from "../services/socket";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";
// import ChatArea from "../components/ChatArea";
// import { Outlet } from "react-router";
// import { useAuthStore } from "../store/useAuthStore";
// import { useMessageStore } from "../store/useMessageStore";

// export default function ChatLayout() {
//   const currentUser = useAuthStore((state) => state.user);
//   const receiveMessage = useMessageStore((state) => state.receiveMessage);

//   useEffect(() => {
//     if (currentUser) {
//       // Tell backend who we are so we join our private room
//       socket.emit("setup", currentUser);
      
//       // Global listener for incoming real-time messages
//       const handleMessageReceived = (newMessage) => {
//         // Handle this in zustand so any component can handle it
//         receiveMessage(newMessage);
//       };

//       socket.on("message Received", handleMessageReceived);

//       // Cleanup
//       return () => {
//         socket.off("message Received", handleMessageReceived);
//       };
//     }
//   }, [currentUser]);

//   return (
//     <div className="h-screen flex flex-col">
//       <Navbar />
//       <div className="flex flex-1">
//         <Sidebar />
        
//         <Outlet />
        
//       </div>
//     </div>
//   );
// }



import { useEffect } from "react";

import socket from "../services/socket";

import Sidebar from "../components/Sidebar";

import Navbar from "../components/Navbar";

import { Outlet } from "react-router";

import { useAuthStore } from "../store/useAuthStore";

import { useMessageStore } from "../store/useMessageStore";

import { useCallStore } from "../store/useCallStore";

import IncomingCallModal from "../components/IncomingCallModal";

import VideoCallModal from "../components/VideoCallModal";

import {
  getPeerConnection,
  closePeerConnection,
  createPeerConnection,
} from "../services/webrtc";

export default function ChatLayout() {

  const currentUser =
    useAuthStore((state) => state.user);

  const receiveMessage =
    useMessageStore((state) =>
      state.receiveMessage
    );

  const {
  incomingCall,
  setIncomingCall,
  callAccepted,
  setCallAccepted,
  localStream,
  setLocalStream,
  remoteStream,
  setRemoteStream,
  resetCall,
  activeCallUser,
} = useCallStore();

  // SOCKET SETUP
  useEffect(() => {

    if (currentUser) {

      socket.emit(
        "setup",
        currentUser
      );

      const handleMessageReceived =
        (newMessage) => {

          receiveMessage(
            newMessage
          );
        };

      socket.on(
        "message Received",
        handleMessageReceived
      );

      return () => {

        socket.off(
          "message Received",
          handleMessageReceived
        );
      };
    }

  }, [currentUser]);

  // GLOBAL CALL LISTENERS
  useEffect(() => {

    socket.on(
      "incoming-call",
      (data) => {

        console.log(
          "INCOMING CALL",
          data
        );

        setIncomingCall(data);
      }
    );

    socket.on(
      "call-answered",
      async ({ answer }) => {

        const peer =
          getPeerConnection();

        if (!peer) return;

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        setCallAccepted(true);
      }
    );

    socket.on(
      "ice-candidate",
      async ({ candidate }) => {

        const peer =
          getPeerConnection();

        if (
          peer &&
          candidate
        ) {

          await peer.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        }
      }
    );

    socket.on(
      "call-ended",
      () => {

        console.log(
          "CALL ENDED RECEIVED"
        );

        handleRemoteCallEnded();
      }
    );

    return () => {

      socket.off(
        "incoming-call"
      );

      socket.off(
        "call-answered"
      );

      socket.off(
        "ice-candidate"
      );

      socket.off(
        "call-ended"
      );
    };

  }, []);

  // ACCEPT CALL
  const acceptCall = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video:
            incomingCall.callType ===
            "video",
          audio: true,
        });

      setLocalStream(stream);

      const peer =
        createPeerConnection(
          (event) => {

            setRemoteStream(
              event.streams[0]
            );
          },

          (candidate) => {

            socket.emit(
              "ice-candidate",
              {
                candidate,
                to:
                  incomingCall.from._id,
              }
            );
          }
        );

      stream
        .getTracks()
        .forEach((track) => {

          peer.addTrack(
            track,
            stream
          );
        });

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          incomingCall.offer
        )
      );

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      socket.emit(
        "answer-call",
        {
          to:
            incomingCall.from._id,
          answer,
        }
      );

      setCallAccepted(true);

    } catch (err) {

      console.log(err);
    }
  };

  const cleanupCall = () => {

  // STOP LOCAL STREAMS
  localStream
    ?.getTracks()
    .forEach((track) => {
      track.stop();
    });

  // STOP REMOTE STREAMS
  remoteStream
    ?.getTracks()
    .forEach((track) => {
      track.stop();
    });

  // CLOSE PEER
  closePeerConnection();

  // RESET CALL STATE
  setCallAccepted(false);

  resetCall();
};

// LOCAL USER ENDS CALL
const endCall = () => {

  // TELL OTHER USER
  if (activeCallUser?._id) {

    socket.emit("end-call", {
      to: activeCallUser._id,
    });
  }

  cleanupCall();
};

// OTHER USER ENDED CALL
const handleRemoteCallEnded = () => {

  console.log(
    "REMOTE USER ENDED CALL"
  );

  cleanupCall();
};

  return (

    <div className="h-screen flex flex-col">

      <Navbar />

      <div className="flex flex-1">

        <Sidebar />

        <Outlet />

      </div>

      {/* INCOMING CALL */}
      {incomingCall &&
        !callAccepted && (

        <IncomingCallModal
          caller={
            incomingCall.from
          }
          onAccept={acceptCall}
          onReject={endCall}
        />
      )}

      {/* ACTIVE CALL */}
      {callAccepted && (

        <VideoCallModal
          localStream={
            localStream
          }
          remoteStream={
            remoteStream
          }
          onEndCall={endCall}
        />
      )}

    </div>
  );
}