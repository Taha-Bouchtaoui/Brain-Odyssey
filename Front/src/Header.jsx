import React, { useState, useEffect, useRef } from 'react'
import { BsFillBellFill, BsFillEnvelopeFill, BsSearch, BsJustify, BsPersonCircle } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import axios, { BASE_URL } from './utils/axios.js'
import './Style/Layout.css';

function Header({ OpenSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/settings/")
      .then((res) => {
        setUsername(res.data.username || "");
        if (res.data.avatar) {
          setAvatar(res.data.avatar.startsWith("http")
            ? res.data.avatar
            : `${BASE_URL}${res.data.avatar}`
          );
        }
      })
      .catch((err) => console.error("Failed to load profile:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
};
  return (
    <header className='header'>
      <div className='menu-icon'>
        <BsJustify className='icon' onClick={OpenSidebar} />
      </div>
      <div className='header-left'>
        <BsSearch className='icon' />
      </div>
      <div className='header-right'>
        <BsFillBellFill className='icon' />
        <BsFillEnvelopeFill className='icon' />

        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <div className="profile-icon-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {avatar ? (
              <img src={avatar} alt="avatar" className="header-avatar" />
            ) : (
              <BsPersonCircle className='icon' />
            )}
            <span className="header-username">{username}</span>
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="dropdown-avatar" />
                ) : (
                  <BsPersonCircle size={40} />
                )}
                <span>{username}</span>
                <button className="dropdown-close" onClick={() => setDropdownOpen(false)}>✕</button>
              </div>
              <button className="dropdown-item" onClick={() => { navigate("/setting"); setDropdownOpen(false); }}>
                <span></span> Edit Profile
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                <span></span> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Header;