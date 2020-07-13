import React, { Component } from "react";

import "./Action.css";

class Action extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
    };
  }

  handleChange = e => this.setState({value: e.target.value});

  submit = (e) => {
    e.preventDefault();
    const { phase } = this.props;
    const { value } = this.state;
    if (phase === "clue") this.props.submitClue(value || " ");
    else if (phase === "guess") this.props.submitGuess(value);
    this.setState({value: ""});
  }

  render() {
    const { activePlayer, amActive, guess, judgment, myClue, phase, spectating, word } = this.props;

    let message = "";
    let showInput = false;
    let buttons = [];

    if (phase === "disconnected") {
      return (<div className="Action-Wrapper"></div>);
    } else if (phase === "clue") {
      if (amActive || spectating) {
        message = "waiting for clues...";
      } else if (myClue) {
        message = <span>you wrote <b>{myClue}</b>. waiting for others...</span>;
      } else {
        message = "write a one-word clue!";
        showInput = true;
      }
    } else if (phase === "eliminate") {
      if (amActive || spectating) {
        message = "the group is comparing clues...";
      } else {
        message = "hide clues that are the same or invalid!";
        buttons.push(<button key="next" onClick={e => this.props.handlePhase("guess")}>show clues</button>);
      }
    } else if (phase === "guess") {
      if (amActive) {
        message = "guess the word!";
        showInput = true;
      } else {
        message = `${activePlayer} is guessing...`;
      }
    } else if (phase === "judge") {
      if (amActive) {
        message = <span>you wrote <b>{guess}</b>. waiting for judgment...</span>;
      } else if (spectating) {
        message = <span>{activePlayer} guessed <b>{guess}</b>.</span>;
      } else {
        message = <span>{activePlayer} guessed <b>{guess}</b>. is it right?</span>;
        buttons.push(<button key="right" onClick={e => this.props.submitJudge(true)}>yep</button>);
        buttons.push(<button key="wrong" onClick={e => this.props.submitJudge(false)}>nope</button>);
      }
    } else if (phase === "end") {
      if (amActive && !word) {
        message = <span>your guess, <b>{guess}</b>, was { judgment ? `right!` : ` wrong :(` }</span>;
        if (!judgment) buttons.push(<button key="guessAgain" onClick={e => this.props.handlePhase("guess")}>guess again</button>);
      } else if (spectating) {
        message = <span>{activePlayer}’s guess, <b>{guess}</b>, was { judgment ? `right!` : ` wrong :(` }</span>;
      } else {
        message = <span>{activePlayer}’s guess, <b>{guess}</b>, was { judgment ? `right!` : ` wrong :(` }</span>;
      }
    }
    
    if (!spectating && phase === "wait") {
      buttons.push(<button key="skip" onClick={e => this.props.handleSoftPhase("clue")}>start game</button>);
    } else if (!spectating && phase === "end") {
      buttons.push(<button key="skip" onClick={e => this.props.handleSoftPhase("clue")}>next round</button>);
    }

    return (
      <div className="Action-Wrapper">
        <div className="Action-Message">{message}</div>
        {showInput && (
          <div className="Action-Input">
            <form onSubmit={this.submit}>
              <input
                onChange={this.handleChange}
                type="text"
                value={this.state.value}
              />
              <button type="submit">send</button>
            </form>
          </div>
        )}
        {buttons.length > 0 && (<div className="Action-Buttons">{buttons}</div>)}
      </div>
    );
  }
}

export default Action;
