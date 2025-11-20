import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "az";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation & Common
    home: "Home",
    charts: "Charts",
    likedSongs: "Liked Songs",
    collections: "Collections",
    recentlyAdded: "Recently Added",
    makePlaylist: "Create Playlist",
    account: "Account",
    settings: "Settings",
    askAI: "Ask AI",
    appName: "Music",
    
    // Auth & Login
    welcomeBack: "Welcome Back",
    enterMusicWorld: "Enter the world of music",
    continueWithGoogle: "Continue with Google",
    continueWithSpotify: "Continue with Spotify",
    orEmail: "OR CONTINUE WITH EMAIL",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    createAccount: "Create Account",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    guestContinue: "Continue as Guest",
    welcomeUser: "Welcome",
    guest: "Guest",
    
    // Guest Account Specific (YENİ)
    guestAccount: "Guest Account",
    guestMessage: "You are currently in Guest mode. Please log in to save your playlists and access all features.",
    loginOrSignup: "Login / Sign Up",
    endSession: "End Session",
    
    // Player
    play: "Play",
    pause: "Pause",
    next: "Next",
    previous: "Previous",
    volume: "Volume",
    shuffle: "Shuffle",
    repeat: "Repeat",
    repeatAll: "Repeat All",
    repeatOne: "Repeat One",
    repeatOff: "Repeat Off",
    
    // Common
    search: "Search",
    songs: "songs",
    song: "song",
    playAll: "Play All",
    trending: "Trending Now",
    recentlyPlayed: "Recently Played",
    myPlaylists: "My Playlists",
    recommended: "Recommended for You",
    discover: "Discover",
    
    // Playlists
    createPlaylist: "Create Playlist",
    playlistName: "Playlist Name",
    playlistDescription: "Description (optional)",
    emptyPlaylist: "This playlist is empty",
    addSongsToPlaylist: "Add songs to this playlist using the menu on any track",
    
    // Account & Settings
    profileSaved: "Profile information saved.",
    oldPassword: "Old Password",
    newPassword: "New Password",
    changePassword: "Change Password",
    enterOldPassword: "Please enter your old password.",
    logoutTitle: "Logout",
    logout: "Logout",
    language: "Language",
    appearance: "Appearance",
    notifications: "Notifications",
    newReleases: "New Releases",
    artistUpdates: "Artist Updates"
  },
  az: {
    // Naviqasiya
    home: "Ana Səhifə",
    charts: "Hitlər",
    likedSongs: "Bəyənilənlər",
    collections: "Kolleksiyalar",
    recentlyAdded: "Yeni Əlavələr",
    makePlaylist: "Pleylist Yarat",
    account: "Hesab",
    settings: "Tənzimləmələr",
    askAI: "AI-dan Soruş",
    appName: "Musiqi",

    // Giriş & Qeydiyyat
    welcomeBack: "Xoş Gəlmisiniz",
    enterMusicWorld: "Devora musiqi dünyasına daxil olun",
    continueWithGoogle: "Google ilə davam et",
    continueWithSpotify: "Spotify ilə davam et",
    orEmail: "VƏ YA EMAİL İLƏ",
    email: "Email",
    password: "Şifrə",
    confirmPassword: "Şifrəni Təsdiqlə",
    signIn: "Daxil ol",
    signUp: "Qeydiyyat",
    createAccount: "Hesab Yarat",
    noAccount: "Hesabınız yoxdur?",
    haveAccount: "Artıq hesabınız var?",
    guestContinue: "Qonaq kimi davam et",
    welcomeUser: "Xoş gördük",
    guest: "Qonaq",

    // Qonaq Hesabı (YENİ)
    guestAccount: "Qonaq Hesabı",
    guestMessage: "Siz hazırda Qonaq rejimindəsiniz. Pleylistlərinizi yadda saxlamaq və bütün funksiyalardan istifadə etmək üçün zəhmət olmasa daxil olun.",
    loginOrSignup: "Daxil ol / Qeydiyyat",
    endSession: "Sessiyanı Bitir",

    // Pleyer
    play: "Oynat",
    pause: "Durdur",
    next: "Növbəti",
    previous: "Əvvəlki",
    volume: "Səs",
    shuffle: "Qarışıq",
    repeat: "Təkrar",
    repeatAll: "Hamısını təkrarla",
    repeatOne: "Birini təkrarla",
    repeatOff: "Təkrarı söndür",

    // Ümumi
    search: "Axtarış",
    songs: "mahnı",
    song: "mahnı",
    playAll: "Hamısını Oynat",
    trending: "Trendlər",
    recentlyPlayed: "Son Oynadılanlar",
    myPlaylists: "Pleylistlərim",
    recommended: "Sizin üçün",
    discover: "Kəşf et",

    // Pleylistlər
    createPlaylist: "Pleylist Yarat",
    playlistName: "Pleylist Adı",
    playlistDescription: "Açıqlama (könüllü)",
    emptyPlaylist: "Bu pleylist boşdur",
    addSongsToPlaylist: "Mahnı menyusundan istifadə edərək bura mahnı əlavə edin",

    // Hesab & Tənzimləmələr
    profileSaved: "Profil məlumatları yadda saxlanıldı.",
    oldPassword: "Köhnə Şifrə",
    newPassword: "Yeni Şifrə",
    changePassword: "Şifrəni Dəyiş",
    enterOldPassword: "Zəhmət olmasa köhnə şifrəni daxil edin.",
    logoutTitle: "Çıxış",
    logout: "Çıxış et",
    language: "Dil",
    appearance: "Görünüş",
    notifications: "Bildirişlər",
    newReleases: "Yeni Çıxışlar",
    artistUpdates: "Sənətçi Yenilikləri"
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem("appLanguage");
    return (saved === "en" || saved === "az") ? saved : "az";
  } catch {
    return "az";
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    try {
      localStorage.setItem("appLanguage", language);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}