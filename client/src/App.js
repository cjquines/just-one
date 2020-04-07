import React, { Component } from "react";
import { Router } from "@reach/router";

import Room from "./Room.js";
import Splash from "./Splash.js";

import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App-Wrapper">
        <Router>
          <Splash path="/" default />
          <Room path="/room/:roomName" />
        </Router>
      </div>
    );
  }
}

export default App;
