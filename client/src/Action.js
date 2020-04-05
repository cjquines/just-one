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
        <button onClick={e => this.props.submitClue(this.state.value)}>submit clue</button>
        <button onClick={e => this.props.submitGuess(this.state.value)}>submit guess</button>
        <button onClick={e => this.props.submitJudge(false)}>judge incorrect</button>
        <button onClick={e => this.props.submitJudge(true)}>judge correct</button>
        <button onClick={e => this.props.handlePhase("clue")}>start clue</button>
        <button onClick={e => this.props.handlePhase("eliminate")}>start eliminate</button>
        <button onClick={e => this.props.handlePhase("guess")}>start guess</button>
        <button onClick={e => this.props.handlePhase("judge")}>start judge</button>
        <button onClick={e => this.props.handlePhase("end")}>start end</button>
        <button onClick={e => this.props.submitReveal()}>reveal all</button>
      </div>
    );
  }
}

export default Action;
