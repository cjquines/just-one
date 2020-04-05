import React, { Component } from "react";

class Players extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

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
    const { clue, visible } = this.props.clues[name];
    const active = name === this.props.activePlayer;

    let renderedClue = "";
    let className = "Players-Clue";

    if (phase === "clue") {
      renderedClue = clue ? "submitted" : "writing...";
    } else if (phase === "eliminate" && amActive) {
      renderedClue = clue ? "submitted" : "no clue";
    } else if (amActive) {
      renderedClue = visible ? clue : "hidden";
    } else {
      renderedClue = clue ? clue : "no clue";
    }

    if (active) renderedClue = "guessing";
    if (!visible) className += " hidden";
    if (!clue) className += " notSubmitted";

    return (<span className={className}>{renderedClue}</span>);
  }

  renderPlayer = (name) => {
    const { amActive, phase } = this.props;
    const name_ = (
      <td>
        {this.renderName(name)}
        <button className="Players-Kick" onClick={e => this.props.handleKick(name)}>kick</button>
      </td>
    );

    if (phase === "wait") {
      return (<tr key={name}>{name_}</tr>);
    }

    const clue = (<td>{this.renderClue(name)}</td>);
    const toggle = (<td><button onClick={e => this.props.toggleClue(name)}>toggle</button></td>);

    if (phase === "clue" || amActive) {
      return (<tr key={name}>{name_}{clue}</tr>);
    }
    return (<tr key={name}>{name_}{clue}{toggle}</tr>);
  }

  render() {
    const { amActive, phase, playerOrder, spectators } = this.props;

    if (phase === "disconnected") return (<div className="Players-Wrapper"></div>);
    if (!playerOrder) return (<div className="Players-Wrapper">Loading!</div>);

    let thead = [(<th key="name">name</th>)];
    if (phase !== "wait") thead.push(<th key="clue">clue</th>);
    if (phase !== "wait" && phase !== "clue" && !amActive) {
      thead.push(<th key="visible">visible?</th>);
    }

    let spect = null;
    if (spectators === 1) spect = "1 spectator";
    else if (spectators > 1) spect = spectators + " spectators";

    return (
      <div className="Players-Wrapper">
        <table className="Players-Table">
          <thead><tr>{thead}</tr></thead>
          <tbody>{playerOrder.map(name => this.renderPlayer(name))}</tbody>
        </table>
        {spect && (<span className="Players-Spectators">{spect}</span>)}
      </div>
    );
  }
}

export default Players;
