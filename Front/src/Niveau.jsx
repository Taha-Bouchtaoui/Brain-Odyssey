import React, { useState, useEffect } from 'react';
import axios from './utils/axios.js';
import './Style/Niveau.css';

const MAX_PER_WORLD = 20;

const levels = [
  { name: "Monde des Princes" },
  { name: "Candy Land" },
  { name: "Jungle Mystique" },
  { name: "Château Enchanté" },
  { name: "Île Arc-en-ciel" },
  { name: "Galaxy Supreme" },
];

function Niveau() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [role, setRole] = useState("");
  const [worldProgress, setWorldProgress] = useState({});
  const [loading, setLoading] = useState(false);

const buildProgressMap = (progressArray) => {
  const map = {};
  progressArray.forEach(p => { map[p.world_index] = p.exercises_solved; });

  // if a world has progress, all previous worlds are considered completed
  const maxWorldWithProgress = progressArray.length > 0
    ? Math.max(...progressArray.map(p => p.world_index))
    : -1;

  for (let i = 0; i < maxWorldWithProgress; i++) {
    if (!map[i]) {
      map[i] = MAX_PER_WORLD; // mark as fully completed
    }
  }

  return map;
};

  useEffect(() => {
    axios.get("/api/settings/")
      .then((res) => {
        setRole(res.data.role);
        if (res.data.role === "parent") {
          axios.get("/api/children/")
            .then((r) => setChildren(r.data))
            .catch((err) => console.error("Failed to load children:", err));
        } else {
          axios.get("/api/progress/")
            .then((r) => setWorldProgress(buildProgressMap(r.data.progress)))
            .catch((err) => console.error("Failed to load progress:", err));
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  useEffect(() => {
    if (!selectedChild) {
      setWorldProgress({});
      return;
    }
    setLoading(true);
    axios.get(`/api/children/${selectedChild}/progress/`)
      .then((res) => {
        setWorldProgress(buildProgressMap(res.data.progress));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load child progress:", err);
        setLoading(false);
      });
  }, [selectedChild]);

  const getPercent = (index) => {
    const solved = worldProgress[index] || 0;
    return Math.min(100, Math.round((solved / MAX_PER_WORLD) * 100));
  };

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>NIVEAUX</h3>
      </div>

      {role === "parent" && (
        <div className='drop-list'>
          <label htmlFor="child-select">Choose your child: </label>
          <select
            id="child-select"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            <option value="">-------</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.username}
              </option>
            ))}
          </select>
        </div>
      )}

      {role === "parent" && !selectedChild ? (
        <p style={{ textAlign: "center", color: "#7c3aed", marginTop: "30px" }}>
          Please select a child to view their progress.
        </p>
      ) : loading ? (
        <p style={{ textAlign: "center", marginTop: "30px" }}>Loading...</p>
      ) : (
        <div className='levels-container'>
          {levels.map((level, index) => {
            const percent = getPercent(index);
            const isCompleted = percent === 100;
            const isActive = percent > 0 && percent < 100;
            const previousPercent = index === 0 ? 100 : getPercent(index - 1);
            const isLocked = previousPercent < 100;

            return (
              <div
                key={index}
                className={`level-card ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
              >
                <p>{level.name}</p>
                <div className='progress-box'>
                  <div
                    className='progress-fill'
                    style={{ width: `${isLocked ? 0 : percent}%` }}
                  ></div>
                </div>
                <span className="percent-label">
                  {isLocked ? "Locked" : `${percent}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Niveau;