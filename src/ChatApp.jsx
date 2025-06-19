import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatApp() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour ! Je suis ton IA pour évaluer tes connaissances sur le design. Pour commencer, peux-tu me dire ce que c'est selon toi ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoad] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false); // message ⏳ déjà envoyé ?

  /* ----- envoi du message utilisateur et appel backend ----- */
  const send = async () => {
    if (!input.trim()) return;

    const newHistory = [...history, { role: 'user', content: input }];
    setHistory(newHistory);
    setInput('');
    setLoad(true);

    const res = await fetch(
      'https://design-chat-render-backend.onrender.com/message',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
      },
    );

    const { reply, done, error } = await res.json();

    /* 1. ajoute la réponse IA ou l'erreur */
    if (error) {
      setHistory((h) => [...h, { role: 'assistant', content: error }]);
    } else {
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
    }

    /* 2. message de transition + redirection */
    if (done && !transitionDone) {
      setTransitionDone(true);
      setHistory((h) => [
        ...h,
        { role: 'assistant', content: '⏳ Merci ! Je prépare ta synthèse…' },
      ]);
      setTimeout(() => navigate('/synthese'), 2000);
    }

    setLoad(false);
  };

  /* -------------------- rendu UI ---------------------------- */
  return (
    <div className="h-screen flex flex-col w-[80%] mx-auto p-4">
      <div className="flex-1 overflow-y-auto bg-white shadow rounded p-4 space-y-2">
        {history.map((m, i) => (
          <div
            key={i}
            className={m.role === 'assistant' ? 'text-left' : 'text-right'}
          >
            <span
              className={`inline-block p-2 rounded ${
                m.role === 'assistant'
                  ? 'bg-gray-200'
                  : 'bg-[#F16E00] text-white'
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Ta réponse…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 bg-[#F16E00] text-white rounded disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
