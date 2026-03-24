// Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [attempts, setAttempts] = useState(0); // compte des tentatives
  const [isBlocked, setIsBlocked] = useState(false); // bouton bloqué
  const [timer, setTimer] = useState(60); // 60 secondes de blocage
  const navigate = useNavigate();

  // Gestion du compte à rebours si bloqué
  useEffect(() => {
    let interval = null;
    if (isBlocked) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsBlocked(false);
            setAttempts(0);
            setMessage("");
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked]);

  const login = async (e) => {
    e.preventDefault();

    if (isBlocked) return;

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: email,
        password: password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      setMessage("Connexion réussie 🎉");
      setMessageColor("green");

      // Redirection après 0.5s
      setTimeout(() => navigate("/profiles"), 500);
    } catch (err) {
      console.error(err.response?.data);
      setMessage("Email ou mot de passe incorrect");
      setMessageColor("red");
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= 3) {
          setIsBlocked(true);
          setMessage("Trop de tentatives ! Réessayez dans 60 secondes.");
        }
        return newAttempts;
      });
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

          {/* Message dynamique */}
          {message && <p style={{ color: messageColor, marginTop: "10px" }}>{message}</p>}

          <button type="submit" disabled={isBlocked}>
            {isBlocked ? `Bloqué (${timer}s)` : "Se connecter"}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: "15px" }}>
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
          <Link to="/register" style={{ marginLeft: "10px" }}>Créer un compte</Link>
        </div>
      </div>
    </>
  );
}

export default Login;