import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import Players from "./Players.js";

class App extends Component {
  constructor() {
    super();
    this.state = {
      phase: "wait",
      spectating: false,
    };
  }

  componentDidMount() {
    const socket = socketIOClient("http://localhost:4001");
    this.setState({ socket });

    const myName = prompt("Enter your name") || undefined;
    if (myName) {
      this.setState({ myName });
      socket.emit("name", myName);
    } else {
      this.setState({ spectating: true });
      socket.emit("spectator");
    }
    socket.on("players", (players, playerOrder, spectators) => this.setState({ players, playerOrder, spectators }));
    socket.on("phase", (phase, activePlayer) => this.setState({ phase, activePlayer }));
    socket.on("word", word => this.setState({ word }));
    socket.on("clues", clues => this.setState({ clues }));
    socket.on("guess", guess => this.setState({ guess }));
    socket.on("judgment", judgment => this.setState({ judgment }));
  }

  handleChange = (e) => {
    this.setState({value: e.target.value});
  }

  submitClue = (e) => {
    this.state.socket.emit("clue", this.state.value);
  }

  submitGuess = (e) => {
    this.state.socket.emit("guess", this.state.value);
  }

  submitReveal = (e) => {
    this.state.socket.emit("reveal");
  }

  handlePhase = (phase) => {
    this.state.socket.emit("phase", phase);
  }

  handleKick = (name) => {
    this.state.socket.emit("kick", name);
  }

  toggleClue = (name) => {
    this.state.socket.emit("toggle", name);
  }

  submitJudge = (judgment) => {
    this.state.socket.emit("judge", judgment);
  }

  render() {
    const { activePlayer, clues, guess, judgment, myName, phase, players, playerOrder, word } = this.state;

    return (
      <div id="wrapper">
        {`The phase is ${phase}. The judgment is ${judgment ? "correct" : "incorrect"}.`}
        <div id="status">
          {
            (activePlayer === myName) ? "You are the active player." : `The word is ${word || "nothing"}. The guess was ${guess || "nothing"}.`
          }
        </div>
        <div id="action">
          <input type="text" onChange={this.handleChange}/>
          <button onClick={this.submitClue}>submit clue</button>
          <button onClick={this.submitGuess}>submit guess</button>
          <button onClick={e => this.submitJudge(false)}>judge incorrect</button>
          <button onClick={e => this.submitJudge(true)}>judge correct</button>

          <button onClick={e => this.handlePhase("clue")}>start clue</button>
          <button onClick={e => this.handlePhase("eliminate")}>start eliminate</button>
          <button onClick={e => this.handlePhase("guess")}>start guess</button>
          <button onClick={e => this.handlePhase("judge")}>start judge</button>
          <button onClick={e => this.handlePhase("end")}>start end</button>
          <button onClick={this.submitReveal}>reveal all</button>
        </div>
        <Players
          activePlayer={this.state.activePlayer}
          amActive={this.state.myName === this.state.activePlayer}
          clues={this.state.clues}
          handleKick={this.handleKick}
          toggleClue={this.toggleClue}
          phase={this.state.phase}
          playerOrder={this.state.playerOrder}
          players={this.state.players}
          socket={this.state.socket}
        />
      </div>
    );
  }
}

export default App;
