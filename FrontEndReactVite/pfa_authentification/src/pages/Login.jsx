import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import axios pour appeler le backend
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    try {
      // 🔹 Appel POST vers backend Django pour récupérer JWT
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: email, // ⚠️ Django JWT attend "username" même si c'est un email
        password: password,
      });

      // 🔹 Stocker tokens dans localStorage pour utilisation ultérieure
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      setMessage("Connexion réussie 🎉");
      setMessageColor("green");

      // 🔹 Redirection vers la page des profils enfants
      navigate("/profiles");
    } catch (err) {
      setMessage("Email ou mot de passe incorrect");
      setMessageColor("red");
      console.error(err.response.data);
    }
  };

  return (
    <>
      <video autoPlay muted loop playsInline className="bg-video">
        <source src="/videos/backgroundvideo.mp4" type="video/mp4" />
      </video>

      <div className="login-box">
        <h1>Connexion Parent</h1>

        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Se connecter</button>
        </form>

        <p style={{ color: messageColor }}>{message}</p>

        <div className="auth-links">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
          <Link to="/register">Créer un compte</Link>
        </div>
      </div>
    </>
  );
}

export default Login;