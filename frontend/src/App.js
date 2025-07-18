
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chess from "./pages/Chess";

function App() {
  return (
        <Router>
            <Routes>
              <Route path="/" element={<Chess />} />             
            </Routes>
        </Router>
  );
}

export default App;
