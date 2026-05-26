import { useEffect, useRef } from "react";

export default function VideoCallModal({
  localStream,
  remoteStream,
  onEndCall,
}) {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      <div className="flex flex-1">

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-1/2 object-cover"
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 object-cover"
        />

      </div>

      <div className="p-4 flex justify-center">
        <button
          onClick={onEndCall}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          End Call
        </button>
      </div>

    </div>
  );
}