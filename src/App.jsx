// App.jsx
import { Routes, Route } from 'react-router-dom';   // ⬅️ plus de BrowserRouter ici
import ChatApp from './ChatApp';
import Synthese from './Synthese';

export default function App() {
  console.log('Rendering App');
  return (
    <Routes>
      <Route path="/" element={<ChatApp />} />
      <Route path="/synthese" element={<Synthese />} />
    </Routes>
  );
}
