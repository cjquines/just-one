import React, { Component } from "react";
import { Link } from "@reach/router";

import "./NavBar.css";

class NavBar extends Component {
  render() {
    return (
      <nav className="NavBar-Wrapper">
        <Link to="/" className="NavBar-Home" onClick={e => this.props.leaveRoom()}>just one!</Link>
        {this.props.roomName && (<span className="NavBar-Room">{`room: ${this.props.roomName}`}
          <button className="small gray" onClick={e => this.props.changeRoom()}>change</button>
        </span>
        )}
      </nav>
    );
  }
}

export default NavBar;
