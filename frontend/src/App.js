// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MainLayout from "./components/MainLayout"; // Import MainLayout
import Profile from "./components/Profile";
import "./index.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Use MainLayout for the calendar and dynamic table */}
        <Route path="/" element={<MainLayout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
