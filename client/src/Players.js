import React, { Component } from "react";

import "./Players.css";

class Players extends Component {
  renderName = (name) => {   
    const disconnected = this.props.players[name].status === "disconnected";

    let renderedName = name;
    let className = "Players-Name" + (disconnected ? " disconnected" : "");

    return (
      <span className={className}>
        {renderedName}
        {disconnected ? (<span className="disconnected-marker"> (disconnected)</span>) : ""}
      </span>
    );
  }

  renderClue = (name) => {
    const { amActive, phase } = this.props;
    const active = name === this.props.activePlayer;

    let clue = undefined;
    let visible = true;

    if (this.props.clues && name in this.props.clues) {
      clue = this.props.clues[name].clue;
      visible = this.props.clues[name].visible;
    }

    if (clue === " ") clue = "";
    let renderedClue = "";
    let className = "Players-Clue";

    if (phase === "clue") {
      renderedClue = clue ? "submitted" : "writing...";
    } else if (phase === "eliminate" && amActive) {
      renderedClue = clue ? "submitted" : "no clue";
    } else if (amActive) {
      renderedClue = visible ? (clue ? clue : "no clue") : "hidden";
    } else {
      renderedClue = clue ? clue : "no clue";
    }

    if (active) {
      className += " guessing";
      renderedClue = "guesser";
    }

    if (!visible) className += amActive ? " hidden" : " toggledOff";
    if (renderedClue === "no clue") className += " notSubmitted";

    return (<span className={className}>{renderedClue}</span>);
  }

  renderPlayer = (name) => {
    const { amActive, phase, spectating } = this.props;
    const name_ = (
      <td>
        {!spectating && (<button className="small gray" onClick={e => this.props.handleKick(name)}>kick</button>)}
        {this.renderName(name)}
      </td>
    );

    if (phase === "wait") {
      return (<tr key={name}>{name_}</tr>);
    }

    let toggleClass = "Players-Toggle small"
    if (this.props.clues && name in this.props.clues && !this.props.clues[name].visible)
      toggleClass += " Players-ToggledOffToggle";
    const toggle = (<button className={toggleClass} onClick={e => this.props.toggleClue(name)}>toggle</button>);

    let clue = (<td>{this.renderClue(name)}{toggle}</td>);
    if (spectating || phase === "clue" || amActive || !(this.props.clues && name in this.props.clues && this.props.clues[name].clue)) {
      clue = (<td>{this.renderClue(name)}</td>);
    }
    
    return (<tr key={name}>{name_}{clue}</tr>);
  }

  render() {
    const { phase, playerOrder } = this.props;

    if (phase === "disconnected") return (<div className="Players-Wrapper"></div>);
    if (!playerOrder) return (<div className="Players-Wrapper">Loading!</div>);

    return (
      <div className="Players-Wrapper">
        <table className="Players-Table">
          <tbody>{playerOrder.map(name => this.renderPlayer(name))}</tbody>
        </table>
      </div>
    );
  }
}

export default Players;
