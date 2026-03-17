import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './Style/App.css';

import Header from './Header';
import Sidebar from './Sidebar';
import Home from './Home';
import Niveau from './Niveau';
import Badges from './Badges';
import Reseaux from './Reseaux';
import Quests from './Quests';
import Reports from './Reports';
import Setting from './Setting';
import Login from "./Login";

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const OpenSidebar = () => setOpenSidebarToggle(!openSidebarToggle);

  return (
    <Router>
      <div className="grid-container">
        <Header OpenSidebar={OpenSidebar} />

        <Sidebar
          openSidebarToggle={openSidebarToggle}
          OpenSidebar={OpenSidebar}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/niveau" element={<Niveau />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/reseaux" element={<Reseaux />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;