import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

// import des images
import warrior from "../assets/avatars/warrior.png";
import wizard from "../assets/avatars/wizard.png";
import knight from "../assets/avatars/knight.png";
import ninja from "../assets/avatars/ninja.png";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [children, setChildren] = useState([]);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  // avatars disponibles (nom et image)
  const avatars = [
    { name: "warrior.png", src: warrior },
    { name: "wizard.png", src: wizard },
    { name: "knight.png", src: knight },
    { name: "ninja.png", src: ninja },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addChild = () => {
    setChildren([...children, { name: "", avatar: "" }]);
  };

  const handleChildNameChange = (index, value) => {
    const updated = [...children];
    updated[index].name = value;
    setChildren(updated);
  };

  const selectAvatar = (index, avatarName) => {
    const updated = [...children];
    updated[index].avatar = avatarName; // juste le nom du fichier
    setChildren(updated);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      setMessageColor("red");
      return;
    }

    try {
      setMessage("Création du compte en cours...");
      setMessageColor("blue");

      // 1️⃣ Créer le parent
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username: formData.email, 
        email: formData.email,
        password: formData.password,
      });

      // 2️⃣ Login automatique pour récupérer token
      const loginResponse = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: formData.email,
        password: formData.password,
      });
      const accessToken = loginResponse.data.access;

      // 3️⃣ Créer les enfants
      for (let child of children) {
          console.log("Envoi enfant:", {
    name: child.name,
    avatar: child.avatar
  });
        if (!child.avatar) throw new Error("Chaque enfant doit choisir un avatar !");

        await axios.post(
          "http://127.0.0.1:8000/api/children/",
          { name: child.name, avatar: child.avatar },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }

      setMessage("Parent et enfants créés avec succès !");
      setMessageColor("green");
      navigate("/");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Erreur lors de la création du compte");
      setMessageColor("red");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Créer un compte</h2>
        <p style={{ color: messageColor }}>{message}</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            required
            pattern="^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$"
            title="Le mot de passe doit contenir au moins 8 caractères, dont au moins 1 chiffre et 1 caractère spécial."
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer mot de passe"
            onChange={handleChange}
            required
            pattern="^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$"
            title="Le mot de passe doit contenir au moins 8 caractères, dont au moins 1 chiffre et 1 caractère spécial."
          />

          <h3>Profils des enfants</h3>

          {children.map((child, index) => (
            <div key={index} className="child-card">
              <input
                type="text"
                placeholder="Nom de l'enfant"
                value={child.name}
                onChange={(e) => handleChildNameChange(index, e.target.value)}
                required
              />
              <p>Choisir un avatar :</p>
              <div className="avatar-selection">
                {avatars.map((av, i) => (
                  <img
                    key={i}
                    src={av.src}
                    alt={av.name}
                    className={child.avatar === av.name ? "avatar selected" : "avatar"}
                    onClick={() => selectAvatar(index, av.name)}
                    style={{
                      width: "70px",
                      margin: "5px",
                      cursor: "pointer",
                      border: child.avatar === av.name ? "3px solid #4CAF50" : "2px solid transparent",
                      borderRadius: "10px",
                    }}
                  />
                ))}
              </div>
              <button type="button" onClick={() => removeChild(index)} className="remove-btn">
                Supprimer
              </button>
            </div>
          ))}

          <button type="button" onClick={addChild} className="add-btn">
            Ajouter un enfant
          </button>

          <button type="submit" className="submit-btn">
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
}