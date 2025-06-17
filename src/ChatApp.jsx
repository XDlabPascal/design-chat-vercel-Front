// ───────────────────────────────────────────────────────────────
// ChatApp.jsx  – étape 1 : questions / réponses
// ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Bonjour ! Je suis ton IA. Pour commencer, peux‑tu m'expliquer ce que tu sais sur l'UX ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // après chaque nouvelle réponse IA, check si la synthèse complète est arrivée
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (
      lastMsg.sender === 'bot' &&
      lastMsg.text.includes('🎯 Niveau estimé') &&
      lastMsg.text.includes('📺 Playlist recommandée') &&
      lastMsg.text.includes('📝 Synthèse')
    ) {
      // on passe à la page de synthèse
      navigate('/synthese');
    }
  }, [messages, navigate]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // ajoute le message utilisateur
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://design-chat-render-backend.onrender.com/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      }
      if (data.error) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.error }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Erreur réseau.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto bg-white shadow rounded p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === 'bot' ? 'text-left' : 'text-right'}>
            <span
              className={`inline-block p-2 rounded-lg ${
                m.sender === 'bot' ? 'bg-gray-200' : 'bg-[#F16E00] text-white'
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Écris ta réponse…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-[#F16E00] text-white rounded disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
