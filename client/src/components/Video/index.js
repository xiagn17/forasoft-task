import React, { Component } from 'react';

import './index.css'

import createPeerConnections from './createPeerConnections';
import setOutConnectionHandlers from './setOutConnectionHandlers';

class Video extends Component {

    constructor () {
        super();

        this.state = {
            mediaStream: null,      // Video-stream from us
            outPeerConnections: [],
            minePeerConnection: null,
            nameSource: null,
            showStream: false,      // triggers when someone started/finished stream
            connectedCounter: 0
        }
    }

    startSession = () => {
        const { usersNum, socket } = this.props;
        const mediaConst = {
            video: true,
            audio: true
        };

        // creating peerConnection with ID to everyone in the room expect of us [array]
        const outPeerConnections = createPeerConnections(usersNum - 1);
        // Gets a content from your device
        navigator.mediaDevices.getUserMedia(mediaConst)
            .then((mediaStream) => {

                // For all outgoing connections
                outPeerConnections.forEach((peerConnectionWithID, i, arr) => {
                    const { peerConnection } = peerConnectionWithID;
                    // Set up tracks
                    mediaStream.getTracks()
                        .forEach((track) => peerConnection.addTrack(track, mediaStream));

                    // Handlers and signaling
                    setOutConnectionHandlers(socket, peerConnectionWithID, i === (arr.length - 1));

                });

                // Saves out mediaStream to have an ability to stop him in the future
                this.setState({
                    mediaStream,
                    outPeerConnections
                });

            })
            .catch((error) => {
                console.log('navigator.getUserMedia error: ', error);
            });

    };

    finishSession = () => {
        const { mediaStream } = this.state;
        const { socket } = this.props;

        // Clears all mediaStreams
        mediaStream.getTracks().forEach(track => track.stop());
        // Sends to other participants event to close session
        socket.emit('close-video');
        // Return to initial state
        this.setState({
            mediaStream: null,
            outPeerConnections: [],
            connectedCounter: 0
        })
    };

    // Handles start/stop streaming
    handleVideoShow = () => {
        const { mediaStream } = this.state;

        !mediaStream ? this.startSession() : this.finishSession();
    };


    // Setting the video element
    setVideoToEl = (mediaStream) => {
        if (this._videoRef) {
            if (this._videoRef.srcObject) {
                return;
            }

            this._videoRef.srcObject = mediaStream;
        }
    };


    componentDidMount () {
        const { socket } = this.props;

        socket.on('already-streaming', () => {
            this.setState({
                showStream: true
            })
        });

        socket.on('sdp-creator-offer', (offer, nameSource) => {

            const minePeerConnection = new RTCPeerConnection(null);

            let socketPeerID;
            let peerID;

            // Adds a candidate and emits an answer in response to the offer
            new Promise((resolve, reject) =>
                socket.on('candidate-creator-first', (candidate, socketID, peer) => {
                    minePeerConnection.addIceCandidate(candidate)
                        .catch(() => console.log('Error to add IceCandidate, peerID: ', peerID));


                    socketPeerID = socketID;
                    peerID = peer;
                    resolve(socketPeerID);
                })
            )
                .then((socketPeerID) => {
                    minePeerConnection.createAnswer()
                        .then(answer => {
                            minePeerConnection.setLocalDescription(answer);

                            socket.emit('sdp-answer', answer, socketPeerID);
                        });
                });

            // Sets the accepted offer
            minePeerConnection.setRemoteDescription(offer)
                .catch(() => console.log('Can\'t to establish connection, peerID: ', peerID));

            // if connection break off, or hoster went away
            minePeerConnection.addEventListener("iceconnectionstatechange", () => {
                if (minePeerConnection.iceConnectionState === "failed" ||
                    minePeerConnection.iceConnectionState === "disconnected" ||
                    minePeerConnection.iceConnectionState === "closed") {
                    this.setVideoToEl(null);
                    this.setState({
                        showStream: false,
                        minePeerConnection: null
                    });
                }
            });

            minePeerConnection.addEventListener("icecandidate", ({ candidate }) => {
                if (candidate) {
                    socket.emit('candidate-receiver', candidate, socketPeerID, peerID)
                }
            });

            // Set up the media when tracks(mediaStream) arrives from the source
            minePeerConnection.ontrack = (event) => {
                this.setState({
                    showStream: true
                });

                this.setVideoToEl(event.streams[0]);
            };


            this.setState({
                minePeerConnection,
                nameSource
            })
        });




        socket.on('sdp-answer', (answer, peerID) => {
            const { outPeerConnections } = this.state;

            // Accepts answer and sets it up
            outPeerConnections[peerID].peerConnection.setRemoteDescription(answer)
                .then(() => {
                    this.setState((prevState) => ({
                        connectedCounter: ++prevState.connectedCounter
                    }));
                })
                .catch(() => console.dir('Can\'t to establish connection, peerID: ', peerID, outPeerConnections));


            // Tries to add a candidate when he is ready
            socket.on('candidate-receiver', (candidate, socketPeerID, peerID) => {
                console.dir(outPeerConnections);
                outPeerConnections[peerID].peerConnection.addIceCandidate(candidate)
                    .catch(() => console.log('Error addIceCandidate, peerID: ', peerID));
            });


        });


        // Signal to close session from the source
        socket.on('close-video', () => {
            this.setVideoToEl(null);
            this.setState({
                showStream: false,
                minePeerConnection: null,
                nameSource: null
            });

        });


    }
    // True when all outgoing peers is exchanging
    isAllConnected = () => {
        const { outPeerConnections, connectedCounter } = this.state;

        return connectedCounter === outPeerConnections.length
    };

    // If we started a session, it will set the video at our element
    componentDidUpdate (prevProps, prevState) {
        const { mediaStream } = this.state;

        if (prevState.mediaStream !== mediaStream && mediaStream) {
            this.setVideoToEl(mediaStream);
        }
    }

    getVideoRef = (node) => this._videoRef = node;

    render () {
        const {
            mediaStream,
            showStream,
            nameSource
        } = this.state;


        return (
            <div className='video'>
                {
                    mediaStream || showStream ?
                        <div className='video-stream'>
                            {
                                nameSource ?
                                    <span className='streamer-name'>
                                        {nameSource} is streaming now
                                    </span>
                                    :
                                    null
                            }
                            <video
                                autoPlay={true}
                                ref={this.getVideoRef}
                            />
                        </div>

                        :
                        null
                }
                {
                    !showStream ?
                            (
                                this.isAllConnected() ?
                                    <button onClick={this.handleVideoShow}>
                                        { mediaStream ? 'Stop streaming' : 'Start Streaming' }
                                    </button>
                                    :
                                    <i className="fas fa-spinner" />
                            )
                        :
                        null
                }

            </div>
        );
    }
}


export default Video;