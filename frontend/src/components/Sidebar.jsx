// SideBar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import katLogo from "../assets/kat-logo-0.png";

function SideBar() {
  return (
    <div className='sidebar'>
      <div className='sidetext'>
        <Link to='/'>Home</Link>
      </div>
      <hr className='sideline'></hr>
      <div className='sidetext'>
        <Link to='/watchlist'>Watchlist</Link>
      </div>
      <hr className='sideline'></hr>
      <div className='sidetext'>
        <Link to='/for-you'>For You</Link>
      </div>
      <hr className='sideline'></hr>
      <img src={katLogo} alt='Kat-logo' className='sidebar-image' />
    </div>
  );
}

export default SideBar;
