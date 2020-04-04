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
    // socket.emit("phase")
    // socket.emit("clue")
    // socket.emit("toggle")
    // socket.emit("guess")
    // socket.emit("judge")
    // socket.emit("end")
    // socket.emit("kick")

    // socket.on("phase", (phase, activePlayer) => {

    // });
    // socket.on("word", );
    // socket.on("clue", );
    // socket.on("guess", );

    socket.on("players", (players) => this.setState({ players }));
  }

  render() {
    const { players } = this.state;

    return (
      <div id="wrapper">
        <div id="status">
          You are in room <b>room</b>.
        </div>
        <div id="action">
          <button>start game</button>
        </div>
        <div id="players">
          {players && players.map(obj => obj.name)}
        </div>
      </div>
    );
  }
}

export default App;
