// 750cccce-5dee-427a-9aee-73ba55dd49e4
const peerConfiguration = {
    'iceServers': [{
        "urls": [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478"
        ]
    }]
};

const createPeerConnection = async () => {
    try {
        const peerConnection = new RTCPeerConnection(peerConfiguration);
        // Send Channel
        // const dataChannel = peerConnection.createDataChannel("chat");
        const remoteStream = new MediaStream();

        return {
            peerConnection,
            // dataChannel,
            remoteStream
        }
    }
    catch (err) {
        console.log(err.message);
    }
}

export default createPeerConnection;