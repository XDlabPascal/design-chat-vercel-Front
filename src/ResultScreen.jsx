import { useState } from 'react';

export default function ResultScreen({ summaryData }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await fetch('/api/send-summary', {
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

  if (!summaryData) {
    return <div className="p-6 text-red-600">Aucun résultat à afficher.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-6">
      {/* Titre supprimé */}

      {/* Rubrique "Niveau global" supprimée */}

      <div>
        <h3 className="font-semibold text-green-700">✅ Points forts :</h3>
        <ul className="list-disc list-inside">
          {(summaryData.pointsForts ?? []).length > 0
            ? summaryData.pointsForts.map((point, i) => (
                <li key={i} className="text-black">{point}</li>
              ))
            : <li className="text-black">Aucun point fort détecté.</li>}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-red-600">⚠️ Points à améliorer :</h3>
        <ul className="list-disc list-inside">
          {(summaryData.pointsFaibles ?? []).length > 0
            ? summaryData.pointsFaibles.map((point, i) => (
                <li key={i} className="text-black">{point}</li>
              ))
            : <li className="text-black">Aucun point faible détecté.</li>}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">📺 Playlist personnalisée :</h3>
        <ul className="list-decimal list-inside text-blue-800 underline">
          {(summaryData.videos ?? []).length > 0
            ? summaryData.videos.map((video, i) =>
                <li key={i}>
                  <a href={video.url} target="_blank" rel="noopener noreferrer">{video.title}</a>
                </li>
              )
            : <li>Aucune vidéo recommandée.</li>}
        </ul>
      </div>

      {summaryData.resume &&
        <div>
          <h3 className="font-semibold text-gray-700">📝 Résumé personnalisé :</h3>
          <p className="whitespace-pre-wrap">{summaryData.resume}</p>
        </div>
      }

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
            className="bg-black text-white px-4 py-2 rounded-none hover:bg-gray-800"
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