// ───────────────────────────────────────────────────────────────
// App.jsx  – point d'entrée React + routes
// ───────────────────────────────────────────────────────────────
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatApp from './ChatApp';
import Synthese from './Synthese';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/synthese" element={<Synthese />} />
      </Routes>
    </Router>
  );
}
