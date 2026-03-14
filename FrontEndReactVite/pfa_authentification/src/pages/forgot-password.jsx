import React, { useState } from "react";
import "./ForgotPassword.css";
import pswrdImage from "../assets/images/pswrd.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification rapide côté frontend
    if (!email.includes("@")) {
      setMessage("Veuillez entrer un email valide");
      setMessageColor("red");
      return;
    }

    try {
      // Appel à l'API Django
      const res = await fetch("http://127.0.0.1:8000/api/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Lien envoyé avec succès");
        setMessageColor("green");
      } else {
        // Si le backend renvoie une erreur
        setMessage(data.message || "Erreur lors de l'envoi du lien");
        setMessageColor("red");
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur");
      setMessageColor("red");
      console.error(error);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-wrapper">
        <div className="form-image">
          <img src={pswrdImage} alt="mdp" className="imgbackground" />
        </div>
        <div className="auth-form-box">
          <h2>Mot de passe oublié</h2>
          <p>Entrez votre email pour recevoir un lien de réinitialisation</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Envoyer le lien</button>
          </form>

          {message && <p style={{ color: messageColor }}>{message}</p>}

          <div className="auth-links">
            <a href="/">Retour à la connexion</a> |{" "}
            <a href="/register">Créer un compte</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;