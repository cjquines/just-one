import React, { Component } from "react";
import { navigate } from "@reach/router";

import NavBar from "./NavBar.js";
import Rules from "./Rules.js";

import "./Splash.css";

class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "one",
      name: "",
      room: "",
      rules: false,
      wordlist: "beta",
    };
  }

  handleChangeMode = (e) => this.setState({ mode: e.target.value });
  handleChangeName = (e) => this.setState({ name: e.target.value });
  handleChangeRoom = (e) => this.setState({ room: e.target.value });
  handleChangeWordList = (e) => this.setState({ wordlist: e.target.value });
  toggleRules = () => this.setState({ rules: !this.state.rules });

  submit = (e) => {
    e.preventDefault();
    const { mode, name, room, wordlist } = this.state;
    navigate(`/room/${room}`, {
      state: { mode: mode, name: name, wordlist: wordlist },
    });
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
                  <option value="codenames">codenames (208 words)</option>
                  <option value="skribbl">skribbl (1848 words)</option>
                  <option value="shibboleth">shibboleth (2000 words)</option>
                  <option value="upgoer">upgoer (1000 words)</option>
                  <option value="voa">voa (1475 words)</option>
                </select>
              </span>
              <span>
                <label htmlFor="mode">mode:</label>
                <select
                  id="mode"
                  name="mode"
                  onChange={this.handleChangeMode}
                  value={this.state.mode}
                >
                  <option value="one">just one (keep unique clues)</option>
                  <option value="two">just two (keep exactly duplicated clues)</option>
                  <option value="schelling">schelling point (keep most common clue)</option>
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
