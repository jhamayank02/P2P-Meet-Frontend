import { createAnswer, createOffer, setLocalDescription, setRemoteDescription } from "./helpers";
import { toast } from 'react-toastify';

// When the other user joins the room
const userJoinedListener = async ({ email, name, id }, setRemoteUserName, setRemoteSocketId, peerConnection, socket) => {
    setRemoteSocketId(id);
    setRemoteUserName(name);

    createOffer(peerConnection).then(async offer => {
        socket.emit('USER_CALL', { to: id, offer });
    })
    .catch(err => {
        console.log("Something went wrong!!!")
    })
}

// To notify the user who has joined currently about the previous user in the meeting
const userJoinedBeforeListener = async ({ email, name, id }, setRemoteUserName, setRemoteSocketId) => {
    setRemoteSocketId(id);
    setRemoteUserName(name);
}

// Other user is calling
const incomingCallListener = async ({ from, offer }, remoteSocketId, peerConnection, socket) => {
    // await setLocalDescription(peerConnection, offer)
    // await setRemoteDescription(peerConnection, offer)
    console.log("INCOMING CALL", remoteSocketId?.current, offer)
    createAnswer(peerConnection, offer).then(ans => {
        console.log("CALL ACCEPTED", ans, peerConnection);
        socket.emit("CALL_ACCEPTED", { to: remoteSocketId?.current, ans });
    })
    .catch(err => {
        console.log("Something went wrong !!!!")
    })
}

// The other user has accepted the call
const callAcceptedListener = async ({ from, ans }, peerConnection, socket) => {
    await setRemoteDescription(peerConnection, ans);
    console.log("CALL ACCEPTED", ans, peerConnection);
}

// Other user has ended the call
const callEndListener = async (peerConnection, navigate) => {
    const localStream = document.getElementById('local-video').srcObject;
    const localScreenStream = document.getElementById('local-screen-video').srcObject;
    localStream.getTracks().forEach(track => track.stop());
    if(localScreenStream){
        localScreenStream.getTracks().forEach(track => track.stop());
    }
    await peerConnection.close();
    navigate('/home');
}

// Negotiation is needed
const negotiationNeededListener = (peerConnection, socket, remoteSocketId) => {
    console.log("NEGOTIATION NEEDED")
    createOffer(peerConnection).then((offer) => {
        socket.emit('NEGOTIATION_DONE', { to: remoteSocketId?.current, offer });
    })
    .catch(err => {
        console.log("Something went wrong!!!")
    })
}

// Accept negotiation offer and return the answer 
const negotiationDoneListener = async ({ from, offer }, peerConnection, socket, remoteSocketId) => {
    console.log("NEGOTIATION DONE")
    socket.emit("REMOTE_VIDEO_ENABLED", {to: remoteSocketId?.current});
    socket.emit("REMOTE_AUDIO_ENABLED", {to: remoteSocketId?.current});
    createAnswer(peerConnection, offer).then(async (ans) => {
        socket.emit("NEGOTIATION_FINAL", { to: from, ans });
    })
    .catch(err => {
        console.log("Something went wrong !!!!")
    })
}

// Negotiation completed
const negotiationFinalListener = async ({ from, ans }, socket, remoteSocketId) => {
    console.log("NEGOTIATION FINAL")
    socket.emit("REMOTE_VIDEO_ENABLED", {to: remoteSocketId?.current});
    socket.emit("REMOTE_AUDIO_ENABLED", {to: remoteSocketId?.current});
}

// If the room already have 2 participants
const roomFullListener = (navigate) => {
    toast.error("Meeting is going on. Please try again after some time.");
    navigate('/home');
}

export {
    userJoinedListener,
    userJoinedBeforeListener,
    incomingCallListener,
    callAcceptedListener,
    callEndListener,
    negotiationNeededListener,
    negotiationDoneListener,
    negotiationFinalListener,
    roomFullListener
}