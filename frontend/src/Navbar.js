import React from "react";
import "./CapchekUI.css";
import logo from './Logo.svg'
import Home from "./Home";
export default function Navbar() {
  return (
    <div className="container">
      <nav className="navbar">
        <div className='logo'>
            <img src={logo} alt="capchek"></img>
        </div>
        <div className="nav-links">
          <a href="#">Product</a>
          <a href="#">About Us</a>
          <a href="#">Features</a>
          <a href="#">Blog</a>
          <a href="#">Pricing</a>
        </div>
        <div className="nav-buttons">
          <button className="login">Login</button>
          <button className="get-started">Get Started</button>
        </div>
      </nav>
    </div>
  );
}
