import React, { Component } from "react";

import "./Rules.css";

class Rules extends Component {
  render() {
    return ( this.props.shown &&
      <div className="Rules-Wrapper">
        <div className="Rules-Lead">
          <p>just one is a <b>cooperative game</b>.</p>
          <p>everyone writes <b>one-word clues</b> to help a guesser guess their mystery word.</p>
          <p>the catch: you can’t show the guesser clues that two or more people write.</p>
        </div>
        <div className="Rules-Steps">
        <p style={{color:"#666"}}>in each round:</p>
          <ol>
            <li>
              <p className="Rules-Step-Lead">without communicating, everyone writes a one-word clue.</p>
              <p className="Rules-Step-Explanation">
                <span className="correct">valid:</span> proper nouns, numbers, acronyms, onomatopoeia.
              </p>
              <p className="Rules-Step-Explanation">
                <span className="wrong">invalid:</span> translations or homophones of the word, invented words.
              </p>
            </li>
            <li>
              <p className="Rules-Step-Lead">everyone compares clues, hiding clues that are identical.</p>
              <p className="Rules-Step-Explanation">
                tap<button className="small gray">hide</button>beside a clue to hide it.
              </p>
              <p className="Rules-Step-Explanation">
                after everyone’s decided what to hide, tap<button className="small gray">show clues</button>.
              </p>
            </li>
            <li>
              <p className="Rules-Step-Lead">the guesser guesses the word.</p>
              <p className="Rules-Step-Explanation">
                tap<button className="small gray">show</button>to show a clue, even during or after guessing.
              </p>
              <p className="Rules-Step-Explanation">
                after guessing, the guesser can choose to<button className="small gray">guess again</button>.
              </p>
              <p className="Rules-Step-Explanation">
                anyone can start the<button className="small gray">next round</button>.
              </p>
            </li>
            <li>
              <p className="Rules-Step-Lead">keep playing for as long as you want!</p>
            </li>
          </ol>
        </div>
        <p>if you disconnect, joining with the exact same name puts you back.</p>
        <p>if someone leaves for real,<button className="small gray">kick</button>them.</p>
        <p>join a room without a name to spectate.</p>
        <div className="Rules-Close"><button onClick={e => this.props.toggleRules()}>close rules</button></div>
        <div className="Rules-Close-Top"><button onClick={e => this.props.toggleRules()}>×</button></div>
      </div>
    );
  }
}

export default Rules;
