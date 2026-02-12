export interface Language {
  code: string; // ISO 639-1 (Palabra source code)
  targetCode: string; // Palabra target code
  name: string;
  englishName: string;
}

export const languages: Language[] = [
  { code: "en", targetCode: "en-us", name: "English", englishName: "English" },
  { code: "es", targetCode: "es", name: "Español", englishName: "Spanish" },
  { code: "fr", targetCode: "fr", name: "Français", englishName: "French" },
  { code: "de", targetCode: "de", name: "Deutsch", englishName: "German" },
  { code: "it", targetCode: "it", name: "Italiano", englishName: "Italian" },
  { code: "pt", targetCode: "pt-br", name: "Português", englishName: "Portuguese" },
  { code: "zh", targetCode: "zh", name: "中文", englishName: "Chinese" },
  { code: "ja", targetCode: "ja", name: "日本語", englishName: "Japanese" },
  { code: "ko", targetCode: "ko", name: "한국어", englishName: "Korean" },
  { code: "ar", targetCode: "ar-sa", name: "العربية", englishName: "Arabic" },
  { code: "ru", targetCode: "ru", name: "Русский", englishName: "Russian" },
  { code: "tr", targetCode: "tr", name: "Türkçe", englishName: "Turkish" },
  { code: "pl", targetCode: "pl", name: "Polski", englishName: "Polish" },
  { code: "nl", targetCode: "nl", name: "Nederlands", englishName: "Dutch" },
];

export function getLanguage(code: string): Language | undefined {
  return languages.find((l) => l.code === code);
}
