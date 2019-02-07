
export default function (length) {
    let array = [];

    for (let i = 0; i < length; i++) {
        array.push({
            peerConnection: new RTCPeerConnection(null),
            id: i
        });
    }

    return array;
}