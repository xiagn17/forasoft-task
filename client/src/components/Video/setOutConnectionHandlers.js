export default function (socket, { peerConnection, id }, isEnd) {

    let isNegotiating = false;

    // Triggers when .addTrack is called
    peerConnection.addEventListener("negotiationneeded", () => {

        if (isNegotiating) {
            return;
        }
        isNegotiating = true;

        // Creates a first offer and set it to localDescription
        peerConnection.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true
        })
            .then((offer) => {
                // Sets SDP for the first time
                peerConnection.setLocalDescription(offer);

                // If this is the last peer that have to offer
                if (isEnd) {
                    socket.emit('sdp-creator-offer-end', offer, id)
                }
                else {
                    socket.emit('sdp-creator-offer', offer, id);
                }

            });

    });


    peerConnection.addEventListener("icecandidate", ({ candidate }) => {
        if (candidate) {
            socket.emit('candidate-creator-first', candidate, id)
        }

    });

    // skip nested negotiations
    peerConnection.addEventListener("signalingstatechange", (e) => {
        isNegotiating = (peerConnection.signalingState !== "stable");
    });

}