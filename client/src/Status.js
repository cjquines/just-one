import React, { Component } from "react";

class Status extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    let content = "";

    if (this.props.phase === "wait") content ="waiting for players..."
    else if (this.props.amActive) content = "you are guessing!";
    else content = `${this.props.activePlayer}'s word is ${this.props.word}.`

    return (<div className="Status-Wrapper">{content}</div>);
  }
}

export default Status;
