import React, { useEffect, useState } from "react";
import styles from "./Profiles.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔥 Chargement dynamique des avatars
const avatarImages = import.meta.glob("../assets/avatars/*.png", { eager: true });
const getAvatarSrc = (avatarName) => avatarImages[`../assets/avatars/${avatarName}`]?.default;

function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/children/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then((response) => {
        setProfiles(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement profils :", err);
        setError("Impossible de charger les profils. Veuillez réessayer.");
        setLoading(false);
      });
  }, []);

  const selectProfile = (name) => {
    document.body.style.transition = "0.5s";
    document.body.style.opacity = "0";

    setTimeout(() => {
      alert("Bienvenue " + name + " ⚔️");
      navigate("/dashboard");
    }, 500);
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Chargement des profils...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: "50px" }}>{error}</p>;

  return (
    <div className={styles.profilesPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Choisis ton Guerrier Mathématique</h1>

        <div className={styles.profiles}>
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={styles.profileCard}
              onClick={() => selectProfile(profile.name)}
            >
              <img
                src={getAvatarSrc(profile.avatar)}
                alt={profile.name}
                className={styles.avatarImage}
              />
              <div className={styles.profileName}>
                {profile.name} 
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profiles;