import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { worldService } from "../../services/api";
import "../styles/worldmap.css";
import Header from "../components/Header";

// hadi imporrt dyal images
import cosmicCube from '../../assets/images/imag1.png';
import musicWorld from '../../assets/images/imag2.png';
import mermaidLagoon from '../../assets/images/imag4.png';
import sparkleKingdom from '../../assets/images/imag6.png';
import roboBot from '../../assets/images/imag7.png';
import dinoDiscovery from '../../assets/images/dino.png';
import spaceExplorers from '../../assets/images/space exploer.png';
import superheroCity from '../../assets/images/imag1.png';

const worldImages = {
  "Cosmic Cube": cosmicCube,
  "Sparkle Kingdom": sparkleKingdom,
  "Dino Discovery": dinoDiscovery,
  "Superhero City": superheroCity,
  "Robo-Bot Rally": roboBot,
  "Mermaid Lagoon": mermaidLagoon,
  "Music World": musicWorld,
  "Space Explorers": spaceExplorers,
};

const WorldMap = () => {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorlds();
  }, []);

  const fetchWorlds = async () => {
    try {
      const data = await worldService.getWorlds();
      
      const worldsWithImages = data.map(world => ({
        ...world,
        image: worldImages[world.name] || cosmicCube,
        secondaryColor: world.secondary_color,
        starColor: world.star_color,
        requiredLevel: world.required_level,
      }));
      
      setWorlds(worldsWithImages);
      
      const savedWorld = localStorage.getItem('selectedWorld');
      if (savedWorld) {
        const parsedWorld = JSON.parse(savedWorld);
        const currentWorld = worldsWithImages.find(w => w.id === parsedWorld.id);
        if (currentWorld && currentWorld.status === 'unlocked') {
          setSelectedWorld(currentWorld);
          updateGlobalColors(currentWorld);
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalColors = (world) => {
    document.documentElement.style.setProperty('--global-world-color', world.color);
    document.documentElement.style.setProperty('--global-world-secondary', world.secondaryColor || world.secondary_color);
    document.documentElement.style.setProperty('--global-world-gradient', world.backgroundGradient || world.background_gradient);
    document.documentElement.style.setProperty('--global-star-color', world.starColor || world.star_color);
    
    localStorage.setItem('selectedWorld', JSON.stringify(world));
  };

  const handleWorldClick = async (world) => {
    if (world.status === 'locked') {
      alert(`🔒 Le monde ${world.name} est verrouillé !`);
      return;
    }
    
    try {
      await worldService.selectWorld(world.id);
      setSelectedWorld(world);
      updateGlobalColors(world);
      
      setTimeout(() => {
        navigate(`/levels/${world.id}`);
      }, 300);
    } catch (err) {
      alert("Erreur lors de la sélection du monde");
    }
  };

  if (loading) return <div className="loading">Chargement des mondes...</div>;

  return (
    <div className="world-map-container">
      <Header OpenSidebar={() => {}} />
      
      <div className="stars-background">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: selectedWorld?.starColor || '#ffffff',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="cloud" style={{ top: '10%', left: '5%' }}>☁️</div>
      <div className="cloud" style={{ top: '70%', right: '10%' }}>☁️</div>

      <div className="map-header">
        <div className="brain-icon">🧠</div>
        <h1 className="map-title">BRAIN-ODYSSEY</h1>
        <h2 className="map-subtitle">World Selection</h2>
      </div>

      {selectedWorld && (
        <div 
          className="selected-world-indicator"
          style={{
            borderColor: selectedWorld.color,
            boxShadow: `0 0 30px ${selectedWorld.color}`
          }}
        >
          <span className="indicator-icon">✨</span>
          Current World: {selectedWorld.name}
          <span className="indicator-icon">✨</span>
        </div>
      )}

      <div className="worlds-grid">
        {worlds.map((world) => (
          <div
            key={world.id}
            className={`world-card ${world.status} ${selectedWorld?.id === world.id ? 'selected' : ''}`}
            onClick={() => handleWorldClick(world)}
          >
            <div className="world-image-container">
              <img src={world.image} alt={world.name} className="world-image" />
              <div 
                className={`status-badge ${world.status}`}
                style={world.status === 'unlocked' ? {
                  background: `linear-gradient(135deg, ${world.color}, ${world.secondaryColor || world.secondary_color})`
                } : {}}
              >
                {world.status === 'locked' ? '🔒' : '⭐'}
              </div>
            </div>
            
            <h3 className="world-name">{world.name}</h3>
            <p className="world-description">{world.description}</p>
            
            {world.status === 'unlocked' ? (
              <div className="gems-container" style={{ borderColor: world.color }}>
                {[...Array(3)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`gem ${i < (world.gems || 0) ? 'active' : ''}`}
                    style={i < (world.gems || 0) ? { color: world.color } : {}}
                  >💎</span>
                ))}
              </div>
            ) : (
              <div className="required-level">
                <span className="lock-icon-small">🔒</span>
                <span className="level-text">Niveau {world.requiredLevel || world.required_level}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedWorld && selectedWorld.status === 'unlocked' && (
        <div 
          className="selection-message"
          style={{
            background: `linear-gradient(135deg, ${selectedWorld.color}, ${selectedWorld.secondaryColor || selectedWorld.secondary_color})`
          }}
        >
          <span className="message-icon">🚀</span>
          {selectedWorld.name} selected!
          <span className="message-icon">✨</span>
        </div>
      )}
    </div>
  );
};

export default WorldMap;