import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import './Style/Reports.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaStar, FaFlagCheckered, FaSmile, FaMapMarkedAlt } from 'react-icons/fa';
import axios from './utils/axios.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MAX_PER_WORLD = 20;

const levelNames = [
  "Monde des Princes",
  "Candy Land",
  "Jungle Mystique",
  "Château Enchanté",
  "Île Arc-en-ciel",
  "Galaxy Supreme",
];

function Reports() {
  const [role, setRole] = useState("");
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);

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
            .then((r) => setProgress(r.data.progress))
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
        setProgress(res.data.progress);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load child progress:", err);
        setLoading(false);
      });
  }, [selectedChild]);

  // ── computed stats ──
  const totalSolved = progress.reduce((sum, p) => sum + p.exercises_solved, 0);
  const worldsCompleted = progress.filter(p => p.exercises_solved >= MAX_PER_WORLD).length;
  const totalWorlds = levelNames.length;
  const globalPercent = Math.round((totalSolved / (totalWorlds * MAX_PER_WORLD)) * 100);

  // ── chart data — one bar per world ──
  const chartLabels = levelNames;
  const chartValues = levelNames.map((_, index) => {
    const entry = progress.find(p => p.world_index === index);
    return entry ? Math.min(entry.exercises_solved, MAX_PER_WORLD) : 0;
  });

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Exercises Solved',
        data: chartValues,
        backgroundColor: [
          '#ffadad', '#ffd6a5', '#fdffb6',
          '#caffbf', '#9bf6ff', '#bdb2ff'
        ],
        borderRadius: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Progress per World',
        font: { size: 18 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} / ${MAX_PER_WORLD} exercises`
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: MAX_PER_WORLD,
        ticks: { stepSize: 5 }
      }
    }
  };

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
      value: progress.length,
      label: "Worlds Started",
      icon: <FaSmile size={28} color="#ef476f" />
    },
  ];

  const showData = role === "child" || (role === "parent" && selectedChild);

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>Rapport des Quêtes</h3>
      </div>

      {/* Child selector for parents */}
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
          {/* Cards */}
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

          {/* Bar chart */}
          <div className="reports-chart">
            <Bar data={data} options={options} />
          </div>
        </>
      ) : null}
    </main>
  );
}

export default Reports;