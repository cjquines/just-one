import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import Action from "./Action.js";
import Players from "./Players.js";
import Status from "./Status.js";

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
    const amActive = this.state.myName === this.state.activePlayer;
    return (
      <div id="wrapper">
        <Status
          activePlayer={this.state.activePlayer}
          amActive={amActive}
          phase={this.state.phase}
          word={this.state.word}
        />
        <Action
          amActive={amActive}
          handlePhase={this.handlePhase}
          judgment={this.state.judgment}
          phase={this.state.phase}
          submitClue={this.submitClue}
          submitGuess={this.submitGuess}
          submitJudge={this.submitJudgem}
          submitReveal={this.submitReveal}
        />
        <Players
          activePlayer={this.state.activePlayer}
          amActive={amActive}
          clues={this.state.clues}
          handleKick={this.handleKick}
          toggleClue={this.toggleClue}
          phase={this.state.phase}
          playerOrder={this.state.playerOrder}
          players={this.state.players}
          spectators{this.state.spectators}
        />
      </div>
    );
  }
}

export default App;
