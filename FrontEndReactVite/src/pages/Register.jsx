import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

//  Chargement automatique des avatars
const avatarImages = import.meta.glob("../assets/avatars/*.png", { eager: true });

const avatars = Object.keys(avatarImages)
  .map((path) => {
    const fileName = path.split("/").pop();
    return {
      name: fileName,
      src: avatarImages[path].default,
    };
  })
  .sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
    return numA - numB;
  });

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
  });

  const [children, setChildren] = useState([]);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  // 💪 Force mot de passe
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return "Faible";
    if (score <= 3) return "Moyen";
    return "Fort";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const addChild = () => {
    setChildren([...children, { name: "", avatar: "", age: "" }]);
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const isAvatarTaken = (avatarName) =>
    children.some((child) => child.avatar === avatarName);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔴 Vérification mot de passe
    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      setMessageColor("red");
      return;
    }

    // 🔴 OBLIGATOIRE : au moins un enfant
    if (children.length === 0) {
      setMessage("⚠️ Vous devez créer au moins un profil d'enfant !");
      setMessageColor("red");
      return;
    }

    // 🔴 Validation enfants
    for (let child of children) {
      if (!child.name.trim()) {
        setMessage("Chaque enfant doit avoir un nom !");
        setMessageColor("red");
        return;
      }
      if (!child.avatar) {
        setMessage("Chaque enfant doit choisir un avatar !");
        setMessageColor("red");
        return;
      }
      if (!child.age || child.age < 1 || child.age > 15) {
        setMessage("L'âge doit être entre 1 et 15 ans !");
        setMessageColor("red");
        return;
      }
    }

    try {
      setMessage("Création du compte en cours...");
      setMessageColor("blue");

      // 1️⃣ Parent
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
      });

      // 2️⃣ Login auto
      const loginResponse = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: formData.email,
        password: formData.password,
      });

      const accessToken = loginResponse.data.access;

      // 3️⃣ Enfants
      await Promise.all(
        children.map((child) =>
          axios.post(
            "http://127.0.0.1:8000/api/children/",
            {
              name: child.name,
              avatar: child.avatar,
              age: child.age,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )
        )
      );

      setMessage("✅ Compte et enfants créés avec succès !");
      setMessageColor("green");

      setTimeout(() => navigate("/"), 1000);

    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage(
        err.response?.data?.detail ||
        err.message ||
        "Erreur lors de la création du compte"
      );
      setMessageColor("red");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Créer un compte</h2>

        <p style={{ color: messageColor }}>{message}</p>

        {/* 🔴 Message si aucun enfant */}
        {children.length === 0 && (
          <p style={{ color: "red" }}>
            ⚠️ Vous devez ajouter au moins un enfant
          </p>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            required
            pattern="^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$"
            title="Au moins 8 caractères, 1 chiffre et 1 caractère spécial"
          />

          {formData.password && (
            <p
              style={{
                color:
                  passwordStrength === "Faible"
                    ? "red"
                    : passwordStrength === "Moyen"
                    ? "orange"
                    : "green",
                fontWeight: "bold",
              }}
            >
              Force : {passwordStrength}
            </p>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer mot de passe"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone_number"
            placeholder="Téléphone (optionnel)"
            onChange={handleChange}
          />

          <h3>Profils des enfants</h3>

          {children.map((child, index) => (
            <div key={index} className="child-card">

              <input
                type="text"
                placeholder="Nom de l'enfant"
                value={child.name}
                onChange={(e) =>
                  handleChildChange(index, "name", e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Âge"
                value={child.age || ""}
                min="1"
                max="15"
                onChange={(e) =>
                  handleChildChange(index, "age", parseInt(e.target.value))
                }
                onInvalid={(e) =>
                  e.target.setCustomValidity("Âge entre 1 et 15 ans")
                }
              />

              <p>Choisir un avatar :</p>

              <div className="avatar-selection">
                {avatars.map((av, i) => (
                  <img
                    key={i}
                    src={av.src}
                    alt={av.name}
                    className={
                      child.avatar === av.name ? "avatar selected" : "avatar"
                    }
                    onClick={() =>
                      !isAvatarTaken(av.name) &&
                      handleChildChange(index, "avatar", av.name)
                    }
                    style={{
                      width: "70px",
                      margin: "5px",
                      cursor: isAvatarTaken(av.name)
                        ? "not-allowed"
                        : "pointer",
                      border:
                        child.avatar === av.name
                          ? "3px solid #4CAF50"
                          : "2px solid transparent",
                      borderRadius: "10px",
                      opacity: isAvatarTaken(av.name) ? 0.4 : 1,
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => removeChild(index)}
                className="remove-btn"
              >
                Supprimer
              </button>
            </div>
          ))}

          <button type="button" onClick={addChild} className="add-btn">
            Ajouter un enfant
          </button>

          {/* 🔴 Désactivé si aucun enfant */}
          <button
            type="submit"
            className="submit-btn"
            disabled={children.length === 0}
          >
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
}