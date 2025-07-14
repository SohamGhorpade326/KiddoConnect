// src/components/Navbar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { auth } from '../firebase';
import './NavBar.css';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">🚀 KIddoConnect</div>
      <div className="navbar-links">
        <NavLink to="/feed" className={({ isActive }) => isActive ? 'active' : ''}>Feed</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
        <NavLink to="/requests" className={({ isActive }) => isActive ? 'active' : ''}>Friend Requests</NavLink>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;

