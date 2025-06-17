import { useState } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Bonjour ! Je suis ton IA – dis-moi ce que tu sais en UX." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(
        'https://design-chat-render-backend.onrender.com/message',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        }
      );
      const data = await res.json();
      console.log('🔎 backend →', data);

      if (data.reply) {
        setMessages((p) => [...p, { sender: 'bot', text: data.reply }]);
      }
      if (data.summary) {
        setSummary(data.summary);           // quand la synthèse arrive
      }
      if (data.error) {
        setMessages((p) => [...p, { sender: 'bot', text: data.error }]);
      }
    } catch (err) {
      setMessages((p) => [...p, { sender: 'bot', text: "Erreur réseau." }]);
      console.error(err);
    }
    setLoading(false);
  };

  /* ------------- AFFICHAGE ------------- */
  if (summary) {
    return (
      <pre className="p-4 bg-white rounded shadow whitespace-pre-wrap">{summary}</pre>
    );
  }

  return (
    <div className="h-screen flex flex-col max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto bg-white p-4 shadow rounded space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === 'bot' ? 'text-left' : 'text-right'}>
            <span
              className={
                m.sender === 'bot'
                  ? 'inline-block bg-gray-200 p-2 rounded'
                  : 'inline-block bg-[#F16E00] text-white p-2 rounded'
              }
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Écris ta réponse…"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 rounded text-white bg-[#F16E00] disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
