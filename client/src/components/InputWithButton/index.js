import React, { Fragment, Component } from 'react';


class InputWithButton extends Component {


    constructor () {
        super();

        this.state = {
            inputValue: ''
        }
    }

    onInputChange = (event) => {
        this.setState({
            inputValue: event.target.value
        });
    };

    // Executes main function(from props) and removes input's value
    onButtonClick = () => {
        const { inputValue } = this.state;
        const { onClick } = this.props;

        onClick(inputValue);

        this.setState({
            inputValue: ''
        });
    };

    // Clicks the button when pressing Enter in focus on smth
    handleEnter = (event) => {
        event = event || window.event;

        if (event.keyCode === 13) {
            this._button.click();
        }
    };

    // Creates handler at chat-input
    componentDidMount () {
        this._input.addEventListener('keyup', this.handleEnter);
    }

    componentWillUnmount () {
        this._input.removeEventListener('keyup', this.handleEnter);
    }

    getInputRef = (node) => this._input = node;
    getButtonRef = (node) => this._button = node;

    render () {
        const { inputValue } = this.state;
        const {
            children,
            onClick,
            ...props
        } = this.props;

        return (
            <Fragment>
                <input
                    type="text"
                    value={inputValue}
                    onChange={this.onInputChange}
                    ref={this.getInputRef}
                    { ...props }
                />
                <button
                    onClick={this.onButtonClick}
                    ref={this.getButtonRef}
                >
                    {children}
                </button>
            </Fragment>
        );
    }
}




export default InputWithButton;