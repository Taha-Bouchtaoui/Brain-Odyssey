import React, { useState, useEffect } from 'react';
import axios from './utils/axios';
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsFillBellFill,
  BsFillBarChartFill
} from 'react-icons/bs';

const MAX_PER_WORLD = 20;

const AVATAR_SMALL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e9d5ff'/%3E%3Ccircle cx='30' cy='23' r='11' fill='%237c3aed'/%3E%3Cellipse cx='30' cy='51' rx='17' ry='12' fill='%237c3aed'/%3E%3C/svg%3E";

function Home() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [totalSolved, setTotalSolved] = useState(0);
  const [worldsCompleted, setWorldsCompleted] = useState(0);
  const [currentWorld, setCurrentWorld] = useState(0);
  const [childrenStats, setChildrenStats] = useState([]);

  useEffect(() => {
    axios.get("/api/settings/")
      .then((res) => {
        setUsername(res.data.username);
        setRole(res.data.role);

        if (res.data.role === "child") {
          axios.get("/api/progress/")
            .then((r) => {
              const progress = r.data.progress;
              const solved = progress.reduce((sum, p) => sum + p.exercises_solved, 0);
              const completed = progress.filter(p => p.exercises_solved >= MAX_PER_WORLD).length;
              const current = progress.length > 0
                ? Math.max(...progress.map(p => p.world_index)) + 1
                : 0;
              setTotalSolved(solved);
              setWorldsCompleted(completed);
              setCurrentWorld(current);
            })
            .catch((err) => console.error("Failed to load progress:", err));
        }

        if (res.data.role === "parent") {
          axios.get("/api/children/")
            .then((r) => {
              const children = r.data;
              // fetch progress for each child
              const promises = children.map(child =>
                axios.get(`/api/children/${child.id}/progress/`)
                  .then(pr => {
                    const progress = pr.data.progress;
                    const solved = progress.reduce((sum, p) => sum + p.exercises_solved, 0);
                    const completed = progress.filter(p => p.exercises_solved >= MAX_PER_WORLD).length;
                    const current = progress.length > 0
                      ? Math.max(...progress.map(p => p.world_index)) + 1
                      : 0;
                    const mistakes = progress.reduce((sum, p) => sum + p.mistakes, 0);
                    return {
                      id: child.id,
                      username: child.username,
                      avatar: child.avatar,
                      totalSolved: solved,
                      worldsCompleted: completed,
                      currentWorld: current,
                      totalMistakes: mistakes,
                    };
                  })
                  .catch(() => ({
                    id: child.id,
                    username: child.username,
                    avatar: child.avatar,
                    totalSolved: 0,
                    worldsCompleted: 0,
                    currentWorld: 0,
                    totalMistakes: 0,
                  }))
              );
              Promise.all(promises).then(stats => setChildrenStats(stats));
            })
            .catch((err) => console.error("Failed to load children:", err));
        }
      })
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>My Adventure Dashboard</h3>
      </div>

      <div className="welcome-box">
        <h2>
          Hey {username ? username.charAt(0).toUpperCase() + username.slice(1) : "Champion"}!
        </h2>
        <p>{role === "parent" ? "Here's how your children are doing!" : "Keep learning and unlocking new worlds!"}</p>
      </div>

      {/* Child view */}
      {role === "child" && (
        <>
          <div className="motivation-box">
            ⭐ You solved {totalSolved} exercises so far! Keep going! ⭐
          </div>

          <div className='main-cards'>
            <div className='card'>
              <div className='card-inner'>
                <h3>Exercises Solved</h3>
                <BsFillArchiveFill className='card_icon' />
              </div>
              <h1>{totalSolved}</h1>
            </div>

            <div className='card'>
              <div className='card-inner'>
                <h3>Current World</h3>
                <BsFillGrid3X3GapFill className='card_icon' />
              </div>
              <h1>{currentWorld}</h1>
            </div>

            <div className='card'>
              <div className='card-inner'>
                <h3>Worlds Completed</h3>
                <BsFillBarChartFill className='card_icon' />
              </div>
              <h1>{worldsCompleted}</h1>
            </div>

            <div className='card'>
              <div className='card-inner'>
                <h3>Messages</h3>
                <BsFillBellFill className='card_icon' />
              </div>
              <h1>2</h1>
            </div>
          </div>
        </>
      )}

      {/* Parent view — one card per child */}
      {role === "parent" && (
        <div className="children-stats-grid">
          {childrenStats.length === 0 ? (
            <p style={{ textAlign: "center", color: "#7c3aed", marginTop: "30px" }}>
              No children linked to your account yet.
            </p>
          ) : (
            childrenStats.map((child) => (
              <div key={child.id} className="child-stat-card">
                <div className="child-stat-header">
                  <img
                    src={child.avatar || AVATAR_SMALL}
                    alt={child.username}
                    className="child-stat-avatar"
                    onError={(e) => { e.target.onerror = null; e.target.src = AVATAR_SMALL; }}
                  />
                  <h3>{child.username}</h3>
                </div>
                <div className="child-stat-body">
                  <div className="child-stat-item">
                    <BsFillArchiveFill color="#ff9f1c" size={20} />
                    <span><strong>{child.totalSolved}</strong> Exercises Solved</span>
                  </div>
                  <div className="child-stat-item">
                    <BsFillGrid3X3GapFill color="#2ec4b6" size={20} />
                    <span><strong>{child.currentWorld}</strong> Current World</span>
                  </div>
                  <div className="child-stat-item">
                    <BsFillBarChartFill color="#7c3aed" size={20} />
                    <span><strong>{child.worldsCompleted}</strong> Worlds Completed</span>
                  </div>
                  <div className="child-stat-item">
                    <BsFillBellFill color="#ef476f" size={20} />
                    <span><strong>{child.totalMistakes}</strong> Total Mistakes</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

export default Home;