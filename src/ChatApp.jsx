import { useState } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Bonjour, je suis ton IA pour évaluer tes connaissances en conception centrée client. Que puis-tu me dire sur ce sujet ?"
    }
  ]);
  const [input, setInput]   = useState('');
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !email.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://design-chat-render-backend.onrender.com/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, email })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Erreur de connexion au serveur.' }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Champ e-mail */}
      <input
        type="email"
        className="w-full border rounded p-2 mb-4"
        placeholder="Ton adresse e-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      {/* Zone de messages */}
      <div className="h-[650px] overflow-y-auto p-4 space-y-2 bg-white shadow rounded-lg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-${msg.sender === 'bot' ? 'left' : 'right'} mb-2`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.sender === 'bot' ? 'bg-gray-200' : 'bg-orange-100'
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Champ de saisie + bouton */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          placeholder="Écris ta réponse…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 rounded text-white disabled:opacity-50"
          style={{ backgroundColor: '#F16E00' }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
