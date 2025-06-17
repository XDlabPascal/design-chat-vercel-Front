import { useState } from 'react';

export default function ChatApp() {
  const [phase, setPhase] = useState('chat'); // 'chat' | 'summary' | 'done'
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Bonjour, je suis ton IA pour évaluer tes connaissances en conception centrée client. Que peux-tu me dire sur ce sujet ?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch("https://design-chat-render-backend.onrender.com/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await res.json();

      if (data.phase === 'summary') {
        setSummary(data.summary); // objet { niveau, videos: [], synthese }
        setPhase('summary');
      } else {
        const botReply = { sender: 'bot', text: data.reply };
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: "Erreur serveur ou IA inaccessible." }]);
    }

    setLoading(false);
  };

  const sendEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://design-chat-render-backend.onrender.com/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          summary
        })
      });

      if (res.ok) {
        setSent(true);
        setPhase('done');
      }
    } catch (e) {
      alert("Erreur lors de l'envoi de l'e-mail.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto bg-white p-4 shadow rounded-lg space-y-2">
        {phase === 'chat' &&
          messages.map((msg, i) => (
            <div key={i} className={`text-${msg.sender === 'bot' ? 'left' : 'right'} mb-2`}>
              <span className={`inline-block p-2 rounded-lg ${msg.sender === 'bot' ? 'bg-gray-200' : 'bg-blue-200'}`}>
                {msg.text}
              </span>
            </div>
          ))
        }

        {phase === 'summary' && summary && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🎯 Niveau estimé :</h2>
            <p>{summary.niveau}</p>

            <h2 className="text-xl font-semibold">📺 Playlist recommandée :</h2>
            <ul className="list-disc list-inside space-y-1">
              {summary.videos.map((url, i) => (
                <li key={i}><a href={url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{url}</a></li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold">📝 Synthèse :</h2>
            <p>{summary.synthese}</p>

            <div className="mt-6 space-y-2">
              <label className="block font-medium">Entrez votre e-mail pour recevoir la synthèse :</label>
              <input
                type="email"
                className="border rounded w-full p-2"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={sendEmail}
                className="bg-[#F16E00] text-white px-4 py-2 rounded hover:opacity-90"
                disabled={loading}
              >
                Envoyer la synthèse
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-green-700 font-semibold">
            ✅ Synthèse envoyée par e-mail !
          </div>
        )}
      </div>

      {phase === 'chat' && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border rounded p-2"
            placeholder="Écris ta réponse..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 bg-[#F16E00] text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      )}
    </div>
  );
}
