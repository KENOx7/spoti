import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "az" | "tr";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    home: "Home",
    charts: "Charts",
    likedSongs: "Liked Songs",
    collections: "Collections",
    makePlaylist: "Make Playlist",
    account: "Account",
    settings: "Settings",
    askAI: "Ask AI",
    play: "Play",
    pause: "Pause",
    next: "Next",
    previous: "Previous",
    volume: "Volume",
    search: "Search",
    trending: "Trending Now",
    recentlyPlayed: "Recently Played",
  },
  az: {
    home: "Əsas",
    charts: "Qrafikalar",
    likedSongs: "Bəyənilən Mahnılar",
    collections: "Kolleksiyalar",
    makePlaylist: "Pleylist Yarat",
    account: "Hesab",
    settings: "Tənzimləmələr",
    askAI: "AI-dan soruş",
    play: "Oxut",
    pause: "Dayandır",
    next: "Növbəti",
    previous: "Əvvəlki",
    volume: "Səs",
    search: "Axtar",
    trending: "Populyar",
    recentlyPlayed: "Son Oxunmuşlar",
  },
  tr: {
    home: "Ana Sayfa",
    charts: "Listeler",
    likedSongs: "Beğenilen Şarkılar",
    collections: "Koleksiyonlar",
    makePlaylist: "Çalma Listesi Oluştur",
    account: "Hesap",
    settings: "Ayarlar",
    askAI: "AI'ya Sor",
    play: "Oynat",
    pause: "Duraklat",
    next: "İleri",
    previous: "Geri",
    volume: "Ses",
    search: "Ara",
    trending: "Trend Olanlar",
    recentlyPlayed: "Son Çalınanlar",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("az");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
