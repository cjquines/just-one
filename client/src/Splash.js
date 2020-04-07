import React, { Component } from "react";
import { navigate } from "@reach/router";

import NavBar from "./NavBar.js";

import "./Splash.css";

class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      room: "",
    };
  }

  handleChangeName = e => this.setState({name: e.target.value});
  handleChangeRoom = e => this.setState({room: e.target.value});

  submit = (e) => {
    e.preventDefault();
    const { name, room } = this.state;
    navigate(`/room/${room}`, { state: { name: name } });
  }

  render() {
    return (
      <div className="Splash-Wrapper">
        <NavBar />
        <form onSubmit={this.submit}>
          <input
            onChange={this.handleChangeRoom}
            type="text"
            value={this.state.room}
          />
          <input
            onChange={this.handleChangeName}
            type="text"
            value={this.state.name}
          />
          <button type="submit">send</button>
        </form>
      </div>
    );
  }
}

export default Splash;
