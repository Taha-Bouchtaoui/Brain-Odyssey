import React, { useEffect, useState } from "react";
import styles from "./Profiles.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/children/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`
      }
      
    })
    .then(response => setProfiles(response.data))
    .catch(error => console.error("Erreur chargement profils :", error));
  }, []);

  const selectProfile = (name) => {
    document.body.style.transition = "0.5s";
    document.body.style.opacity = "0";

    setTimeout(() => {
      alert("Bienvenue " + name + " ⚔️");
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className={styles.profilesPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Choisis ton Guerrier Mathématique
        </h1>

        <div className={styles.profiles}>
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={styles.profileCard}
              onClick={() => selectProfile(profile.name)}
            >
              <img
                src={`http://localhost:5173/assets/avatars/${profile.avatar}`}
                alt={profile.name}
              />
              <div className={styles.profileName}>{profile.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profiles;