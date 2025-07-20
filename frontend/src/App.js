import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chess from "./pages/ChessPage";

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
