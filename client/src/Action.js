import React, { Component } from "react";

class Action extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  handleChange = (e) => {
    this.setState({value: e.target.value});
  }

  render() {
    return (
      <div className="Action-Wrapper">
        <input type="text" onChange={this.handleChange}/>
        <button onClick={this.submitClue}>submit clue</button>
        <button onClick={this.submitGuess}>submit guess</button>
        <button onClick={e => this.submitJudge(false)}>judge incorrect</button>
        <button onClick={e => this.submitJudge(true)}>judge correct</button>

        <button onClick={e => this.handlePhase("clue")}>start clue</button>
        <button onClick={e => this.handlePhase("eliminate")}>start eliminate</button>
        <button onClick={e => this.handlePhase("guess")}>start guess</button>
        <button onClick={e => this.handlePhase("judge")}>start judge</button>
        <button onClick={e => this.handlePhase("end")}>start end</button>
        <button onClick={this.submitReveal}>reveal all</button>
      </div>
    );
  }
}

export default Action;
