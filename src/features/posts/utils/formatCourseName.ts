// Formatea de manera uniforme los nombres de cursos a Title Case legible
export function formatCourseName(rawName: string): string {
  if (!rawName) return "";
  if (rawName.includes("/")) {
    return rawName
      .split("/")
      .map((part) => formatCourseName(part.trim()))
      .join(" / ");
  }
  const romanNumerals = new Set([
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
  ]);
  const lowercaseWords = new Set([
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "y",
    "e",
    "en",
    "para",
    "a",
    "por",
  ]);

  return rawName
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const cleanUpper = word
        .toUpperCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      if (romanNumerals.has(cleanUpper)) return word.toUpperCase();
      const lower = word.toLowerCase();
      if (index > 0 && lowercaseWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

