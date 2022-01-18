import React, { Component } from "react";
import { navigate } from "@reach/router";

import NavBar from "./NavBar.js";
import Rules from "./Rules.js";

import "./Splash.css";

class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      room: "",
      rules: false,
      wordlist: "beta",
    };
  }

  handleChangeName = (e) => this.setState({ name: e.target.value });
  handleChangeRoom = (e) => this.setState({ room: e.target.value });
  handleChangeWordList = (e) => this.setState({ wordlist: e.target.value });
  toggleRules = () => this.setState({ rules: !this.state.rules });

  submit = (e) => {
    e.preventDefault();
    const { name, room, wordlist } = this.state;
    navigate(`/room/${room}`, { state: { name: name, wordlist: wordlist } });
  };

  render() {
    return (
      <div className="Splash-Wrapper">
        <NavBar toggleRules={this.toggleRules} />
        <div className="Splash-Copy">
          <form onSubmit={this.submit}>
            <span>
              <label htmlFor="room">room:</label>
              <input
                id="room"
                onChange={this.handleChangeRoom}
                type="text"
                value={this.state.room}
              />
            </span>
            <span>
              <label htmlFor="name">name:</label>
              <input
                id="name"
                onChange={this.handleChangeName}
                type="text"
                value={this.state.name}
              />
            </span>
            <details>
              <summary>more options</summary>
              <span>
                <label htmlFor="wordlist">words:</label>
                <select
                  id="wordlist"
                  name="wordlist"
                  onChange={this.handleChangeWordList}
                  value={this.state.wordlist}
                >
                  <option value="beta">beta (1018 words)</option>
                  <option value="skribbl">skribbl (1848 words)</option>
                  <option value="upgoer">upgoer (1000 words)</option>
                  <option value="voa">voa learning english (1475 words)</option>
                </select>
              </span>
            </details>
            <button type="submit">go!</button>
          </form>
          <p>
            by <a href="https://cjquines.com/">cjquines</a> ·{" "}
            <a href="https://github.com/cjquines/just-one/">github</a>
          </p>
        </div>
        <Rules shown={this.state.rules} toggleRules={this.toggleRules} />
      </div>
    );
  }
}

export default Splash;
