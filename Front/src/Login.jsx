import { useState } from "react";
import axios from "./utils/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    axios.post("/api/login/", {
      username,
      password,
    })
    .then((res) => {
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      alert("Login success!");
      window.location.href = "/";
    })
    .catch(() => alert("Login failed"));
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Username" onChange={(e)=>setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;