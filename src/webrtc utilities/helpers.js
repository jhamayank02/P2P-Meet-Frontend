const createOffer = (peerConnection) => {
    return new Promise(async (resolve, reject) => {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
            resolve(offer);
        }
        catch (err) {
            reject(err);
        }
    })
}

const createAnswer = (peerConnection, offer) => {
    return new Promise(async (resolve, reject) => {
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            const ans = await peerConnection.createAnswer(offer);
            await peerConnection.setLocalDescription(new RTCSessionDescription(ans));
            resolve(ans);
        }
        catch (err) {
            reject(err);
        }
    })

}

const setLocalDescription = async (peerConnection, ans) => {
    try {
        await peerConnection.setLocalDescription(new RTCSessionDescription(ans));
    }
    catch (err) {
        console.log(err);
    }
}

const setRemoteDescription = async (peerConnection, ans) => {
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(ans));
    }
    catch (err) {
        console.log(err);
    }
}

const closePeerConnection = async (peerConnection) => {
    try {
        await peerConnection.close();
    }
    catch (err) {
        console.log(err);
    }
}

export {
    createOffer,
    createAnswer,
    setLocalDescription,
    setRemoteDescription,
    closePeerConnection
}