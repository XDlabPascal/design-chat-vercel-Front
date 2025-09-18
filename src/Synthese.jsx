import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultScreen from './ResultScreen';

// Parse la synthèse brute reçue du backend
function parseSummary(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  let niveau = '', pointsForts = [], pointsFaibles = [], videos = [], resume = '', current = '';
  for (const l of lines) {
    if (l.startsWith('🎯')) { current = 'niveau'; niveau = l.replace(/.*:/, '').trim(); }
    else if (l.startsWith('✅')) current = 'pointsForts';
    else if (l.startsWith('⚠️')) current = 'pointsFaibles';
    else if (l.startsWith('📺')) current = 'videos';
    else if (l.startsWith('📝')) current = 'resume';
    else {
      if (current === 'pointsForts' && l.startsWith('-')) pointsForts.push(l.slice(1).trim());
      if (current === 'pointsFaibles' && l.startsWith('-')) pointsFaibles.push(l.slice(1).trim());
      if (current === 'videos' && l.startsWith('-')) {
        const m = /\[(.*?)]\((https?:\/\/.*?)\)/.exec(l);
        if (m) videos.push({ title: m[1], url: m[2] });
      }
      if (current === 'resume') resume += l + '\n';
    }
  }
  return { niveau, pointsForts, pointsFaibles, videos, resume };
}

export default function Synthese() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    let intervalId;
    let tries = 0;

    const fetchSummary = async () => {
      try {
        const res = await fetch('https://design-chat-render-backend.onrender.com/summary');
        const json = await res.json();
        console.log('Résumé brut reçu du backend :', json.summary);
        if (json.summary) {
          setSummaryData(parseSummary(json.summary));
          clearInterval(intervalId);
          setLoading(false);
        } else if (json.error && tries > 10) {
          setError('Synthèse indisponible après plusieurs tentatives.');
          clearInterval(intervalId);
          setLoading(false);
        }
      } catch (err) {
        if (tries > 10) {
          setError('Erreur réseau persistante.');
          clearInterval(intervalId);
          setLoading(false);
        }
      }
      tries++;
    };

    intervalId = setInterval(fetchSummary, 2000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="font-sans min-h-screen flex items-center justify-center">Chargement…</div>;
  if (error) return <div className="font-sans min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!summaryData) return null;

  return (
    <div className="font-sans min-h-screen bg-[#fffaf5] p-8 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-[#F16E00] mb-4">Résultat de l'auto-évaluation sur le Design</h1>
        <ResultScreen summaryData={summaryData} />
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
