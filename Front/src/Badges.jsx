import React from "react";

import bronze from "./assets/photo/bronze.png";
import silver from "./assets/photo/silver.png";
import gold from "./assets/photo/gold.png";
import plat from "./assets/photo/plat.png";
import mythic from "./assets/photo/mythic.png";
import legend from "./assets/photo/legend.png";
import "./Style/Badges.css";


function Badges() {

  const exercisesSolved = 32;

  const badges = [
    { name: "Bronze", required: 10, image: bronze },
    { name: "Silver", required: 20, image: silver },
    { name: "Gold", required: 30, image: gold },
    { name: "Platinum", required: 50, image: plat },
    { name: "Mythic", required: 75, image: mythic },
    { name: "Legend", required: 100, image: legend }
  ];

  const owned = badges.filter(b => exercisesSolved >= b.required);
  const locked = badges.filter(b => exercisesSolved < b.required);

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>BADGES</h3>
      </div>

      <h4>Owned Badges</h4>
      <div className="badges-container">
        {owned.map((badge, index) => (
          <div key={index} className="badge-card">
            <img src={badge.image} alt={badge.name} className="badge-img" />
            <p>{badge.name}</p>
            <span>{badge.required} Exercises</span>
          </div>
        ))}
      </div>

      <h4 style={{ marginTop: "40px" }}>Locked Badges</h4>
      <div className="badges-container">
        {locked.map((badge, index) => (
          <div key={index} className="badge-card locked">
            <img src={badge.image} alt={badge.name} className="badge-img" />
            <p>{badge.name}</p>
            <span>Unlock at {badge.required} Exercises</span>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Badges;
