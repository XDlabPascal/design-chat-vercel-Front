// Fonction utilitaire pour parser la synthèse texte IA en un objet structuré
export function parseSynthese(synthese) {
  // Extraction du niveau global
  const niveau =
    (synthese.match(/🎯 Niveau (?:estimé|global)\s*:\s*([^\n]*)/) || [])[1]?.trim() ||
    "";

  // Extraction des points forts
  const pointsFortsSection =
    (synthese.match(/✅ Points forts\s*:(.*?)(?:⚠️|📺|\n📝|$)/s) || [])[1] || "";
  const pointsForts = pointsFortsSection
    .split("\n")
    .map((l) => l.replace(/^- /, "").trim())
    .filter((l) => l.length > 0);

  // Extraction des points faibles
  const pointsFaiblesSection =
    (synthese.match(/⚠️ (?:Faiblesses|Points à améliorer)\s*:(.*?)(?:📺|\n📝|$)/s) || [])[1] ||
    "";
  const pointsFaibles = pointsFaiblesSection
    .split("\n")
    .map((l) => l.replace(/^- /, "").trim())
    .filter((l) => l.length > 0);

  // Extraction des liens vidéos
  const videoMatches = [...synthese.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g)];
  const videos = videoMatches.map((m) => m[2]);

  // Extraction du texte de synthèse
  const syntheseText = (synthese.match(/📝 Synthèse\s*:(.*)$/s) || [])[1]?.trim() || "";

  return {
    niveau,
    pointsForts,
    pointsFaibles,
    videos,
    synthese: syntheseText,
    raw: synthese, // Pour debug si besoin
  };
}
