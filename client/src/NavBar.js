import React, { Component } from "react";

import "./NavBar.css";

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <nav className="NavBar-Wrapper">
        <a href="/" className="NavBar-Home">just one!</a>
        <span className="NavBar-Room">{`room: ${this.props.roomName}`}
          <button className="small gray" onClick={e => this.props.changeRoom()}>change</button>
        </span>
      </nav>
    );
  }
}

export default NavBar;
