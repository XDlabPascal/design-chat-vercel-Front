// Parseur adapté au format reçu du backend (titres avec ### et émojis)
export default function parseSummary(raw) {
  if (!raw) return {};
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  let pointsForts = [], pointsFaibles = [], videos = [], resume = '';
  let current = '';

  for (const l of lines) {
    if (/^### .+Points forts/i.test(l)) current = 'pointsForts';
    else if (/^### .+Faiblesses/i.test(l)) current = 'pointsFaibles';
    else if (/^### .+Playlist/i.test(l)) current = 'videos';
    else if (/^### .+Synthèse/i.test(l)) current = 'resume';
    else {
      if (current === 'pointsForts' && l.startsWith('-')) pointsForts.push(l.slice(1).trim());
      else if (current === 'pointsFaibles' && l.startsWith('-')) pointsFaibles.push(l.slice(1).trim());
      else if (current === 'videos' && l.startsWith('-')) {
        const m = /\[(.*?)]\((https?:\/\/.*?)\)/.exec(l);
        if (m) videos.push({ title: m[1], url: m[2] });
      }
      else if (current === 'resume') resume += l + '\n';
    }
  }

  return {
    niveau: '', // Pas de niveau global dans ce format
    pointsForts,
    pointsFaibles,
    videos,
    resume: resume.trim()
  };
}
