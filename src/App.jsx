
/*import React from 'react';
import WorldMap from './pages/worldMap/WorldMap';
import './App.css';

function App() {
  return (
    <div className="App">
      <WorldMap />
    </div>
  );
}

export default App;*/
// src/App.jsx
/*
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorldMap from './pages/worldMap/WorldMap';
import LevelDiamond from './pages/components/LevelDiamond.jsx'; // Importez votre composant LevelDiamond
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WorldMap />} />
          <Route path="/levels/:worldId" element={<LevelDiamond />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;*/

// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorldMap from './pages/worldMap/WorldMap';
import LevelDiamond from './pages/components/LevelDiamond.jsx';
import './pages/styles/global.css'; 
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Les étoiles globales */}
        <div className="global-stars">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="global-star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 4 + 2}s`,
              }}
            />
          ))}
        </div>
        
        <Routes>
          <Route path="/" element={<WorldMap />} />
          <Route path="/levels/:worldId" element={<LevelDiamond />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;