import React, { Component } from 'react';
import { Route } from 'react-router-dom'

import Welcome from '../Welcome';
import Room from '../Room';

import isNameDuplicated from './isNameDuplicated';
import isNameLengthValid from './isNameLengthValid'


class App extends Component {

    constructor () {
        super();

        this.state = {
            name: null,     // username
            roomID: null,   // current room's id
            nameError: {
                duplicateName: false,
                notValidLength: false
            },
            onlineUsers: []
        }
    }

    // Returns true if username is successfully created, else - false
    submitName = (name) => {
        const { onlineUsers } = this.state;

        // Is name valid
        const duplicateName = isNameDuplicated(name, onlineUsers);
        const notValidLength = isNameLengthValid(name);

        this.setState({
            nameError: { duplicateName, notValidLength }
        });


        if (name !== '' && !notValidLength
            && !duplicateName && !duplicateName) {

            this.setState({
                name
            });

            return true;
        }

        return false;
    };


    setRoom = (roomID) => {
        this.setState({ roomID })
    };

    setOnlineUsers = (onlineUsers) => {
        this.setState({ onlineUsers });
    };



    render() {
        const {
            name,
            roomID,
            nameError,
            onlineUsers
        } = this.state;

        return (
            <div className="App">
                <div className="container">
                    <Route exact path='/room/:ID' render={() =>
                        <Room
                            name={name}
                            roomID={roomID}
                            setRoom={this.setRoom}
                            setOnlineUsers={this.setOnlineUsers}
                            onlineUsers={onlineUsers}
                        />
                    }/>
                    {       // While we haven't got the user's name
                        !name || nameError.duplicateName || nameError.notValidLength ?
                            <Welcome
                                submitName={this.submitName}
                                setRoom={this.setRoom}
                                roomID={roomID}
                                nameError={nameError}
                            />
                            :
                            null
                    }
                </div>
            </div>
        );
    }
}


export default App;

