import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login"; 
import ForgotPassword from "./pages/forgot-password";
import Register from "./pages/Register";
import Profiles from "./pages/profiles";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} /> {/* ajout /login explicite */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} /> {/* minuscule */}
      <Route path="/profiles" element={<Profiles />} />
      <Route path="*" element={<div>Page non trouvée</div>} /> {/* catch-all */}
    </Routes>
  );
}

export default App;