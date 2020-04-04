import React, { Component } from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://localhost:4001"
    };
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);

    const myName = prompt("Enter your name") || undefined;
    this.setState({ myName });

    socket.emit("name", myName);

    socket.on("playerlist", (players) => this.setState({ players }));
  }

  render() {
    const { players } = this.state;

    return (
      <div>
        {players}
      </div>
    );
  }
}

export default App;
