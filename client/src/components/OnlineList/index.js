import React from 'react';

import './index.css'


const OnlineList = ({ onlineUsers, closeList }) => {

    return (
        <div className='onlineList'>
            <header>
                {onlineUsers.length} User(s) Online now:
            </header>
            <main>
                <ul>
                    {
                        onlineUsers.map((user) => {
                            return (
                                <li
                                    className='onlineList-user'
                                    key={user.id}
                                >
                                    {user.name}
                                </li>
                            );
                        })
                    }
                </ul>
            </main>
            <button onClick={closeList}>
                Close
            </button>
        </div>
    );
};


export default OnlineList;