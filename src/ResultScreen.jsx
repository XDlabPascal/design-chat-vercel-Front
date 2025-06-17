import { useState } from 'react';

export default function ResultScreen({ summaryData, onEmailSubmit }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      await fetch('https://design-chat-render-backend.onrender.com/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, summary: summaryData }),
      });
      setSent(true);
    } catch (error) {
      alert("Erreur d'envoi du mail.");
    }
    setSending(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🎯 Synthèse de ton évaluation</h2>

      <div>
        <h3 className="font-semibold text-gray-700">📊 Niveau global :</h3>
        <p>{summaryData.niveau}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">✅ Points forts :</h3>
        <ul className="list-disc list-inside text-green-700">
          {summaryData.pointsForts.map((point, i) => <li key={i}>{point}</li>)}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">⚠️ Points à améliorer :</h3>
        <ul className="list-disc list-inside text-red-600">
          {summaryData.pointsFaibles.map((point, i) => <li key={i}>{point}</li>)}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">📺 Playlist personnalisée :</h3>
        <ul className="list-decimal list-inside text-blue-800 underline">
          {summaryData.videos.map((url, i) => (
            <li key={i}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
          ))}
        </ul>
      </div>

      {!sent ? (
        <div className="space-y-4">
          <p>Souhaites-tu recevoir cette synthèse par email ?</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Ton adresse email"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-[#F16E00] text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            {sending ? "Envoi en cours..." : "Recevoir par email"}
          </button>
        </div>
      ) : (
        <p className="text-green-600 font-semibold">📧 Synthèse envoyée !</p>
      )}
    </div>
  );
}
