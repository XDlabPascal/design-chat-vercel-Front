import React, { useEffect, useState } from "react";
import { parseSynthese } from "./utils/parseSynthese";

export default function Synthese() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("https://design-chat-render-backend.onrender.com/summary")
      .then((res) => res.json())
      .then((data) => {
        if (!data.summary || typeof data.summary !== "string") {
          setError("Synthèse non disponible.");
          setLoading(false);
          return;
        }
        setSummary(parseSynthese(data.summary));
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement de la synthèse.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Chargement de la synthèse…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!summary) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🎯 Synthèse de ton évaluation
      </h2>

      <div>
        <h3 className="font-semibold text-gray-700">Niveau global :</h3>
        <p className="mb-2">{summary.niveau || "Non renseigné"}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">✅ Points forts :</h3>
        <ul className="list-disc list-inside text-green-700">
          {summary.pointsForts.length > 0
            ? summary.pointsForts.map((point, i) => <li key={i}>{point}</li>)
            : <li>Aucun</li>}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">⚠️ Points à améliorer :</h3>
        <ul className="list-disc list-inside text-red-600">
          {summary.pointsFaibles.length > 0
            ? summary.pointsFaibles.map((point, i) => <li key={i}>{point}</li>)
            : <li>Aucun</li>}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">📺 Playlist personnalisée :</h3>
        <ul className="list-decimal list-inside text-blue-800 underline">
          {summary.videos.length > 0
            ? summary.videos.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                  </a>
                </li>
              ))
            : <li>Aucune vidéo recommandée</li>}
        </ul>
      </div>

      {summary.synthese && (
        <div>
          <h3 className="font-semibold text-gray-700">📝 Synthèse :</h3>
          <p className="italic">{summary.synthese}</p>
        </div>
      )}
    </div>
  );
}
