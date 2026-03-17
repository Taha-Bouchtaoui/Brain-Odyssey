import React, { useState, useEffect, useRef } from "react";
import axios, { BASE_URL } from "./utils/axios.js";
import "./Style/Setting.css";
import { useToast } from "./components/Toast.jsx";
import { PinModal } from "./components/PinModal.jsx";

const AVATAR_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e9d5ff'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%237c3aed'/%3E%3Cellipse cx='50' cy='85' rx='28' ry='20' fill='%237c3aed'/%3E%3C/svg%3E";
const AVATAR_SMALL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e9d5ff'/%3E%3Ccircle cx='30' cy='23' r='11' fill='%237c3aed'/%3E%3Cellipse cx='30' cy='51' rx='17' ry='12' fill='%237c3aed'/%3E%3C/svg%3E";

function Setting() {
  const { showToast, ToastContainer } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null); // ← new
  const [role, setRole] = useState("");
  const [children, setChildren] = useState([]);
  const [editingChild, setEditingChild] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChild, setNewChild] = useState({ username: "", age: "" });

  const originalValues = useRef({ username: "", email: "" });

  const [pinModal, setPinModal] = useState({ visible: false, action: "", onSuccess: null });
  const askPin = (actionLabel, callback) => setPinModal({ visible: true, action: actionLabel, onSuccess: callback });
  const closePin = () => setPinModal({ visible: false, action: "", onSuccess: null });

  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  const reloadChildren = () => {
    axios.get("/api/children/")
      .then((r) => setChildren(r.data.map(child => ({
        ...child,
        avatar: child.avatar
          ? (child.avatar.startsWith("http") ? child.avatar : `${BASE_URL}${child.avatar}`)
          : null
      }))))
      .catch(() => showToast("Failed to load children.", "error"));
  };

  useEffect(() => {
    axios.get("/api/settings/")
      .then((res) => {
        const u = res.data.username || "";
        const e = res.data.email || "";
        setUsername(u);
        setEmail(e);
        setRole(res.data.role || "");
        originalValues.current = { username: u, email: e };
        if (res.data.avatar) {
          setAvatar(res.data.avatar.startsWith("http")
            ? res.data.avatar
            : `${BASE_URL}${res.data.avatar}`
          );
        }
        if (res.data.role === "parent") reloadChildren();
      })
      .catch(() => showToast("Failed to load settings.", "error"));
  }, []);

  // ← only preview, no upload yet
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result); // preview only
    reader.readAsDataURL(file);
  };

const saveSettings = () => {
    const hasUsernameChanged = username !== originalValues.current.username;
    const hasEmailChanged = email !== originalValues.current.email;
    const hasPasswordChanged = password.length > 0;
    const hasAvatarChanged = pendingAvatarFile !== null;

    if (!hasUsernameChanged && !hasEmailChanged && !hasPasswordChanged && !hasAvatarChanged) {
      showToast("No modification noticed.", "warning");
      return;
    }

    askPin("Modify your profile", () => {
      if (pendingAvatarFile) {
        // use FormData when avatar is included
        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        if (password) formData.append("password", password);
        formData.append("avatar", pendingAvatarFile);
        axios.put("/api/settings/", formData)
          .then(() => {
            showToast("Profile updated successfully!");
            setTimeout(() => window.location.reload(), 1000);
          })
          .catch(() => showToast("Update failed.", "error"));
      } else {
        // use JSON when no avatar
        const payload = { username, email };
        if (password) payload.password = password;
        axios.put("/api/settings/", payload, {
          headers: { "Content-Type": "application/json" }
        })
          .then(() => {
            showToast("Profile updated successfully!");
            setTimeout(() => window.location.reload(), 1000);
          })
          .catch(() => showToast("Update failed.", "error"));
      }
    });
  };

  const handleChildAvatarUpload = (e, childId) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditingChild((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
    const formData = new FormData();
    formData.append("avatar", file);
    axios.put(`/api/children/${childId}/`, formData)
      .then((res) => {
        const newAvatar = res.data.avatar
          ? (res.data.avatar.startsWith("http") ? res.data.avatar : `${BASE_URL}${res.data.avatar}`)
          : null;
        setEditingChild((prev) => ({ ...prev, avatar: newAvatar }));
        setChildren(children.map(c => c.id === childId ? { ...c, avatar: newAvatar } : c));
        showToast("Child avatar updated!");
      })
      .catch(() => showToast("Child avatar upload failed.", "error"));
  };

  const saveChild = (childId) => {
    const original = children.find(c => c.id === childId);
    const hasUsernameChanged = editingChild.username !== original.username;
    const hasAgeChanged = String(editingChild.age) !== String(original.age);

    if (!hasUsernameChanged && !hasAgeChanged) {
      showToast("No modification noticed.", "warning");
      return;
    }

    askPin(`Update ${editingChild.username}'s profile`, () => {
      const formData = new FormData();
      formData.append("username", editingChild.username);
      formData.append("age", editingChild.age || "");
      axios.put(`/api/children/${childId}/`, formData)
        .then((res) => {
          showToast(`${res.data.username}'s profile updated!`);
          setChildren(children.map(c =>
            c.id === childId
              ? { ...c, username: editingChild.username, age: editingChild.age }
              : c
          ));
          setEditingChild(null);
        })
        .catch((err) => {
          const msg = err.response?.data?.error || "Failed to update child.";
          showToast(msg, "error");
        });
    });
  };

  const deleteChild = (childId, childUsername) => {
    if (children.length <= 1) {
      showToast("You must have at least one child in your account.", "warning");
      return;
    }
    askPin(`Delete ${childUsername}'s account`, () => {
      axios.delete(`/api/children/${childId}/delete/`)
        .then(() => {
          showToast(`${childUsername}'s account deleted.`, "warning");
          setChildren(children.filter(c => c.id !== childId));
          setEditingChild(null);
        })
        .catch(() => showToast("Failed to delete child.", "error"));
    });
  };

  const addChild = () => {
    if (!newChild.username || !newChild.age) {
      showToast("Please fill in username and age.", "warning");
      return;
    }
    const childToAdd = { ...newChild };
    askPin("Add a new child account", () => {
      axios.post("/api/children/add/", { children: [childToAdd] })
        .then((res) => {
          showToast(res.data.message);
          setNewChild({ username: "", age: "" });
          setShowAddForm(false);
          reloadChildren();
        })
        .catch((err) => {
          const msg = err.response?.data?.error || JSON.stringify(err.response?.data) || "Failed to add child.";
          showToast(msg, "error");
        });
    });
  };

  const changePin = () => {
    if (!oldPin || !newPin || !confirmNewPin) {
      showToast("Please fill in all PIN fields.", "warning");
      return;
    }
    if (newPin !== confirmNewPin) {
      showToast("New PINs do not match.", "error");
      return;
    }
    if (newPin.length < 4) {
      showToast("New PIN must be at least 4 digits.", "warning");
      return;
    }
    axios.post("/api/settings/pin/change/", { old_pin: oldPin, new_pin: newPin })
      .then(() => {
        showToast("PIN changed successfully!");
        setOldPin("");
        setNewPin("");
        setConfirmNewPin("");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Failed to change PIN.";
        showToast(msg, "error");
      });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  const deleteAccount = () => {
    askPin("Delete your account permanently", () => {
      axios.delete("/api/settings/delete/")
        .then(() => { localStorage.clear(); window.location.href = "/login"; })
        .catch(() => showToast("Delete failed.", "error"));
    });
  };

  return (
    <main className="main-container settings-page">
      <ToastContainer />

      {pinModal.visible && (
        <PinModal
          action={pinModal.action}
          onSuccess={() => { closePin(); pinModal.onSuccess(); }}
          onCancel={closePin}
        />
      )}

      <div className="settings-box">
        <h4>Account Management</h4>

        <div className="profile-section">
          <img
            src={avatar || AVATAR_PLACEHOLDER}
            alt="avatar"
            className="avatar"
            onError={(e) => { e.target.onerror = null; e.target.src = AVATAR_PLACEHOLDER; }}
          />
          <input type="file" accept="image/png, image/jpeg" onChange={handleAvatarSelect} />
        </div>

        <label>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Change Password</label>
        <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="account-buttons">
          <button className="primary-btn" onClick={saveSettings}>Modifier Profile</button>
          <button className="primary-btn" onClick={logout}>Logout</button>
          <button className="danger-btn" onClick={deleteAccount}>Delete Account</button>
        </div>

        {role === "parent" && (
          <div className="pin-section">
            <h4>Change PIN</h4>
            <label>Current PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Current PIN"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
            />
            <label>New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="New PIN (min 4 digits)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <label>Confirm New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Confirm New PIN"
              value={confirmNewPin}
              onChange={(e) => setConfirmNewPin(e.target.value)}
            />
            <div className="account-buttons">
              <button className="primary-btn" onClick={changePin}>Change PIN</button>
            </div>
          </div>
        )}

        {role === "parent" && (
          <div className="children-section">
            <h4>Manage Children</h4>

            {children.length === 0 ? (
              <p>No children linked to your account yet.</p>
            ) : (
              children.map((child) => (
                <div key={child.id} className="child-card">
                  {editingChild && editingChild.id === child.id ? (
                    <div className="child-edit">
                      <div className="profile-section">
                        <img
                          src={editingChild.avatar || AVATAR_PLACEHOLDER}
                          alt="avatar"
                          className="avatar"
                          onError={(e) => { e.target.onerror = null; e.target.src = AVATAR_PLACEHOLDER; }}
                        />
                        <input type="file" accept="image/png, image/jpeg"
                          onChange={(e) => handleChildAvatarUpload(e, child.id)} />
                      </div>
                      <label>Username</label>
                      <input type="text" value={editingChild.username}
                        onChange={(e) => setEditingChild({ ...editingChild, username: e.target.value })} />
                      <label>Age</label>
                      <input type="number" min="1" max="18" value={editingChild.age || ""}
                        onChange={(e) => setEditingChild({ ...editingChild, age: e.target.value })} />
                      <div className="child-buttons">
                        <button className="primary-btn" onClick={() => saveChild(child.id)}>Save</button>
                        <button className="danger-btn" onClick={() => setEditingChild(null)}>Cancel</button>
                        <button className="danger-btn" onClick={() => deleteChild(child.id, child.username)}>Delete</button>
                      </div>
                    </div>
                  ) : (
                    <div className="child-info">
                      <img src={child.avatar || AVATAR_SMALL} alt={child.username} className="avatar-small"
                        onError={(e) => { e.target.onerror = null; e.target.src = AVATAR_SMALL; }} />
                      <div className="child-details">
                        <p><strong>{child.username}</strong></p>
                        <p>Age: {child.age || "N/A"}</p>
                      </div>
                      <button className="primary-btn" onClick={() => setEditingChild({ ...child })}>Edit</button>
                    </div>
                  )}
                </div>
              ))
            )}

            {!showAddForm && (
              <button className="primary-btn" onClick={() => setShowAddForm(true)}>+ Add Child</button>
            )}

            {showAddForm && (
              <div className="add-child-form">
                <label>Username</label>
                <input type="text" placeholder="Child username" value={newChild.username}
                  onChange={(e) => setNewChild({ ...newChild, username: e.target.value })} />
                <label>Age</label>
                <input type="number" placeholder="Child age" min="1" max="18" value={newChild.age}
                  onChange={(e) => setNewChild({ ...newChild, age: e.target.value })} />
                <div className="child-buttons">
                  <button className="primary-btn" onClick={addChild}>Add Child</button>
                  <button className="danger-btn" onClick={() => {
                    setShowAddForm(false);
                    setNewChild({ username: "", age: "" });
                  }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Setting;