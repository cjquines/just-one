import React, { Component } from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: "http://localhost:4001"
    };
  }

  componentDidMount() {
    const socket = socketIOClient(this.state.endpoint);
  }

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        test!
      </div>
    );
  }
}

export default App;
