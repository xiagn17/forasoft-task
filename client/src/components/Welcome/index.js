import React from 'react';
import { withRouter } from 'react-router-dom';
import uniqid from 'uniqid';

import InputWithButton from '../InputWithButton';

import './index.css';



const Welcome = ({
         submitName,
         roomID,
         setRoom,
         nameError,
         history
    }) => {

    const onClick = (inputValue) => {
        const createRoom = submitName(inputValue);

        // If we haven't room and username is valid, creates new room and redirects to it
        if (!roomID && createRoom) {
            const ID = uniqid();
            setRoom(ID);

            history.push(`/room/${ID}`);
        }
    };


    const { duplicateName, notValidLength } = nameError;

    return (
        <div className='welcome-fixed'>
            <div className="welcome">
                Please, enter your name:
                <InputWithButton
                    placeholder={notValidLength ? 'Invalid name' : (duplicateName ? 'User already exists' : 'Nikita')}
                    className={duplicateName || notValidLength ? 'error' : ''}
                    onClick={onClick}
                >
                    SUBMIT
                </InputWithButton>
            </div>
        </div>
    );

};


export default withRouter(Welcome);