import React from 'react';
import checkIcon from './assets/check.svg';
import "./Style/Quests.css";

function Quests() {
  const quests = [
    { name: "Trouver la clé du château", completed: true },
    { name: "Collecter 10 bonbons", completed: false },
    { name: "Explorer la forêt mystique", completed: true },
    { name: "Atteindre la tour arc-en-ciel", completed: false },
  ];

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>Quêtes</h3>
      </div>

      <div className="quests-container">
        {quests.map((quest, index) => (
          <div key={index} className="quest-card">
            <div className={`progress-rectangle ${quest.completed ? 'completed' : ''}`}>
              <span className="quest-name">{quest.name}</span>

              {quest.completed && (
                <img
                  src={checkIcon}
                  alt="completed"
                  className="check-icon"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Quests;
