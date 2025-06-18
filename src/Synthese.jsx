// ───────────────────────────────────────────────────────────────
// Synthese.jsx – récupère et affiche la synthèse dynamique
// ───────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Utilitaire : parse la synthèse brute renvoyée par le backend */
function parseSummary(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  let level = '';
  const strengths = [];
  const weaknesses = [];
  const playlist  = [];
  let syntheseTxt = '';

  let current = '';

  for (const l of lines) {
    if (l.startsWith('🎯')) { current = 'level'; level = l.replace(/🎯|Niveau estimé|:|\*/g, '').trim(); }
    else if (l.startsWith('✅')) current = 'str';
    else if (l.startsWith('⚠️')) current = 'weak';
    else if (l.startsWith('📺')) current = 'pl';
    else if (l.startsWith('📝')) current = 'syn';
    else {
      switch (current) {
        case 'str':
          if (l.startsWith('-')) strengths.push(l.slice(1).trim());
          break;
        case 'weak':
          if (l.startsWith('-')) weaknesses.push(l.slice(1).trim());
          break;
        case 'pl': {
          if (l.startsWith('-')) {
            const m = /\[(.*)]\((https?:\/\/.*)\)/.exec(l);
            if (m) playlist.push({ title: m[1], url: m[2] });
          }
          break;
        }
        case 'syn':
          syntheseTxt += l + '\n';
          break;
        default:
          break;
      }
    }
  }
  return { level, strengths, weaknesses, playlist, syntheseTxt };
}

/* ───────────────────────────────────────────────────────────── */
export default function Synthese() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [data,    setData]    = useState(null);

  // Récupération de la synthèse côté backend
  useEffect(() => {
    fetch('https://design-chat-render-backend.onrender.com/summary')
      .then(r => r.json())
      .then(d => {
        if (d.summary) setData(parseSummary(d.summary));
        else           setError(d.error || 'Synthèse indisponible');
        setLoading(false);
      })
      .catch(() => { setError('Erreur réseau'); setLoading(false); });
  }, []);

  // États intermédiaires
  if (loading) return <div className="font-sans min-h-screen flex items-center justify-center">Chargement…</div>;
  if (error)   return <div className="font-sans min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  const { level, strengths, weaknesses, playlist, syntheseTxt } = data;

  return (
    <div className="font-sans min-h-screen bg-[#fffaf5] p-8 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-[#F16E00]">📝 Synthèse UX</h1>

        {/* Niveau */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-lg font-semibold">Niveau estimé</p>
            <p className="text-gray-700">{level || '—'}</p>
          </div>
        </div>

        {/* Points forts & Faiblesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow flex gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-lg font-semibold">Points forts</p>
              <ul className="list-disc ml-5 space-y-1">
                {strengths.map((s,i)=>(<li key={i}>{s}</li>))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-lg font-semibold">Faiblesses</p>
              <ul className="list-disc ml-5 space-y-1">
                {weaknesses.map((w,i)=>(<li key={i}>{w}</li>))}
              </ul>
            </div>
          </div>
        </div>

        {/* Playlist */}
        <div className="bg-white p-6 rounded-2xl shadow flex gap-3">
          <span className="text-2xl">📺</span>
          <div>
            <p className="text-lg font-semibold mb-2">Playlist recommandée (10 vidéos)</p>
            <ul className="list-decimal ml-5 space-y-1 text-[#F16E00]">
              {playlist.map((p,i)=>(
                <li key={i}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Synthèse texte */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-lg font-semibold mb-2">Résumé personnalisé</p>
          <p className="whitespace-pre-wrap">{syntheseTxt}</p>
        </div>

        {/* Bouton retour */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-[#F16E00] hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition"
          >
            🔁 Recommencer
          </button>
        </div>
      </div>
    </div>
  );
}
