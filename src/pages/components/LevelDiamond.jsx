// src/pages/components/LevelDiamond.jsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LevelDiamond.css';

const LevelDiamond = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { worldName, worldImage } = location.state || { 
    worldName: "World", 
    worldImage: null 
  };

  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="level-diamond-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Retour aux mondes
      </button>
      
      <div 
        className="world-header"
        style={{
          borderColor: `var(--global-world-color)`,
          boxShadow: `0 0 30px var(--global-world-color)`
        }}
      >
        {worldImage && (
          <img src={worldImage} alt={worldName} className="world-thumbnail" />
        )}
        <h1 className="world-title">{worldName}</h1>
      </div>
      
      <h2 className="levels-title">Choisis ton niveau !</h2>
      
      <div className="levels-grid">
        {levels.map((level) => (
          <div
            key={level}
            className={`level-diamond ${level === 1 ? 'available' : 'locked'}`}
          >
            <div 
              className="diamond-shape"
              style={level === 1 ? {
                background: `linear-gradient(135deg, var(--global-world-color), var(--global-world-secondary))`,
                boxShadow: `0 0 40px var(--global-world-color)`
              } : {}}
            >
              <span className="level-number">{level}</span>
              {level === 1 ? (
                <span className="play-icon">▶</span>
              ) : (
                <span className="lock-icon">🔒</span>
              )}
            </div>
            <p className="level-name">Niveau {level}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelDiamond;