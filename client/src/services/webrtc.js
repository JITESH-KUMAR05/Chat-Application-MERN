let peerConnection = null;
// 🚨 THE QUEUE: Holds candidates that arrive too early
let pendingCandidates = []; 

const getIceServers = () => {
  const servers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  if (import.meta.env.VITE_TURN_URL) {
    servers.push({
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_PASSWORD,
    });
  }

  return { iceServers: servers };
};

export const createPeerConnection = (onTrack, onIceCandidate) => {
  peerConnection = new RTCPeerConnection(getIceServers());
  pendingCandidates = []; // Clear queue on new call

  peerConnection.ontrack = onTrack;
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  return peerConnection;
};

export const getPeerConnection = () => peerConnection;

// 🚨 NEW: Safely handles incoming candidates
export const addIceCandidateToPeer = async (candidate) => {
  if (!peerConnection) return;

  // If the peer is ready, add it immediately
  if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    // If not ready, put it in the waiting room
    pendingCandidates.push(candidate);
  }
};

// 🚨 NEW: Injects queued candidates once the call is accepted
export const flushIceCandidates = async () => {
  if (!peerConnection) return;
  for (const candidate of pendingCandidates) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  pendingCandidates = []; // Empty the queue
};

export const closePeerConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  pendingCandidates = [];
};