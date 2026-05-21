import { useEffect } from "react";
import { Outlet } from "react-router";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import IncomingCallModal from "../components/IncomingCallModal";
import VideoCallModal from "../components/VideoCallModal";

import socket from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useCallStore } from "../store/useCallStore";
import {
  getPeerConnection,
  closePeerConnection,
  createPeerConnection,
} from "../services/webrtc";

export default function ChatLayout() {
  const currentUser = useAuthStore((state) => state.user);
  const receiveMessage = useMessageStore((state) => state.receiveMessage);

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

  useEffect(() => {
    if (currentUser) {
      socket.emit("setup", currentUser);
      const handleMessageReceived = (newMessage) => receiveMessage(newMessage);
      socket.on("message Received", handleMessageReceived);
      return () => socket.off("message Received", handleMessageReceived);
    }
  }, [currentUser, receiveMessage]);

  useEffect(() => {
    socket.on("incoming-call", (data) => setIncomingCall(data));

    socket.on("call-answered", async ({ answer }) => {
      const peer = getPeerConnection();
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      const peer = getPeerConnection();
      if (peer && candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("call-ended", () => cleanupCall());

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, []);

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.callType === "video",
        audio: true,
      });
      setLocalStream(stream);

      const peer = createPeerConnection(
        (event) => setRemoteStream(event.streams[0]),
        (candidate) =>
          socket.emit("ice-candidate", {
            candidate,
            to: incomingCall.from._id,
          }),
      );

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer),
      );
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer-call", { to: incomingCall.from._id, answer });
      setCallAccepted(true);
    } catch (err) {
      console.log("Error accepting call:", err);
    }
  };

  // 🚨 BULLETPROOF CLEANUP (Bypasses React stale closures)
  const cleanupCall = () => {
    try {
      // Force-grab the live streams straight from Zustand
      const currentLocalStream = useCallStore.getState().localStream;
      const currentRemoteStream = useCallStore.getState().remoteStream;

      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach((track) => track.stop());
      }
      if (currentRemoteStream) {
        currentRemoteStream.getTracks().forEach((track) => track.stop());
      }

      closePeerConnection();
    } catch (err) {
      console.error("Error cleaning up tracks:", err);
    } finally {
      // Always reset UI state, even if hardware tracks fail to stop
      setCallAccepted(false);
      resetCall();
    }
  };

  const endCall = () => {
    if (activeCallUser?._id) {
      socket.emit("end-call", { to: activeCallUser._id });
    } else if (incomingCall?.from?._id) {
      socket.emit("end-call", { to: incomingCall.from._id });
    }
    cleanupCall();
  };

  return (
    <div className="h-screen flex flex-col bg-[#020617]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Outlet />
      </div>

      {incomingCall && !callAccepted && (
        <IncomingCallModal
          caller={incomingCall.from}
          onAccept={acceptCall}
          onReject={endCall}
        />
      )}

      {callAccepted && (
        <VideoCallModal
          localStream={localStream}
          remoteStream={remoteStream}
          onEndCall={endCall}
        />
      )}
    </div>
  );
}