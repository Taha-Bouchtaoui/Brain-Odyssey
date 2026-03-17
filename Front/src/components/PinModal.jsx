import React, { useState } from "react";
import axios from "../utils/axios.js";
import "../Style/PinModal.css";

export function PinModal({ onSuccess, onCancel, action = "" }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!pin || pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/settings/pin/verify/", { pin });
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || "Incorrect PIN.";
      setError(msg);
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pin-overlay">
      <div className="pin-modal">
        <h3>Enter Your PIN</h3>
        {action && <p className="pin-action-label">Action: <strong>{action}</strong></p>}

        <div className="pin-inputs">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        {error && <p className="pin-error">{error}</p>}

        <div className="pin-buttons">
          <button className="pin-btn-confirm" onClick={handleSubmit} disabled={loading}>
            {loading ? "..." : "Confirm"}
          </button>
          <button className="pin-btn-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}