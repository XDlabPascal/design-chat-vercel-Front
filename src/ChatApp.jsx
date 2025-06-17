// ChatApp.jsx (FRONTEND)
import { useState } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Bonjour, je suis ton IA pour évaluer tes connaissances en conception centrée client. Que peux-tu me dire sur ce sujet ?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
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
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: "Erreur serveur ou IA inaccessible." }]);
    }
    setLoading(false);
  };

  const sendEmail = async () => {
    const response = await fetch("https://design-chat-render-backend.onrender.com/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, content: summary })
    });
    const result = await response.json();
    if (result.success) {
      setEmailSent(true);
    }
  };

  if (summary && !emailSent) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h2 className="text-xl font-semibold">Synthèse de ton évaluation</h2>
        <pre className="bg-white p-4 rounded shadow whitespace-pre-wrap">{summary}</pre>
        <div className="mt-4">
          <input
            type="email"
            placeholder="Ton email pour recevoir la synthèse"
            className="border p-2 rounded mr-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={sendEmail}
            className="bg-[#F16E00] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Envoyer par email
          </button>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return <div className="text-center mt-8 text-green-600">Synthèse envoyée avec succès ✉️</div>;
  }

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto bg-white shadow rounded-lg p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`text-${msg.sender === 'bot' ? 'left' : 'right'} mb-2`}>
            <span className={`inline-block p-2 rounded-lg ${msg.sender === 'bot' ? 'bg-gray-200' : 'bg-[#F16E00] text-white'}`}>
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
          className="px-4 py-2 bg-[#F16E00] text-white rounded hover:opacity-90 disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
