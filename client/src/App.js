import React, { Component } from "react";
import { Router } from "@reach/router";

import Room from "./Room.js";
import Splash from "./Splash.js";

import "./App.css";

class App extends Component {
  componentDidMount() {
    let scheme = localStorage.getItem("color-scheme");
    if (!scheme) {
      const defaultScheme =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      localStorage.setItem("color-scheme", defaultScheme);
      scheme = defaultScheme;
    }
    if (scheme === "dark") {
      document.querySelector("html").classList.add("dark");
    }
  }

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
