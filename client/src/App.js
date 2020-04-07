import React, { Component } from "react";
import { Router } from "@reach/router";

import NotFound from "./NotFound.js";
import Room from "./Room.js";
import Splash from "./Splash.js";

import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <div className="App-Wrapper">
        <Router>
          <Splash path="/"/>
          <Room path="/room/:roomName" />
          <NotFound default />
        </Router>
      </div>
    );
  }
}

export default App;
