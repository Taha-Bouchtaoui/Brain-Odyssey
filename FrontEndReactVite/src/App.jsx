import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login"; 
  import ForgotPassword from "./pages/forgot-password"
     import Register from "./pages/Register"
         import Profiles from "./pages/profiles"



function App() {
  return (
    <Routes>
     
  
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/profiles" element={<Profiles />} />

    </Routes>
  );
}

export default App;
