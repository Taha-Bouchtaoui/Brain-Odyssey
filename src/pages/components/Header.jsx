import React, { useState, useEffect, useRef } from 'react';
import { BsFillBellFill, BsFillEnvelopeFill, BsSearch, BsJustify, BsPersonCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import '../styles/Header.css';

function Header({ OpenSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Charger les info f back
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (localStorage.getItem('access_token')) {
          const data = await authService.getUserStats();
          setUsername(data.username || "");
        } else {
          setUsername("Player");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setUsername("Player");
      }
    };
    fetchUser();
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

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };


  const goToDashboard = () => {
    navigate("/dashboard"); // Page de othmane 
  };

  const goToProfile = () => {
    navigate("/profile"); // Page de profil de tothamne
  };

  const goToSettings = () => {
    navigate("/settings"); // Page settings de  othmane
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
        {/* Liens directs vers les pages de othmane */}
        
        
        <BsFillBellFill className='icon' />
        <BsFillEnvelopeFill className='icon' />

        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <div className="profile-icon-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <BsPersonCircle className='icon' />
            <span className="header-username">{username || "User"}</span>
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <BsPersonCircle size={40} />
                <span>{username || "User"}</span>
                <button className="dropdown-close" onClick={() => setDropdownOpen(false)}>✕</button>
              </div>
              
              {/* Liens vers les pages de othmane */}
              <button className="dropdown-item" onClick={() => { goToDashboard(); setDropdownOpen(false); }}>
                📊 Dashboard
              </button>
              <button className="dropdown-item" onClick={() => { goToProfile(); setDropdownOpen(false); }}>
                👤 Profile
              </button>
              <button className="dropdown-item" onClick={() => { goToSettings(); setDropdownOpen(false); }}>
                ⚙️ Settings
              </button>
              
              <hr className="dropdown-divider" />
              
              <button className="dropdown-item logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;