import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LevelTest from "../onboarding/LevelTest";

import WorldMap from "../worldMap/WorldMap";
import ZoneLevels from "../zone/ZoneLevels";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LevelTest />} />
        <Route path="/world" element={<WorldMap />} />
        <Route path="/zone/:id" element={<ZoneLevels />} />
      </Routes>
    </BrowserRouter>
  );
}
