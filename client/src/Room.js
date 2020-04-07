import React, { Component } from "react";
import { navigate } from "@reach/router";
import socketIOClient from "socket.io-client";
import update from "immutability-helper";

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
      rounds: [], // going from latest round to earliest
    };
  }

  componentDidMount() {
    const socket = socketIOClient(window.location.hostname + ":" + window.location.port);
    this.socket = socket;
    this.joinRoom(this.props.roomName);

    const setCurrRoundState = (updater) => {
      this.setState(state => {
        if (state.rounds.length === 0)
          return state;
        return update(state, {
          rounds: { 0: updater }
        });
      });
    }

    socket.on("players", (players, playerOrder, spectators) => this.setState({ players, playerOrder, spectators }));
    socket.on("phase", (phase, roundId, activePlayer) => {
      const round = this.getCurrRound();
      if (round === undefined || round.roundId !== roundId) {
        // make new round
        this.setState(state => update(state, {
          phase: { $set: phase },
          rounds: {
            $splice: [[0, 0, {
              roundId,
              activePlayer
            }]]
          }
        }));
        return;
      }
      this.setState(state => update(state, {
        phase: { $set: phase },
        rounds: {
          0: {
            activePlayer: { $set: activePlayer }
          }
        }
      }));
    });
    socket.on("word", word => setCurrRoundState({ word: { $set: word } }));
    socket.on("myClue", myClue => setCurrRoundState({ myClue: { $set: myClue } }));
    socket.on("clues", clues => setCurrRoundState({ clues: { $set: clues } }));
    socket.on("guess", guess => setCurrRoundState({ guess: { $set: guess } }));
    socket.on("judgment", judgment => setCurrRoundState({ judgment: { $set: judgment } }));
  }

  getCurrRound = () => {
    if (this.state.rounds.length === 0)
      return undefined;
    return this.state.rounds[0];
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
    const round = this.getCurrRound();
    const activePlayer = round ? round.activePlayer : undefined;
    const word = round ? round.word : undefined;
    const guess = round ? round.guess : undefined;
    const judgment = round ? round.judgment : undefined;
    const myClue = round ? round.myClue : undefined;

    const amActive = this.state.myName === activePlayer;

    let roundsJsx = [];
    for (const [i, round] of this.state.rounds.entries()) {
      roundsJsx.push(<Round
        key={i}
        players={this.state.players}
        playerOrder={this.state.playerOrder}
        spectating={this.state.spectating}
        handleKick={this.handleKick}
        toggleClue={this.toggleClue}
        myName={this.state.myName}
        phase={this.state.phase}
        isCurrRound={i === 0}
        round={round}
      />);
      if (i === 0) {
        roundsJsx.push(<Subaction
          handlePhase={this.handlePhase}
          phase={this.state.phase}
          spectating={this.state.spectating}
          spectators={this.state.spectators}
        />);
      }
    }

    return (
      <div className="Room-Wrapper">
        <NavBar
          changeRoom={this.changeRoom}
          leaveRoom={this.leaveRoom}
          roomName={this.props.roomName}
        />
        <Status
          phase={this.state.phase}
          word={word}
          guess={guess}
          activePlayer={activePlayer}
          amActive={amActive}
        />
        <Action
          phase={this.state.phase}
          word={word}
          guess={guess}
          activePlayer={activePlayer}
          myClue={myClue}
          judgment={judgment}
          amActive={amActive}
          handlePhase={this.handlePhase}
          spectating={this.state.spectating}
          submitClue={this.submitClue}
          submitGuess={this.submitGuess}
          submitJudge={this.submitJudge}
          submitReveal={this.submitReveal}
        />
        {roundsJsx}
      </div>
    );
  }
}

function Round(props){
  return [
    <div style={{ paddingTop: "20px" }}>
      (round {props.round.roundId}, <b>{props.round.activePlayer}</b>) word: <b>{props.round.word ? props.round.word : "???"}</b>
      {
        props.round.guess ?
        <span>, guess: <b>{props.round.guess}</b></span> :
        ""
      }
      {
        (props.round.judgment !== undefined) ?
        (
          props.round.judgment ?
          <span style={{ color: "green" }}> (correct)</span>:
          <span style={{ color: "red" }}> (wrong)</span>
        ) :
        ""
      }
    </div>,
    <Players
      phase={props.isCurrRound ? props.phase : "end"}
      amActive={props.isCurrRound ? (props.myName === props.round.activePlayer) : false}
      clues={props.round.clues}
      activePlayer={props.round.activePlayer}
      players={props.players}
      playerOrder={props.playerOrder}
      spectating={props.isCurrRound ? props.spectating : true}
      handleKick={props.handleKick}
      toggleClue={props.toggleClue}
    />
  ];
};

export default Room;
