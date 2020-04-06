import React, { Component } from "react";

import "./Subaction.css";

class Subaction extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { phase, spectating, spectators } = this.props;
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
        {(<span className="Subaction-Spectators">{spect}</span>)}
        {showSkip && <button onClick={e => this.props.handlePhase("clue")}>next round</button>}
      </div>
    );
  }
}

export default Subaction;
