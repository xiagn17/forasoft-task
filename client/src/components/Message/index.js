import React from 'react';

import './index.css';



const Message = ({
        text,
        unixTime,
        user,
        myMessage
    }) => {

    // Converts unixTime to HH:MM:SS
    const time = `${(new Date(unixTime)).toTimeString().slice(0, 8)}`;

    return (
        <li
            className={'msg ' +  (myMessage ? 'my-msg' : '')}
        >
            <header className='msg-header'>
                {user + ' at ' + time}
            </header>
            <main className='msg-mainText'>
                {text}
            </main>
        </li>
    );
};



export default Message;