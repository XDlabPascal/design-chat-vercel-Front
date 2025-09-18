export default function parseSummary(raw) {
  if (!raw) return {};
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  let pointsForts = [], pointsFaibles = [], videos = [], resume = '';
  let current = '';

  for (const l of lines) {
    if (/^###\s*✅?\s*Points forts/i.test(l)) current = 'pointsForts';
    else if (/^###\s*⚠️?\s*Faiblesses/i.test(l)) current = 'pointsFaibles';
    else if (/^###\s*📺?\s*Playlist/i.test(l)) current = 'videos';
    else if (/^###\s*📝?\s*Synthèse/i.test(l)) current = 'resume';
    else {
      if (current === 'pointsForts' && l.match(/^- /)) pointsForts.push(l.replace(/^- /, '').trim());
      else if (current === 'pointsFaibles' && l.match(/^- /)) pointsFaibles.push(l.replace(/^- /, '').trim());
      else if (current === 'videos' && l.match(/^- /)) {
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
