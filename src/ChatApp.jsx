import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Optionally configure how many user answers trigger the summary (default 5)
const QUESTIONS_COUNT = Number(import.meta.env.VITE_QUESTIONS_COUNT ?? 5);

// Fonction utilitaire pour fetch avec timeout
const fetchWithTimeout = (url, options, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('⏳ Temps de réponse trop long du serveur. Merci de rafraîchir la page de ton navigateur internet.')), timeout)
    ),
  ]);
};

export default function ChatApp() {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour !\nJe suis Lucas, un agent IA ...\nJe vais te poser 10 questions.\nN’hésite pas à répondre franchement, ...\nDis moi Ok quand tu es prêt(e)\n",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  // Scroll + focus behavior
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (inputRef.current) inputRef.current.focus();
  }, [history]);

  const send = async () => {
    if (!input.trim()) return;

    const newHistory = [...history, { role: 'user', content: input.trim() }];
    setHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetchWithTimeout(
        'https://design-chat-render-backend.onrender.com/message',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: newHistory }),
        }
      );

      if (!res.ok) {
        throw new Error("🚨 Le serveur n'a pas répondu correctement. Merci de réessayer dans quelques instants.");
      }

      const { reply, done, error } = await res.json();

      // Calculer le nombre de messages utilisateur après ajout
      const updatedUserMessageCount = newHistory.filter(m => m.role === 'user').length;

      if (error) {
        setHistory(h => [...h, { role: 'assistant', content: error }]);
      } else if (done || updatedUserMessageCount >= QUESTIONS_COUNT) {
        // If the backend indicates completion (done) OR we've reached the expected number of answers,
        // prepare the synthèse and navigate to /synthese.
        if (!transitionDone) {
          setTransitionDone(true);
          setHistory(h => [
            ...h,
            { role: 'assistant', content: '⏳ Merci ! Je prépare ta synthèse…' },
          ]);
          // navigate after a short delay, replace to avoid navigating back into the finished chat
          setTimeout(() => navigate('/synthese', { replace: true }), 2000);
        }
      } else {
        // normal assistant reply
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
      {/* ...rest of your UI (chat rendering, input, button) ... */}
    </div>
  );
}
