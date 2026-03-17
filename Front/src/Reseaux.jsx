import React from 'react';
import { FaUser, FaPlus } from 'react-icons/fa';
import './Style/Reseaux.css' // Icons pour user et plus

function Reseaux() {
  const users = [
    { id: 1, name: 'Otmane Chetouani' },
    { id: 2, name: 'Sofia Belkacem' },
    { id: 3, name: 'Ahmed Lahlou' },
  ];

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>RESEAUX</h3>
      </div>

      <div className="main-content">
        <p>Configuration des réseaux sociaux.</p>

        <div className="user-list">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <FaUser size={24} style={{ marginRight: '8px' }} />
                <span>{user.name}</span>
              </div>
              <button className="add-friend-btn">
                <FaPlus />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Reseaux;
