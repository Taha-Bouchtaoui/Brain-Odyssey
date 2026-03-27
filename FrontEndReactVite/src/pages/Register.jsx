import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";


const getStrengthColor = (strength) => {
  if (strength === "Faible") return "red";
  if (strength === "Moyen") return "orange";
  if (strength === "Fort") return "green";
  return "black";
};

// 🔥 Chargement avatars
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

  // 🔥 Force mot de passe
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

    // 🔴 Vérifier enfants
    if (children.length === 0) {
      setMessage("⚠️ Ajoutez au moins un enfant !");
      setMessageColor("red");
      return;
    }

    try {
      setMessage("Création du compte...");
      setMessageColor("blue");

      // 📌 REGISTER
      if (children.length === 0) {
  setMessage("Ajoutez au moins un enfant");
  return;
}
      await axios.post("http://127.0.0.1:8000/api/register/", {
        
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        children: children,
      });

      setMessage("📧 Code envoyé à votre email !");
      setMessageColor("green");

      // 🚀 Redirection vers vérification
      setTimeout(() => {
        navigate("/verify-email", {
          state: { email: formData.email },
        });
      }, 1500);

    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Erreur lors de l'inscription");
      setMessageColor("red");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Créer un compte</h2>

        <p style={{ color: messageColor }}>{message}</p>

        <form onSubmit={handleSubmit}>
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
          />

          {formData.password && (
            <p style={{ color: getStrengthColor(passwordStrength) }}>
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

          <h3>Enfants</h3>

          {children.map((child, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Nom"
                value={child.name}
                onChange={(e) =>
                  handleChildChange(index, "name", e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Âge"
                value={child.age}
                onChange={(e) =>
                  handleChildChange(index, "age", e.target.value)
                }
              />

              <div>
                {avatars.map((av) => (
                  <img
                    key={av.name}
                    src={av.src}
                    alt={av.name}
                    width="50"
                    style={{
                      opacity: isAvatarTaken(av.name) ? 0.4 : 1,
                      cursor: "pointer",
                      border:
                        child.avatar === av.name
                          ? "2px solid green"
                          : "none",
                    }}
                    onClick={() =>
                      !isAvatarTaken(av.name) &&
                      handleChildChange(index, "avatar", av.name)
                    }
                  />
                ))}
              </div>

              <button type="button" onClick={() => removeChild(index)}>
                Supprimer
              </button>
            </div>
          ))}

          <button type="button" onClick={addChild}>
            Ajouter enfant
          </button>

          <button type="submit">
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
}