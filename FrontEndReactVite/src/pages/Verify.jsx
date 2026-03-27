import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Verify() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    try {
      if (!email) {
        setMessage("Email manquant !");
        return;
      }

      // 🔐 Vérification email
      await axios.post("http://127.0.0.1:8000/api/verify-email/", {
        email,
        code,
      });

      setMessage("✅ Compte vérifié avec succès !");

      // 🚀 Redirection vers login
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Erreur lors de la vérification"
      );
    }
  };

  return (
    <div>
      <h2>Vérification de votre email</h2>

      <p>Un code a été envoyé à : {email}</p>

      <input
        type="text"
        placeholder="Code de vérification"
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={handleVerify}>
        Valider
      </button>

      <p>{message}</p>
    </div>
  );
}

export default Verify;