import React from "react";
import { Link } from "react-router-dom";

const NavBar = ({ onToggleMenu }) => {
  return (
    <nav className="bg-slate-500 p-4 h-16">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onToggleMenu} className="text-white text-2xl">
          ☰ {/* Hamburger icon */}
        </button>
        <div className="text-white font-bold text-xl">Task Manager</div>
        <div>
          <Link to="/" className="text-white px-4 hover:underline">
            Home
          </Link>
          <Link to="/login" className="text-white px-4 hover:underline">
            Login
          </Link>
          <Link to="/register" className="text-white px-4 hover:underline">
            Register
          </Link>
          <Link to="/profile" className="text-white px-4 hover:underline">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
