import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatApp() {
  const navigate = useNavigate();

  // tableau [{role:'assistant'|'user', content:'...'}]
  const [history, setHistory] = useState([
    { role: 'assistant', content: "Bonjour ! Première question : que sais-tu de l’UX ?" }
  ]);

  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    const newHist = [...history, { role: 'user', content: input }];
    setHistory(newHist);
    setInput('');
    setLoading(true);

    const res = await fetch('https://design-chat-render-backend.onrender.com/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: newHist }),
    });

    const { reply, done, error } = await res.json();

    if (error) {
      setHistory(h => [...h, { role: 'assistant', content: error }]);
    } else {
      setHistory(h => [...h, { role: 'assistant', content: reply }]);
      if (done) navigate('/synthese');   // ← 5 questions complétées
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto bg-white shadow rounded p-4 space-y-2">
        {history.map((m, i) => (
          <div key={i} className={m.role === 'assistant' ? 'text-left' : 'text-right'}>
            <span className={`inline-block p-2 rounded-lg ${
              m.role === 'assistant' ? 'bg-gray-200' : 'bg-[#F16E00] text-white'}`}>
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
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 bg-[#F16E00] text-white rounded disabled:opacity-50">
          Envoyer
        </button>
      </div>
    </div>
  );
}
