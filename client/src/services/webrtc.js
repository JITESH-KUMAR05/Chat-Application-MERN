let peerConnection = null;

const getIceServers = () => {
  return {
    iceServers: [
      
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun1.l.google.com:19302", 
      },
      
      {
        urls: import.meta.env.VITE_TURN_URL,
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_PASSWORD,
      },
    ],
  };
};

export const createPeerConnection = (onTrack, onIceCandidate) => {
  peerConnection = new RTCPeerConnection(getIceServers());

  peerConnection.ontrack = onTrack;

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  return peerConnection;
};

export const getPeerConnection = () => peerConnection;

export const closePeerConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
};