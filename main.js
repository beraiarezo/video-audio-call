const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const localPeerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Replace with your TURN server credentials if needed
    // { urls: 'turn:your.turn.server:3478', username: 'user', credential: 'pass' }
  ],
});

const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = async (message) => {
  const data = JSON.parse(message.data);

  if (data.offer) {
    await localPeerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await localPeerConnection.createAnswer();
    await localPeerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({ answer }));
  } else if (data.answer) {
    await localPeerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  } else if (data.candidate) {
    await localPeerConnection.addIceCandidate(
      new RTCIceCandidate(data.candidate)
    );
  }
};

localPeerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.send(JSON.stringify({ candidate: event.candidate }));
  }
};

localPeerConnection.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};

async function startCall() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localVideo.srcObject = stream;
  stream
    .getTracks()
    .forEach((track) => localPeerConnection.addTrack(track, stream));

  const offer = await localPeerConnection.createOffer();
  await localPeerConnection.setLocalDescription(offer);
  socket.send(JSON.stringify({ offer }));
}

startCall();
