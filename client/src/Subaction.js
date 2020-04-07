import React, { Component } from "react";

import "./Subaction.css";

class Subaction extends Component {
  render() {
    const { correct, phase, spectating, spectators, wrong } = this.props;
    const showSkip = !spectating && (phase !== "wait");

    if (phase === "disconnected") {
      return (<div className="Action-Wrapper"></div>);
    }

    let spect = null;
    if (spectators) spect = spectators.length;
    if (spect === 0) spect = null;
    else if (spect === 1) spect += " spectator";
    else if (spect > 1) spect += " spectators";

    return (
      <div className="Subaction-Wrapper">
        {(phase !== "wait") && (
          <span className="Subaction-Score">
            <span className="correct">{correct} correct</span> · <span className="wrong">{wrong} wrong</span>
          </span>
        )}
        <span className="Subaction-Spectators">{spect}</span>
        {showSkip && <button onClick={e => this.props.handlePhase("clue")}>next round</button>}
      </div>
    );
  }
}

export default Subaction;
