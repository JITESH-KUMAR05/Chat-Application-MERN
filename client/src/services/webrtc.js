let peerConnection = null;

export const createPeerConnection = (
  onTrack,
  onIceCandidate
) => {

  peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });

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