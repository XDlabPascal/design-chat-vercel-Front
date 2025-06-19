import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ---------- utilitaire pour parser la synthèse brute ---------- */
function parseSummary(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  let level = '', strengths = [], weaknesses = [], playlist = [], synth = '', current = '';
  for (const l of lines) {
    if (l.startsWith('🎯')) { current = 'level'; level = l.replace(/.*:/, '').trim(); }
    else if (l.startsWith('✅')) current = 'str';
    else if (l.startsWith('⚠️')) current = 'weak';
    else if (l.startsWith('📺')) current = 'pl';
    else if (l.startsWith('📝')) current = 'syn';
    else {
      if (current === 'str' && l.startsWith('-')) strengths.push(l.slice(1).trim());
      if (current === 'weak' && l.startsWith('-')) weaknesses.push(l.slice(1).trim());
      if (current === 'pl' && l.startsWith('-')) {
        const m = /\[(.*?)]\((https?:\/\/.*?)\)/.exec(l);
        if (m) playlist.push({ title: m[1], url: m[2] });
      }
      if (current === 'syn') synth += l + '\n';
    }
  }
  return { level, strengths, weaknesses, playlist, synth };
}

function validateEmail(email) {
  // Simple email validation regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Synthese() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Fetch summary on mount
  useEffect(() => {
    fetch('https://design-chat-render-backend.onrender.com/summary')
      .then(r => r.json())
      .then(d => {
        if (d.summary) setData(parseSummary(d.summary));
        else setError(d.error || 'Synthèse indisponible');
        setLoading(false);
      })
      .catch(() => { setError('Erreur réseau'); setLoading(false); });
  }, []);

  // Send email
  const handleSend = async () => {
    if (!validateEmail(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }
    setError('');
    setSending(true);
    try {
      const res = await fetch('https://design-chat-render-backend.onrender.com/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const out = await res.json();
      if (out.success) setSent(true);
      else setError(out.error || 'Échec envoi');
    } catch {
      setError('Erreur réseau');
    }
    setSending(false);
  };

  if (loading) return <div className="font-sans min-h-screen flex items-center justify-center">Chargement…</div>;
  if (error && !sent) return <div className="font-sans min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!data) return null;

  const { level, strengths, weaknesses, playlist, synth } = data;

  return (
    <div className="font-sans min-h-screen bg-[#fffaf5] p-8 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-4xl font-extrabold text-[#F16E00]">Résultat de l'auto-évaluation sur le Design</h1>

        {/* Cartes niveau / forces / faiblesses / playlist */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-lg font-semibold">Niveau estimé</p>
            <p className="text-gray-700">{level || '—'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow flex gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-lg font-semibold">Points forts</p>
              <ul className="list-disc ml-5 space-y-1">
                {strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-lg font-semibold">Faiblesses</p>
              <ul className="list-disc ml-5 space-y-1">
                {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow flex gap-3">
          <span className="text-2xl">📺</span>
          <div>
            <p className="text-lg font-semibold mb-2">Playlist recommandée (10 vidéos)</p>
            <ul className="list-decimal ml-5 space-y-1 text-[#F16E00]">
              {playlist.map((p, i) => (
                <li key={i}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-lg font-semibold mb-2">Résumé personnalisé</p>
          <p className="whitespace-pre-wrap">{synth}</p>
        </div>

        {/* Rubrique e-mail */}
        {!sent ? (
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
            <label htmlFor="email-input" className="text-lg font-semibold">💌 Recevoir la synthèse par e-mail</label>
            <input
              id="email-input"
              type="email"
              className="border p-3 rounded"
              placeholder="Ton adresse e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-label="Adresse e-mail"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !validateEmail(email)}
              className="bg-[#F16E00] hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition disabled:opacity-50"
            >
              {sending ? 'Envoi…' : 'Envoyer la synthèse'}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
        ) : (
          <div className="text-green-600 font-semibold text-center">📧 Synthèse envoyée, vérifie ta boîte mail !</div>
        )}

        {/* Bouton retour */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-[#F16E00] hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition"
          >
            🔁 Recommencer
          </button>
        </div>
      </div>
    </div>
  );
}
