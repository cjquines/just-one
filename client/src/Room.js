import React, { Component } from "react";
import { navigate } from "@reach/router";
import socketIOClient from "socket.io-client";
import update from "immutability-helper";

import Action from "./Action.js";
import NavBar from "./NavBar.js";
import Players from "./Players.js";
import Rules from "./Rules.js";
import Status from "./Status.js";
import Subaction from "./Subaction.js";

import "./Room.css";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: "wait",
      spectating: false,
      rounds: [], // going from latest round to earliest
      rules: false,
    };
  }

  componentDidMount() {
    const port = process.env.NODE_ENV === "production" ? window.location.port : 4001;
    const socket = socketIOClient(window.location.hostname + ":" + port);
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
    socket.on("score", (correct, wrong) => this.setState({ correct, wrong }));
    socket.on("phase", (phase, roundId, activePlayer) => {
      if (phase === "disconnected") {
        this.setState(state => update(state, {
          phase: { $set: phase },
          rounds: { $set: [] },
        }));
        return;
      }
      const round = this.getCurrRound();
      if (round === undefined || round.roundId !== roundId) {
        // make new round
        setCurrRoundState({ playerOrder: { $set: this.state.playerOrder } });
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
      this.setState(state => update(state, { rounds: { $set: [] } }));
      this.joinRoom(roomName);
    }
  }

  handleKick = name => this.socket.emit("kick", name, this.state.players[name].id);
  handleSoftPhase = phase => {
    const round = this.getCurrRound();
    this.socket.emit("softPhase", phase, round && round.roundId);
  };
  handlePhase = phase => {
    const round = this.getCurrRound();
    this.socket.emit("phase", phase, round && round.roundId);
  };
  submitClue = clue => this.socket.emit("clue", clue);
  submitGuess = guess => this.socket.emit("guess", guess);
  submitJudge = judgment => this.socket.emit("judge", judgment);
  toggleClue = name => this.socket.emit("toggle", name);

  toggleRules = () => this.setState({rules: !this.state.rules});

  render() {
    const round = this.getCurrRound();
    const activePlayer = round ? round.activePlayer : undefined;
    const word = round ? round.word : undefined;
    const guess = round ? round.guess : undefined;
    const judgment = round ? round.judgment : undefined;
    const myClue = (round && round.myClue) ? round.myClue : null;

    const amActive = this.state.myName === activePlayer;

    let roundsJsx = [];
    for (const [i, round] of this.state.rounds.entries()) {
      roundsJsx.push(<Round
        handleKick={this.handleKick}
        isCurrRound={i === 0}
        key={i}
        key_={i}
        myName={this.state.myName}
        phase={this.state.phase}
        playerOrder={this.state.playerOrder}
        players={this.state.players}
        round={round}
        spectating={this.state.spectating}
        toggleClue={this.toggleClue}
      />);
      if (i === 0) {
        roundsJsx.push(<Subaction
          correct={this.state.correct}
          handlePhase={this.handlePhase}
          key={-1}
          phase={this.state.phase}
          spectating={this.state.spectating}
          spectators={this.state.spectators}
          wrong={this.state.wrong}
        />);
      }
    }

    return (
      <div className="Room-Wrapper">
        <NavBar
          changeRoom={this.changeRoom}
          leaveRoom={this.leaveRoom}
          roomName={this.props.roomName}
          toggleRules={this.toggleRules}
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
          handleSoftPhase={this.handleSoftPhase}
          spectating={this.state.spectating}
          submitClue={this.submitClue}
          submitGuess={this.submitGuess}
          submitJudge={this.submitJudge}
        />
        {roundsJsx}
        <Rules shown={this.state.rules} toggleRules={this.toggleRules}/>
      </div>
    );
  }
}

function Round(props){
  return [
    props.phase !== "wait" && (
    <div
      className={"Round-Status" + (props.isCurrRound ? "" : " old")}
      key={props.key_ + "-status"}
    >
      round {props.round.roundId}: <b>{props.round.activePlayer}</b> · word: <b>{props.round.word ? props.round.word : "?"}</b>
      {
        props.round.guess ?
        <span> · guess: <b>{props.round.guess}</b></span> :
        ""
      }
      {
        (props.round.judgment !== undefined) ?
        (props.round.judgment ?
        <span className="correct"> (correct)</span> :
        <span className="wrong"> (wrong)</span>) :
        ""
    }
    </div>
    ),
    <Players
      activePlayer={props.round.activePlayer}
      amActive={props.isCurrRound ? (props.myName === props.round.activePlayer) : false}
      clues={props.round.clues}
      handleKick={props.handleKick}
      key={props.key_}
      phase={props.isCurrRound ? props.phase : "end"}
      playerOrder={props.round.playerOrder || props.playerOrder}
      players={props.isCurrRound ? (props.players) : false}
      spectating={props.isCurrRound ? props.spectating : true}
      toggleClue={props.toggleClue}
    />
  ];
};

export default Room;
