import React from "react";
import logo from "../images/house-location-white.svg";

class Header extends React.Component {
  render = () => {
    return (
      <header className="Header--container main-wrapper">
        <div className="Header--headline spaces-xs">
          <img className="Header--headline-logo" src={logo} alt="logo" />
          <h1 className="Header--headline-title">My AirBnb Api</h1>
        </div>
        <nav className="Header--nav spaces-xs">
          <a className="Header--nav--link" href="#get">
            Request get
          </a>
          <a className="Header--nav--link" href="#post">
            Request post
          </a>
        </nav>
      </header>
    );
  };
}

export default Header;
