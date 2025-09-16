import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatApp() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour !\n Je suis un agent IA pour évaluer tes connaissances sur le design.\n Pour commencer, peux-tu me dire ce que c'est selon toi ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  // Send message to backend and handle response
  const send = async () => {
    if (!input.trim()) return;

    const newHistory = [...history, { role: 'user', content: input.trim() }];
    setHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(
        'https://design-chat-render-backend.onrender.com/message',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: newHistory }),
        }
      );

      if (!res.ok) {
        throw new Error('Erreur réseau');
      }

      const { reply, done, error } = await res.json();

      if (error) {
        setHistory(h => [...h, { role: 'assistant', content: error }]);
      } else if (done) {
        if (!transitionDone) {
          setTransitionDone(true);
          setHistory(h => [
            ...h,
            { role: 'assistant', content: '⏳ Merci ! Je prépare ta synthèse…' },
          ]);
          setTimeout(() => navigate('/synthese'), 2000);
        }
      } else {
        setHistory(h => [...h, { role: 'assistant', content: reply }]);
      }
    } catch (err) {
      setHistory(h => [
        ...h,
        { role: 'assistant', content: err.message || 'Erreur inconnue.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle pressing Enter in the input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) send();
  };

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
              aria-label={m.role === 'assistant' ? 'Message IA' : 'Votre message'}
              dangerouslySetInnerHTML={{
                __html: m.content.replace(/\n/g, '<br />'),
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 items-center">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Ta réponse…"
          value={input}
          aria-label="Champ de saisie"
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-[#F16E00] text-white rounded disabled:opacity-50"
          aria-label="Envoyer le message"
        >
          {loading ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
