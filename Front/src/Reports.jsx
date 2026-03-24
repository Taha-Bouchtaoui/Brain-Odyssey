import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { FaStar, FaFlagCheckered, FaSmile, FaMapMarkedAlt } from 'react-icons/fa';
import axios from './utils/axios.js';
import './Style/Reports.css';

const MAX_PER_WORLD = 20;

const levelNames = [
  "Monde des Princes",
  "Candy Land",
  "Jungle Mystique",
  "Château Enchanté",
  "Île Arc-en-ciel",
  "Galaxy Supreme",
];

const shortNames = [
  "Monde",
  "Candy Land",
  "Jungle",
  "Château",
  "Arc-en-ciel",
  "Galaxy",
];

function Reports() {
  const [role, setRole] = useState("");
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);

  const buildProgressMap = (progressArray) => {
    const map = {};
    progressArray.forEach(p => {
      map[p.world_index] = { exercises_solved: p.exercises_solved, mistakes: p.mistakes };
    });

    const maxWorldWithProgress = progressArray.length > 0
      ? Math.max(...progressArray.map(p => p.world_index))
      : -1;

    for (let i = 0; i < maxWorldWithProgress; i++) {
      if (!map[i]) {
        map[i] = { exercises_solved: MAX_PER_WORLD, mistakes: 0 };
      }
    }

    return Object.entries(map).map(([world_index, val]) => ({
      world_index: parseInt(world_index),
      exercises_solved: val.exercises_solved,
      mistakes: val.mistakes,
    }));
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
            .then((r) => setProgress(buildProgressMap(r.data.progress)))
            .catch((err) => console.error("Failed to load progress:", err));
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  useEffect(() => {
    if (!selectedChild) {
      setProgress([]);
      return;
    }
    setLoading(true);
    axios.get(`/api/children/${selectedChild}/progress/`)
      .then((res) => {
        setProgress(buildProgressMap(res.data.progress));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load child progress:", err);
        setLoading(false);
      });
  }, [selectedChild]);

  const totalSolved = progress.reduce((sum, p) => sum + p.exercises_solved, 0);
  const totalMistakes = progress.reduce((sum, p) => sum + p.mistakes, 0);
  const worldsCompleted = progress.filter(p => p.exercises_solved >= MAX_PER_WORLD).length;
  const totalWorlds = levelNames.length;
  const globalPercent = Math.round((totalSolved / (totalWorlds * MAX_PER_WORLD)) * 100);

  const chartData = shortNames.map((name, index) => {
    const entry = progress.find(p => p.world_index === index);
    return {
      name,
      Ex: entry ? entry.exercises_solved : 0,
      Erreur: entry ? entry.mistakes : 0,
    };
  });

  const cards = [
    {
      value: totalSolved,
      label: "Total Exercises Solved",
      icon: <FaFlagCheckered size={28} color="#ff9f1c" />
    },
    {
      value: `${worldsCompleted} / ${totalWorlds}`,
      label: "Worlds Completed",
      icon: <FaMapMarkedAlt size={28} color="#2ec4b6" />
    },
    {
      value: `${globalPercent}%`,
      label: "Global Progress",
      icon: <FaStar size={28} color="#ffd166" />
    },
    {
      value: totalMistakes,
      label: "Total Mistakes",
      icon: <FaSmile size={28} color="#ef476f" />
    },
  ];

  const showData = role === "child" || (role === "parent" && selectedChild);

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>Rapport des Quêtes</h3>
      </div>

      {role === "parent" && (
        <div className="drop-list">
          <label htmlFor="report-child-select">Choose your child: </label>
          <select
            id="report-child-select"
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
          Please select a child to view their report.
        </p>
      ) : loading ? (
        <p style={{ textAlign: "center", marginTop: "30px" }}>Loading...</p>
      ) : showData ? (
        <>
          <div className="reports-cards">
            {cards.map((card, i) => (
              <div key={i} className="report-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {card.icon}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '22px', color: '#333' }}>{card.value}</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{card.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="charts">
            <div className="chart-container">
              <h4>Exercises vs Mistakes per World</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Ex" fill="#66bb6a" radius={[10, 10, 0, 0]} name="Exercises Solved" />
                  <Bar dataKey="Erreur" fill="#ff8a65" radius={[10, 10, 0, 0]} name="Mistakes" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4>Progress Over Worlds</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Ex"
                    stroke="#66bb6a"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Exercises Solved"
                  />
                  <Line
                    type="monotone"
                    dataKey="Erreur"
                    stroke="#ff8a65"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Mistakes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}

export default Reports;