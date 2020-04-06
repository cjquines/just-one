import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import Action from "./Action.js";
import Players from "./Players.js";
import Status from "./Status.js";

import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      phase: "wait",
      spectating: false,
    };
  }

  componentDidMount() {
    const socket = socketIOClient(window.location.hostname + ":" + 4001);
    this.socket = socket;

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

  handleKick = name => this.socket.emit("kick", name);
  handlePhase = phase => this.socket.emit("phase", phase);
  submitClue = clue => this.socket.emit("clue", clue);
  submitGuess = guess => this.socket.emit("guess", guess);
  submitJudge = judgment => this.socket.emit("judge", judgment);
  submitReveal = () => this.socket.emit("reveal");
  toggleClue = name => this.socket.emit("toggle", name);

  render() {
    const amActive = this.state.myName === this.state.activePlayer;
    const myClue = this.state.clues && this.state.clues[this.state.myName].clue;

    return (
      <div className="App-Wrapper">
        <Status
          activePlayer={this.state.activePlayer}
          amActive={amActive}
          phase={this.state.phase}
          word={this.state.word}
        />
        <Action
          activePlayer={this.state.activePlayer}
          amActive={amActive}
          guess={this.state.guess}
          handlePhase={this.handlePhase}
          judgment={this.state.judgment}
          myClue={myClue}
          phase={this.state.phase}
          spectating={this.state.spectating}
          submitClue={this.submitClue}
          submitGuess={this.submitGuess}
          submitJudge={this.submitJudge}
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
          spectators={this.state.spectators}
        />
      </div>
    );
  }
}

export default App;
