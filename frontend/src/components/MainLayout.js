import React, { useState } from "react";
import Calendar from "./Calendar";
import NavBar from "./NavBar";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      <NavBar onToggleMenu={toggleMenu} />
      <div className="flex flex-grow overflow-hidden">
        <Calendar isMenuOpen={isMenuOpen} />
      </div>
    </div>
  );
};

export default MainLayout;
