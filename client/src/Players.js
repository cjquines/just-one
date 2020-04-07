import React, { Component } from "react";

import "./Players.css";

class Players extends Component {
  renderName = (name) => {   
    let renderedName = name;
    let className = "Players-Name";

    if (this.props.players[name].status === "disconnected") {
      renderedName += " (disconnected)";
      className += " disconnected";
    }

    return (<span className={className}>{renderedName}</span>);
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
      renderedClue = "guessing";
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

    const clue = (<td>{this.renderClue(name)}</td>);
    const toggle = (<td><button className="small" onClick={e => this.props.toggleClue(name)}>toggle</button></td>);

    if (phase === "clue" || amActive) {
      return (<tr key={name}>{name_}{clue}<td></td></tr>);
    }
    return (<tr key={name}>{name_}{clue}{toggle}</tr>);
  }

  render() {
    const { amActive, phase, playerOrder } = this.props;

    if (phase === "disconnected") return (<div className="Players-Wrapper"></div>);
    if (!playerOrder) return (<div className="Players-Wrapper">Loading!</div>);

    let thead = [(<th key="name">name</th>)];
    if (phase !== "wait") thead.push(<th key="clue">clue</th>);
    if (phase !== "wait" && phase !== "clue" && !amActive) {
      thead.push(<th key="visible" style={{width: "4em"}}>visible?</th>);
    } else if (phase !== "wait") {
      thead.push(<th style={{width: "4em"}}></th>);
    }

    return (
      <div className="Players-Wrapper">
        <table className="Players-Table">
          <thead><tr>{thead}</tr></thead>
          <tbody>{playerOrder.map(name => this.renderPlayer(name))}</tbody>
        </table>
      </div>
    );
  }
}

export default Players;
