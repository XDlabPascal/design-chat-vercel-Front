import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatApp() {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour !\n\nJe suis Lucas, un agent IA pour évaluer tes connaissances sur le design, et plus généralement sur la conception centrée utilisateurs.\n\nPour commencer, peux-tu me dire ce que le design évoque pour toi ?\n",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  // Compte le nombre de messages utilisateur
  const userMessageCount = history.filter(m => m.role === 'user').length;

  // Scroll automatiquement vers le bas à chaque nouveau message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Envoi du message au backend et gestion de la réponse
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

      // Calculer le nombre de messages utilisateur après ajout
      const updatedUserMessageCount = newHistory.filter(m => m.role === 'user').length;

      if (error) {
        setHistory(h => [...h, { role: 'assistant', content: error }]);
      } else if (done || updatedUserMessageCount >= 10) {
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
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatApp() {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour !\n\nJe suis Lucas, un agent IA pour évaluer tes connaissances sur le design, et plus généralement sur la conception centrée utilisateurs.\n\nPour commencer, peux-tu me dire ce que le design évoque pour toi ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  // Compte le nombre de messages utilisateur
  const userMessageCount = history.filter(m => m.role === 'user').length;

  // Scroll automatiquement vers le bas à chaque nouveau message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Envoi du message au backend et gestion de la réponse
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

      // Calculer le nombre de messages utilisateur après ajout
      const updatedUserMessageCount = newHistory.filter(m => m.role === 'user').length;

      if (error) {
        setHistory(h => [...h, { role: 'assistant', content: error }]);
      } else if (done || updatedUserMessageCount >= 10) {
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
