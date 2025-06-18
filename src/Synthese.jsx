import { useEffect, useState } from 'react';

export default function Synthese() {
  const [summary, setSummary] = useState('');
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);

  // récupère la synthèse
  useEffect(()=>{
    fetch('https://design-chat-render-backend.onrender.com/summary')
      .then(r=>r.json())
      .then(d=>setSummary(d.summary||'Synthèse indisponible…'))
      .catch(()=>setSummary('Erreur de récupération.'));
  },[]);

  const sendEmail = async () => {
    const res = await fetch('https://design-chat-render-backend.onrender.com/send-email',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email })
    });
    const out = await res.json();
    if(out.success) setSent(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#F16E00]">📝 Synthèse</h2>
      <pre className="whitespace-pre-wrap bg-white p-4 rounded shadow">{summary}</pre>

      {!sent ? (
        <div className="space-y-4">
          <input
            type="email"
            className="border p-2 rounded w-full"
            placeholder="Ton e-mail pour recevoir la synthèse"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />
          <button
            onClick={sendEmail}
            className="bg-[#F16E00] text-white px-4 py-2 rounded hover:opacity-90">
            Envoyer par e-mail
          </button>
        </div>
      ) : (
        <p className="text-green-600 font-semibold">Synthèse envoyée 🎉</p>
      )}
    </div>
  );
}
