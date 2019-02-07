import React, { Component } from 'react';

import Message from '../Message';
import InputWithButton from '../InputWithButton';

import './index.css';



class Chat extends Component {

    constructor () {
        super();

        this.state = {
            messages: []
        }
    }

    // Sends message to all users in the room
    sendMessage = (inputValue) => {
        const { name, socket } = this.props;

        if (inputValue !== '' && name) {
            const msg = {
                text: inputValue,
                unixTime: Date.now(),
                user: name,
                myMessage: false
            };

            socket.emit('message', msg);
        }
    };

    componentDidMount () {
        const { socket } = this.props;

        // Updates messages's state when a new message arrives
        socket.on('message', (msg) => {
            const { messages } = this.state;

            this.setState({
                messages: [...messages, msg]
            });
        });

        // Creates listener to the chat; auto-scrolling when a new message arrives
        this._chatWindow.addEventListener('DOMNodeInserted', function(event) {
            const message = event.target;

            if (this.scrollTop + message.clientHeight + 30 > this.scrollHeight - this.clientHeight)
                this.scrollTop = this.scrollHeight;
        });
    }

    getRefChatWindow = (node) => this._chatWindow = node;

    render () {
        const { messages } = this.state;

        return (
            <div className='Room-chat'>
                <div
                    className='Room-chat-messages'
                    ref={this.getRefChatWindow}
                >
                    <ul>
                        {
                            messages.map(message => {
                                const {
                                    text,
                                    unixTime,
                                    user,
                                    myMessage
                                } = message;

                                return (
                                    <Message
                                        text={text}
                                        unixTime={unixTime}
                                        user={user}
                                        myMessage={myMessage}
                                        key={unixTime}
                                    />
                                );
                            })
                        }
                    </ul>
                </div>
                <div className='Room-chat-input'>
                    <InputWithButton
                        onClick={this.sendMessage}
                        placeholder='Type here...'
                    >
                        <i className="fas fa-comment"/>
                    </InputWithButton>
                </div>
            </div>
        );
    }
}



export default Chat;