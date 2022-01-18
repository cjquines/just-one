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
    };
  }

  handleChangeName = (e) => this.setState({ name: e.target.value });
  handleChangeRoom = (e) => this.setState({ room: e.target.value });
  toggleRules = () => this.setState({ rules: !this.state.rules });

  submit = (e) => {
    e.preventDefault();
    const { name, room } = this.state;
    navigate(`/room/${room}`, { state: { name: name } });
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
