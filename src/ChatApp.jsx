import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatApp() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const newHistory = [...history, { role: 'user', content: input }];
    setHistory(newHistory);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
      });

      if (!res.ok) {
        throw new Error("🚨 Le serveur n'a pas répondu correctement. Merci de réessayer dans quelques instants.");
      }

      const { reply, done, error, jobId } = await res.json();
      const updatedUserMessageCount = newHistory.filter(m => m.role === 'user').length;

      if (error) {
        setHistory(h => [...h, { role: 'assistant', content: error }]);
      } else if (done || updatedUserMessageCount >= 5) {
        if (!transitionDone) {
          setTransitionDone(true);
          setHistory(h => [
            ...h,
            { role: 'assistant', content: '⏳ Merci ! Je prépare ta synthèse…' },
          ]);

          const synthesePath = jobId ? `/synthese?jobId=${encodeURIComponent(jobId)}` : '/synthese';
          setTimeout(() => navigate(synthesePath, { replace: true }), 2000);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) send();
  };

  return (
    <div className="h-screen flex flex-col w-[80%] mx-auto p-4"> 
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-white shadow rounded p-4 space-y-2"
        style={{ scrollBehavior: 'smooth' }}
      >
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
          ref={inputRef}
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
          className="px-4 py-2 bg-black text-white rounded-none disabled:opacity-50"
          aria-label="Envoyer le message"
        >
          {loading ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}