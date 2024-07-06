import { useCallback, useContext, useState, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { AbsoluteCenter, Center, Avatar, Box, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect } from "react";
import { BiMicrophone, BiMicrophoneOff, BiSolidVideo, BiSolidVideoOff, BiSolidMessage } from "react-icons/bi";
import { MdCallEnd, MdOutlineScreenShare, MdOutlineStopScreenShare } from "react-icons/md";
import { SocketContext } from "../context/SocketContextProvider";
import createPeerConnection from "../webrtc utilities/createPeerConnection";
import { useSelector } from "react-redux";
import prepForCall from "../webrtc utilities/prepForCall";
import { callAcceptedListener, incomingCallListener, userJoinedListener, userJoinedBeforeListener, negotiationNeededListener, negotiationDoneListener, negotiationFinalListener, callEndListener, roomFullListener } from '../webrtc utilities/socketListeners';
import MessageDrawer from "../components/MessageDrawer";
import { toast } from "react-toastify";

const Meeting = () => {

    const [peerConnection, setPeerConnection] = useState();
    const [isPeersConnected, setIsPeersConnected] = useState(false);
    const [localStream, setLocalStream] = useState();
    const [localScreenStream, setLocalScreenStream] = useState();
    const [dataChannel, setDataChannel] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const remoteSocketId = useRef();
    const [remoteUserName, setRemoteUserName] = useState();
    const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(true);
    const [isLocalAudioEnabled, setIsLocalAudioEnabled] = useState(true);
    const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false);
    const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(false);

    const [getAudio, setGetAudio] = useState(true);
    const [getVideo, setGetVideo] = useState(true);
    const [getScreen, setGetScreen] = useState(false);

    const { isOpen: isMessageDrawerOpen, onOpen: onMessageDrawerOpen, onClose: onMessageDrawerClose } = useDisclosure();

    const navigate = useNavigate();

    const socket = useContext(SocketContext)
    const auth = useSelector(state => state.auth);
    const location = useLocation();
    const meetingCode = location.state?.meetingCode;

    const setRemoteSocketId = (id) => {
        remoteSocketId.current = id;
    }

    const callEndHandler = async () => {
        localStream.getTracks().forEach(track => track.stop())
        if (localScreenStream) {
            localScreenStream.getTracks().forEach(track => track.stop())
        }
        localStream.getTracks().forEach(track => track.stop())
        socket.emit("MEETING_ENDED", { to: remoteSocketId?.current, meetingCode });
        await peerConnection.close();
        return navigate('/home');
    }

    const screenShareHandler = async () => {
        if (peerConnection) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia();
                const [videoTrack] = await screenStream.getVideoTracks();
                const sender = await peerConnection.getSenders().find((s) => s.track.kind === 'video');
                sender.replaceTrack(videoTrack);
                document.getElementById('local-screen-video').srcObject = screenStream;
                setLocalScreenStream(screenStream);
                socket.emit("REMOTE_VIDEO_ENABLED", { to: remoteSocketId?.current });
            }
            catch (err) {
                console.log(err);
                setGetScreen(false);
                toast.error(err.message);
            }
        }
    }

    // Creating the peer connection
    const initConnection = async () => {
        const { peerConnection, dataChannel, remoteStream } = await createPeerConnection();
        setPeerConnection(peerConnection);
        setDataChannel(dataChannel);
        setRemoteStream(remoteStream);
        const remoteVideo = document.getElementById('remote-video');
        remoteVideo.srcObject = remoteStream;
        if (peerConnection) {
            // Emit that the user has joined the meeting
            socket.emit("MEETING_JOINED", { email: auth?.email, meetingCode, name: auth?.name })
        }
    }

    useEffect(() => {
        initConnection();
    }, [])

    // Getting the user camera and mic access
    useEffect(() => {
        prepForCall(setLocalStream)
            .catch(async err => {
                // Else return to homepage
                // TODO -> EMIT USER LEFT
                toast.error(err.message);
                if (peerConnection) {
                    await peerConnection.close();
                }
                navigate('/home');
            });
    }, []);

    // Sending and stoping audio, video and screen sharing streams
    useEffect(() => {
        if (localStream) {
            console.log("REMOTE SOCKET ID", remoteSocketId)
            if (!getVideo) {
                socket.emit("REMOTE_VIDEO_DISABLED", { to: remoteSocketId?.current });
                setIsLocalVideoEnabled(false);
                localStream.getVideoTracks().forEach(track => {
                    track.enabled = false;
                })
            }
            else {
                socket.emit("REMOTE_VIDEO_ENABLED", { to: remoteSocketId?.current });
                setIsLocalVideoEnabled(true);
                localStream.getVideoTracks().forEach(track => {
                    track.enabled = true;
                })
            }

            if (!getScreen) {
                if (localScreenStream) {
                    if(!getVideo){
                        socket.emit("REMOTE_VIDEO_DISABLED", { to: remoteSocketId?.current });
                    }
                    const [videoTrack] = localStream.getVideoTracks()
                    const sender = peerConnection.getSenders().find((s) => s.track.kind === 'video');
                    sender.replaceTrack(videoTrack);
                    localScreenStream.getTracks().forEach(track => track.stop());
                    setLocalScreenStream(null);
                }
            }
            else {
                screenShareHandler();
            }

            if (!getAudio) {
                socket.emit("REMOTE_AUDIO_DISABLED", { to: remoteSocketId?.current });
                setIsLocalAudioEnabled(false);
                localStream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                })
            }
            else {
                socket.emit("REMOTE_AUDIO_ENABLED", { to: remoteSocketId?.current });
                setIsLocalAudioEnabled(true);
                localStream.getAudioTracks().forEach(track => {
                    track.enabled = true;
                })
            }
        }
    }, [localStream, getVideo, getAudio, getScreen])

    // Add audio and video stream to the peer connection
    useEffect(() => {
        if (peerConnection && localStream) {
            console.log("Adding Stream")
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            })
        }
    }, [localStream, peerConnection])

    // Handling negotiation
    useEffect(() => {
        if (peerConnection) {
            console.log("negotiation needed listener added....")
            peerConnection.addEventListener('negotiationneeded', () => {
                console.log("negotiation needed ....")
                negotiationNeededListener(peerConnection, socket, remoteSocketId)

            });
        }

        return () => {
            if (peerConnection) {
                console.log("negotiation needed listener added....")
                peerConnection.removeEventListener('negotiationneeded', () => negotiationNeededListener(peerConnection, socket, remoteSocketId));
            }
        }
    }, [peerConnection])

    // Listening for Peer connection events
    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('track', (e) => {
                console.log("Got remote tracks...")
                e.streams[0].getTracks().forEach(track => {
                    remoteStream.addTrack(track, remoteStream);
                })
            })
            peerConnection.addEventListener('connectionstatechange', (e) => {
                console.log("Connection state -> ", peerConnection.connectionState)
                if (peerConnection.connectionState === 'connected') {
                    setIsPeersConnected(true);
                }
            })
        }

        return () => {
            if (peerConnection) {
                peerConnection.removeEventListener('track', (e) => {
                    console.log("Got remote tracks...")
                    e.streams[0].getTracks().forEach(track => {
                        remoteStream.addTrack(track, remoteStream);
                    })
                })
                peerConnection.removeEventListener('connectionstatechange', (e) => {
                    if (peerConnection.connectionState === 'connected') {
                        setIsPeersConnected(true);
                    }
                })
            }
        }
    }, [peerConnection]);

    // Listening for websocket events
    useEffect(() => {
        if (peerConnection) {
            socket.on('USER_JOINED', (data) => userJoinedListener(data, setRemoteUserName, setRemoteSocketId, peerConnection, socket));
            socket.on('USER_JOINED_BEFORE', (data) => userJoinedBeforeListener(data, setRemoteUserName, setRemoteSocketId));
            socket.on('INCOMING_CALL', (data) => incomingCallListener(data, remoteSocketId, peerConnection, socket));
            socket.on('CALL_ACCEPTED', (data) => callAcceptedListener(data, peerConnection, socket));
            socket.on('NEGOTIATION_DONE', (data) => negotiationDoneListener(data, peerConnection, socket, remoteSocketId));
            socket.on('NEGOTIATION_FINAL', (data) => negotiationFinalListener(data, socket, remoteSocketId));
            socket.on('MEETING_ENDED', () => callEndListener(peerConnection, navigate));
            socket.on('ROOM_FULL', () => roomFullListener(navigate));
            socket.on('REMOTE_VIDEO_ENABLED', () => setIsRemoteVideoEnabled(true));
            socket.on('REMOTE_VIDEO_DISABLED', () => setIsRemoteVideoEnabled(false));
            socket.on('REMOTE_AUDIO_ENABLED', () => setIsRemoteAudioEnabled(true));
            socket.on('REMOTE_AUDIO_DISABLED', () => setIsRemoteAudioEnabled(false));
        }


        return () => {
            if (peerConnection) {
                socket.off('USER_JOINED', (data) => userJoinedListener(data, setRemoteUserName, setRemoteSocketId, peerConnection, socket));
                socket.off('USER_JOINED_BEFORE', (data) => userJoinedBeforeListener(data, setRemoteUserName, setRemoteSocketId));
                socket.off('INCOMING_CALL', (data) => incomingCallListener(data, remoteSocketId, peerConnection, socket));
                socket.off('CALL_ACCEPTED', (data) => callAcceptedListener(data, peerConnection, socket));
                socket.off('NEGOTIATION_DONE', (data) => negotiationDoneListener(data, peerConnection, socket, remoteSocketId));
                socket.off('NEGOTIATION_FINAL', (data) => negotiationFinalListener(data, socket, remoteSocketId));
                socket.off('MEETING_ENDED', () => callEndListener(peerConnection, navigate));
                socket.off('ROOM_FULL', () => roomFullListener(navigate));
                socket.off('REMOTE_VIDEO_ENABLED', () => setIsRemoteVideoEnabled(true));
                socket.off('REMOTE_VIDEO_DISABLED', () => setIsRemoteVideoEnabled(false));
                socket.off('REMOTE_AUDIO_ENABLED', () => setIsRemoteAudioEnabled(true));
                socket.off('REMOTE_AUDIO_DISABLED', () => setIsRemoteAudioEnabled(false));
            }
        }
    }, [peerConnection]);

    return (
        <>
            <MessageDrawer onMessageDrawerClose={onMessageDrawerClose} isMessageDrawerOpen={isMessageDrawerOpen} remoteUserName={remoteUserName} dataChannel={dataChannel} peerConnection={peerConnection} />


            <Flex position="relative" width="100vw" height="100vh" overflow="hidden" flexDirection={{ base: "column-reverse", md: "row" }}>
                <Box position="relative" backgroundColor="black" width="100%" height="100%" borderRight={{ sm: "none", md: "1px solid #55545469" }} borderTop={{ sm: "1px solid #55545469", md: "none" }}>
                    <Flex position="absolute" right="5px" top="5px" fontSize="20px">
                        {isLocalAudioEnabled && <BiMicrophone color="white" />}
                        {!isLocalAudioEnabled && <BiMicrophoneOff color="white" />}
                        {isLocalVideoEnabled && <BiSolidVideo color="white" />}
                        {!isLocalVideoEnabled && <BiSolidVideoOff color="white" />}
                    </Flex>
                    {!localStream && <AbsoluteCenter><Text textColor="white">Turning on camera and microphone...</Text></AbsoluteCenter>}
                    {!getVideo && !getScreen && <AbsoluteCenter>
                        <Avatar size="xl" name={auth?.name} />
                    </AbsoluteCenter>}
                    <Text position="absolute" fontSize="18px" color="white" left="5px" top="3px">You</Text>
                    <video style={{ objectFit: "cover", height: "100%", width: "100%" }} id="local-video" autoPlay></video>
                    <video style={{ objectFit: "cover", display: `${localScreenStream ? 'block' : 'none'}`, position: "absolute", top: "32px", left: "5px", height: "50%", width: "50%" }} id="local-screen-video" autoPlay></video>
                </Box>

                <Box position="relative" backgroundColor="black" width="100%" height="100%">
                    <Flex position="absolute" right="5px" top="5px" fontSize="20px">
                        {remoteSocketId?.current && isRemoteAudioEnabled && <BiMicrophone color="white" />}
                        {remoteSocketId?.current && !isRemoteAudioEnabled && <BiMicrophoneOff color="white" />}
                        {remoteSocketId?.current && isRemoteVideoEnabled && <BiSolidVideo color="white" />}
                        {remoteSocketId?.current && !isRemoteVideoEnabled && <BiSolidVideoOff color="white" />}
                    </Flex>
                    {!remoteSocketId?.current && <Text textAlign="center" textColor="white">Waiting for other user</Text>}
                    {remoteSocketId?.current && !isPeersConnected && <Text textAlign="center" textColor="white">Connecting...</Text>}
                    {remoteSocketId?.current && remoteStream && <Text position="absolute" fontSize="18px" color="white" left="5px" top="3px">{remoteUserName}</Text>}
                    {remoteSocketId?.current && !isRemoteVideoEnabled && <AbsoluteCenter>
                        <Avatar size="xl" name={remoteUserName} />
                    </AbsoluteCenter>}
                    <video autoPlay style={{ objectFit: "cover", height: "100%", width: "100%" }} id="remote-video"></video>
                </Box>


                <Flex position="absolute" bottom="0" left="0" width="100%" justifyContent="center" alignItems="center" columnGap="5px" fontSize="4xl" padding="15px 0">
                    {getAudio && <Box onClick={() => setGetAudio(false)} backgroundColor="#3167ff" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><BiMicrophone color="white" /></Box>}
                    {!getAudio && <Box onClick={() => setGetAudio(true)} backgroundColor="#f73737" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><BiMicrophoneOff color="white" /></Box>}
                    {getVideo && <Box onClick={() => setGetVideo(false)} backgroundColor="#3167ff" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><BiSolidVideo color="white" /></Box>}
                    {!getVideo && <Box onClick={() => { setGetScreen(false); setGetVideo(true); }} backgroundColor="#f73737" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><BiSolidVideoOff color="white" /></Box>}
                    {getScreen && <Box onClick={() => setGetScreen(false)} backgroundColor="#3167ff" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><MdOutlineScreenShare color="white" /></Box>}
                    {!getScreen && <Box onClick={() => { setGetVideo(false); setGetScreen(true); }} backgroundColor="#f73737" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><MdOutlineStopScreenShare color="white" /></Box>}
                    <Box onClick={onMessageDrawerOpen} backgroundColor="#3167ff" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><BiSolidMessage color="white" /></Box>
                    <Box onClick={callEndHandler} backgroundColor="#f73737" padding="7px" marginRight="3px" cursor="pointer" borderRadius="50%"><MdCallEnd color="white" /></Box>
                </Flex>
            </Flex>
        </>
    )
}

export default Meeting;