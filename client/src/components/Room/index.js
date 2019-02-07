import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import io from 'socket.io-client';

import Chat from '../Chat';
import OnlineList from '../OnlineList';
import Video from '../Video';

import './index.css';

import getRoomID from './getRoomID';



class Room extends Component {

    constructor () {
        super();

        this.state = {
            socket: null,
            showOnlineList: false
        }
    }


    componentDidMount () {
        const {
            name,
            roomID,
            setRoom,
            setOnlineUsers
        } = this.props;

        // Establishes a socket-connection and saves it to State for reuse
        const socket = io();
        this.setState({ socket });

        // Gets ID of our room from this.props.location
        const ID = getRoomID(this);
        // If user have been invited by the link, remembers room's ID in the App
        if (!roomID) {
            setRoom(ID);
        }

        // Establishes connect with room
        socket.emit('connectToRoom', roomID || ID, name);
        // Updates currently users when someone has joined/disconnected
        socket.on('updatedRoom', (room) => {
            const { onlineUsers } = room;
            setOnlineUsers(onlineUsers);
        })

    }

    componentDidUpdate(oldProps) {
        const newProps = this.props;
        const { socket } = this.state;

        // If an invited user has entered the name, adds him to the list of users
        if(oldProps.name !== newProps.name) {
            socket.emit('addUser', newProps.name);
        }
    }

    // Show / hide online users
    triggerOnlineList = () => {
        this.setState(prevState => ({
            showOnlineList: !prevState.showOnlineList
        }))
    };


    render () {
        const { socket, showOnlineList } = this.state;
        const { name, onlineUsers } = this.props;

        return (
            <div className='Room'>
                {
                    showOnlineList ?
                        <OnlineList
                            onlineUsers={onlineUsers}
                            closeList={this.triggerOnlineList}
                        />
                        :
                        null
                }
                <header className='Room-header'>
                    This is the private chat-room,&nbsp;
                    <span
                        className='span-online'
                        onClick={this.triggerOnlineList}
                    >
                        now Online
                    </span>: {onlineUsers.length}
                </header>
                {
                    socket ?
                        <Fragment>
                            <Chat
                                name={name}
                                socket={socket}
                            />
                            <Video
                                socket={socket}
                                usersNum={onlineUsers.length}
                            />
                        </Fragment>
                        :
                        null
                }

            </div>
        );
    }
}




export default withRouter(Room);