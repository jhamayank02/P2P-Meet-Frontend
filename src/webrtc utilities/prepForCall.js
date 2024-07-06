const prepForCall = (setLocalStream) => {
    return new Promise(async (resolve, reject) => {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            })

            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = stream;
            setLocalStream(stream);
            resolve();
        }
        catch (err) {
            reject(err);
        }
    })
}

export default prepForCall;