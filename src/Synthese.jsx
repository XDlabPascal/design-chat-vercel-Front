import { useNavigate } from 'react-router-dom';

export default function Synthese() {
  const navigate = useNavigate();

  return (
    <div className="font-sans min-h-screen bg-[#fffaf5] p-8 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-[#F16E00]">📝 Synthèse UX</h1>

        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-lg font-semibold text-gray-700">Niveau estimé</p>
              <p className="text-gray-600">Intermédiaire</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📺</span>
            <div>
              <p className="text-lg font-semibold text-gray-700">Playlist recommandée</p>
              <p className="text-gray-600">“Améliorer l’UX avec des micro-interactions”</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-lg font-semibold text-gray-700">Résumé personnalisé</p>
              <p className="text-gray-600">
                Tu as montré une bonne compréhension des principes fondamentaux de l’UX. Tu sembles à l’aise avec les notions de recherche utilisateur, d’accessibilité et de hiérarchie de l'information. Tu pourrais approfondir la conception émotionnelle et les animations UX.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
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
