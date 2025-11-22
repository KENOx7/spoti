import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "az";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    home: "Home",
    charts: "Charts",
    likedSongs: "Liked Songs",
    collections: "Collections",
    recentlyAdded: "Recently Added",
    makePlaylist: "Create Playlist",
    account: "Account",
    settings: "Settings",
    askAI: "Ask AI",
    appName: "Endless Flow",
    
    // Auth & Profile
    welcomeBack: "Welcome Back",
    enterMusicWorld: "Immerse yourself in the Endless Flow",
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
    guestContinue: "Continue as Explorer",
    welcomeUser: "Welcome",
    guest: "Explorer",
    manageProfile: "Manage Profile",
    security: "Security",
    updatePassword: "Update Password",
    newPassword: "New Password",
    changePassword: "Change Password",
    logoutTitle: "Logout",
    logoutDescription: "End session?",
    logout: "Logout",
    
    // --- YENİ ƏLAVƏLƏR ---
    guestAccount: "Guest Account",
    guestMessage: "You are browsing as a guest. Login to save your library permanently.",
    loginOrSignup: "Login or Sign Up",
    endSession: "End Session",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    newReleases: "New Releases",
    artistUpdates: "Artist Updates",
    info: "Information",
    socialLoginMessage: "You are logged in with {provider}. You cannot change your password here.",

    // Player & Content
    trending: "Trending Flows",
    myPlaylists: "My Collections",
    playAll: "Play All",
    song: "song",
    songs: "songs",
    track: "track",
    tracks: "tracks",
    emptyPlaylist: "No playlists found. Start your flow!",
    createFirst: "Create Playlist",
    playlistDeleted: "Playlist deleted",
    addedToQueue: "Added to queue",
    addToPlaylist: "Add to Playlist",
    error: "An error occurred",
    
    // AI
    aiAssistant: "Endless AI",
    aiDescription: "Describe your vibe, let the music flow...",
    askButton: "Generate Flow",
    suggestionHappy: "😊 Sunny vibes",
    suggestionWorkout: "💪 High energy flow",
    suggestionChill: "🌙 Midnight chill",
    suggestionFocus: "🧘‍♀️ Deep focus",
    suggestionParty: "🎉 Party mode",
    suggestionRock: "🎸 Rock legends",
    searchingItunes: "Searching the stream...",
    noTracksFound: "No tracks found.",

    // Spotify Import
    spotifyImport: "Import Spotify",
    importing: "Importing...",
    success: "Success!",
    importSuccess: "playlists imported!",
    noSpotifyConnection: "No Spotify connection.",
    noPlaylistsFound: "No playlists found.",
    importError: "Import failed.",
    delete: "Delete",
    play: "Play"
  },
  az: {
    // Naviqasiya
    home: "Ana Səhifə",
    charts: "Hitlər",
    likedSongs: "Bəyənilənlər",
    collections: "Kolleksiyalar",
    recentlyAdded: "Son Əlavələr",
    makePlaylist: "Pleylist Yarat",
    account: "Hesab",
    settings: "Tənzimləmələr",
    askAI: "AI-dan Soruş",
    appName: "Endless Flow",
    
    // Giriş & Profil
    welcomeBack: "Xoş Gəldiniz",
    enterMusicWorld: "Endless Flow dünyasına dalın",
    continueWithGoogle: "Google ilə davam et",
    continueWithSpotify: "Spotify ilə davam et",
    orEmail: "VƏ YA E-POÇT İLƏ",
    email: "E-poçt",
    password: "Şifrə",
    confirmPassword: "Şifrəni təsdiqlə",
    signIn: "Daxil ol",
    signUp: "Qeydiyyat",
    createAccount: "Hesab yarat",
    noAccount: "Hesabınız yoxdur?",
    haveAccount: "Artıq hesabınız var?",
    guestContinue: "Kəşfiyyatçı kimi davam et",
    welcomeUser: "Xoş gəldin",
    guest: "Kəşfiyyatçı",
    manageProfile: "Profili İdarə Et",
    security: "Təhlükəsizlik",
    updatePassword: "Şifrəni Yenilə",
    newPassword: "Yeni Şifrə",
    changePassword: "Dəyişdir",
    logoutTitle: "Çıxış",
    logoutDescription: "Çıxmaq istədiyinizə əminsiniz?",
    logout: "Çıxış",

    // --- YENİ ƏLAVƏLƏR ---
    guestAccount: "Qonaq Hesabı",
    guestMessage: "Siz qonaq kimi daxil olmusunuz. Məlumatları daimi yadda saxlamaq üçün hesab yaradın.",
    loginOrSignup: "Giriş və ya Qeydiyyat",
    endSession: "Sessiyanı sonlandır",
    appearance: "Görünüş",
    darkMode: "Qaranlıq Rejim",
    language: "Dil",
    notifications: "Bildirişlər",
    newReleases: "Yeni Buraxılışlar",
    artistUpdates: "Sənətçi Yenilikləri",
    info: "Məlumat",
    socialLoginMessage: "Siz {provider} ilə daxil olmusunuz. Şifrəni buradan dəyişə bilməzsiniz.",
    
    // Player & Məzmun
    trending: "Trend Axını",
    myPlaylists: "Kolleksiyalarım",
    playAll: "Hamısını Oynat",
    song: "mahnı",
    songs: "mahnı",
    track: "trek",
    tracks: "trek",
    emptyPlaylist: "Pleylist yoxdur. İlk axınını yarat!",
    createFirst: "Pleylist Yarat",
    playlistDeleted: "Pleylist silindi",
    addedToQueue: "Növbəyə əlavə edildi",
    addToPlaylist: "Playlistə əlavə et",
    error: "Xəta baş verdi",
    
    // AI
    aiAssistant: "Endless AI",
    aiDescription: "Əhvalını yaz, musiqi axsın...",
    askButton: "Axını Yarat",
    suggestionHappy: "😊 Günəşli gün",
    suggestionWorkout: "💪 Məşq enerjisi",
    suggestionChill: "🌙 Gecə sakitsizliyi",
    suggestionFocus: "🧘‍♀️ Dərin fokus",
    suggestionParty: "🎉 Parti modu",
    suggestionRock: "🎸 Rok əfsanələri",
    searchingItunes: "Mahnılar axtarılır...",
    noTracksFound: "Mahnı tapılmadı.",

    // Spotify Import
    spotifyImport: "Spotify İdxal",
    importing: "Yüklənir...",
    success: "Uğurlu!",
    importSuccess: "pleylist yükləndi!",
    noSpotifyConnection: "Spotify bağlantısı yoxdur.",
    noPlaylistsFound: "Pleylist tapılmadı.",
    importError: "İdxal xətası.",
    delete: "Sil",
    play: "Oynat"
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
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}