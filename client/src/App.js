import React, { Component } from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    const socket = socketIOClient("http://localhost:4001");
    this.setState({ socket });

    const myName = prompt("Enter your name") || undefined;
    this.setState({ myName });

    socket.emit("name", myName);
    socket.on("players", (players, playerOrder) => this.setState({ players, playerOrder }));
    socket.on("phase", (phase, activePlayer) => this.setState({ phase, activePlayer }));

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

  }

  handleKick = (e, name) => {
    this.state.socket.emit("kick", name);
  }

  render() {
    const { players, playerOrder } = this.state;

    return (
      <div id="wrapper">
        <div id="status">
          You are in room <b>room</b>.
        </div>
        <div id="action">
          <button>start game</button>
        </div>
        <div id="players">
          {playerOrder && playerOrder.map(name => (
              <div>
                {name}
                {players[name].status}
                <button onClick={e => this.handleKick(e, name)}>kick</button>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default App;
