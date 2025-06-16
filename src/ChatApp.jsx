import { useState } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Bonjour ! Je suis ton IA d'évaluation en expérience client. Je vais te poser quelques questions pour voir ou tu en es sur ce sujet." },
  ]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !email.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch("https://design-chat-render-backend.onrender.com/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input, email })
      });
      const data = await response.json();
      const botReply = { sender: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: "Erreur de connexion au serveur." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="mb-2">
        <input
          type="email"
          className="w-full border rounded p-2 mb-2"
          placeholder="Ton adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="h-[500px] overflow-y-auto p-4 space-y-2 bg-white shadow rounded-lg">
        {messages.map((msg, i) => (
          <div key={i} className={`text-${msg.sender === 'bot' ? 'left' : 'right'} mb-2`}>
            <span className={`inline-block p-2 rounded-lg ${msg.sender === 'bot' ? 'bg-gray-200' : 'bg-blue-200'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
