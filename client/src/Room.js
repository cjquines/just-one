import React, { Component } from "react";
import { navigate } from "@reach/router";
import socketIOClient from "socket.io-client";

import Action from "./Action.js";
import NavBar from "./NavBar.js";
import Players from "./Players.js";
import Status from "./Status.js";
import Subaction from "./Subaction.js";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: "wait",
      spectating: false,
    };
  }

  componentDidMount() {
    const socket = socketIOClient(window.location.hostname + ":" + window.location.port);
    this.socket = socket;
    this.joinRoom(this.props.roomName);

    socket.on("players", (players, playerOrder, spectators) => this.setState({ players, playerOrder, spectators }));
    socket.on("phase", (phase, activePlayer) => this.setState({ phase, activePlayer }));
    socket.on("word", word => this.setState({ word }));
    socket.on("myClue", myClue => this.setState({ myClue }));
    socket.on("clues", clues => this.setState({ clues }));
    socket.on("guess", guess => this.setState({ guess }));
    socket.on("judgment", judgment => this.setState({ judgment }));
  }

  joinRoom = (roomName) => {
    const socket = this.socket;
    socket.emit("join", roomName);

    let myName = undefined;
    if (this.props.location && this.props.location.state && this.props.location.state.name) {
      myName = this.props.location.state.name;
      this.props.location.state.name = undefined;
    } else {
      myName = prompt("enter your name") || undefined;
    }
    if (myName) {
      this.setState({ myName, spectating: false });
      socket.emit("name", myName);
    } else {
      this.setState({ spectating: true });
      socket.emit("spectator");
    }
    this.setState({ roomName });
  }

  leaveRoom = () => this.socket.emit("leave", this.state.roomName);

  changeRoom = () => {
    const roomName = prompt("enter new room") || undefined;
    if (roomName) {
      if (this.state.phase !== "disconnected") this.leaveRoom();
      navigate(`/room/${roomName}`);
      this.joinRoom(roomName);
    }
  }

  handleKick = name => this.socket.emit("kick", name, this.state.players[name].id);
  handlePhase = phase => this.socket.emit("phase", phase);
  submitClue = clue => this.socket.emit("clue", clue);
  submitGuess = guess => this.socket.emit("guess", guess);
  submitJudge = judgment => this.socket.emit("judge", judgment);
  submitReveal = thing => this.socket.emit("reveal", thing);
  toggleClue = name => this.socket.emit("toggle", name);

  render() {
    const amActive = this.state.myName === this.state.activePlayer;

    return (
      <div className="Room-Wrapper">
        <NavBar
          changeRoom={this.changeRoom}
          leaveRoom={this.leaveRoom}
          roomName={this.props.roomName}
        />
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
          myClue={this.state.myClue}
          phase={this.state.phase}
          spectating={this.state.spectating}
          submitClue={this.submitClue}
          submitGuess={this.submitGuess}
          submitJudge={this.submitJudge}
          submitReveal={this.submitReveal}
          word={this.state.word}
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
          spectating={this.state.spectating}
        />
        <Subaction
          handlePhase={this.handlePhase}
          phase={this.state.phase}
          spectating={this.state.spectating}
          spectators={this.state.spectators}
        />
      </div>
    );
  }
}

export default Room;
