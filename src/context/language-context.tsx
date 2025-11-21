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
    appName: "Music",
    
    // Auth & Profile
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
    manageProfile: "Manage your profile information",
    security: "Security",
    updatePassword: "Update your password",
    newPassword: "New Password",
    changePassword: "Change Password",
    logoutTitle: "Logout",
    logoutDescription: "End your current session",
    logout: "Logout",
    socialLoginInfo: "Info",
    socialLoginMessage: "Since you logged in via a social network ({provider}), you cannot change your password here.",
    guestAccount: "Guest Account",
    guestMessage: "You are currently in Guest mode. Please log in to save your playlists and access all features.",
    loginOrSignup: "Login / Sign Up",
    endSession: "End Session",
    profileSaved: "Profile information saved.",
    socialAccount: "Social Account",
    emailAccount: "Email Account",
    
    // Player & Common
    play: "Play",
    pause: "Pause",
    next: "Next",
    previous: "Previous",
    search: "Search",
    trending: "Trending Now",
    myPlaylists: "My Playlists",
    playAll: "Play All", // ƏLAVƏ EDİLDİ
    songs: "songs",
    song: "song",
    track: "track",
    tracks: "tracks",
    
    // Playlists & Collections
    createPlaylist: "Create Playlist",
    playlistName: "Playlist Name",
    playlistDescription: "Description (optional)", // ƏLAVƏ EDİLDİ
    emptyPlaylist: "This playlist is empty", // ƏLAVƏ EDİLDİ
    addSongsToPlaylist: "Add songs to this playlist using the menu on any track",
    playlistDeleted: "Playlist deleted",
    tryAgain: "Please try again",
    error: "Error",
    
    // Settings
    language: "Language",
    appearance: "Appearance",
    darkMode: "Dark Mode", // ƏLAVƏ EDİLDİ
    notifications: "Notifications",
    newReleases: "New Releases",
    artistUpdates: "Artist Updates",
    uploading: "Uploading...",
    avatarUpdated: "Profile picture updated successfully!",
    uploadError: "Error uploading image.",
    changeAvatar: "Change Photo",

    // Ask AI
    askAIDescription: "Get personalized music recommendations powered by AI", // ƏLAVƏ EDİLDİ
    aiWelcomeMessage: "Hi! I'm your AI music assistant. Tell me what you're in the mood for, and I'll recommend some songs.", // ƏLAVƏ EDİLDİ
    askAIPlaceholder: "E.g., 'Sad songs for a rainy day' or 'Upbeat pop for workout'"
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

    // Giriş & Profil
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
    manageProfile: "Profil məlumatlarınızı idarə edin",
    security: "Təhlükəsizlik",
    updatePassword: "Şifrənizi yeniləyin",
    newPassword: "Yeni Şifrə",
    changePassword: "Şifrəni Dəyiş",
    logoutTitle: "Çıxış",
    logoutDescription: "Cari sessiyanı sonlandırın",
    logout: "Çıxış et",
    socialLoginInfo: "Məlumat",
    socialLoginMessage: "Siz sosial şəbəkə ({provider}) ilə daxil olduğunuz üçün şifrəni buradan dəyişə bilməzsiniz.",
    guestAccount: "Qonaq Hesabı",
    guestMessage: "Siz hazırda Qonaq rejimindəsiniz. Pleylistlərinizi yadda saxlamaq və bütün funksiyalardan istifadə etmək üçün zəhmət olmasa daxil olun.",
    loginOrSignup: "Daxil ol / Qeydiyyat",
    endSession: "Sessiyanı Bitir",
    profileSaved: "Profil məlumatları yadda saxlanıldı.",
    socialAccount: "Sosial Hesab",
    emailAccount: "Email Hesabı",

    // Pleyer & Ümumi
    play: "Oynat",
    pause: "Durdur",
    next: "Növbəti",
    previous: "Əvvəlki",
    search: "Axtarış",
    trending: "Trendlər",
    myPlaylists: "Pleylistlərim",
    playAll: "Hamısını Oynat", // ƏLAVƏ EDİLDİ
    songs: "mahnı",
    song: "mahnı",
    track: "treklər",
    tracks: "trek",

    // Pleylistlər & Kolleksiyalar
    createPlaylist: "Pleylist Yarat",
    playlistName: "Pleylist Adı",
    playlistDescription: "Açıqlama (könüllü)", // ƏLAVƏ EDİLDİ
    emptyPlaylist: "Bu pleylist boşdur", // ƏLAVƏ EDİLDİ
    addSongsToPlaylist: "Mahnı menyusundan istifadə edərək bura mahnı əlavə edin",
    playlistDeleted: "Pleylist silindi",
    tryAgain: "Yenidən cəhd edin",
    error: "Xəta",

    // Tənzimləmələr
    language: "Dil",
    appearance: "Görünüş",
    darkMode: "Qaranlıq Rejim", // ƏLAVƏ EDİLDİ
    notifications: "Bildirişlər",
    newReleases: "Yeni Çıxışlar",
    artistUpdates: "Sənətçi Yenilikləri",
    uploading: "Yüklənir...",
    avatarUpdated: "Profil şəkli yeniləndi!",
    uploadError: "Şəkil yüklənərkən xəta baş verdi.",
    changeAvatar: "Şəkli Dəyiş",

    // Ask AI
    askAIDescription: "AI tərəfindən dəstəklənən fərdi musiqi tövsiyələri alın", // ƏLAVƏ EDİLDİ
    aiWelcomeMessage: "Salam! Mən sizin AI musiqi köməkçinizəm. Nə dinləmək istədiyinizi deyin, sizə mahnılar təklif edim.", // ƏLAVƏ EDİLDİ
    askAIPlaceholder: "Məsələn: 'Yağışlı hava üçün kədərli mahnılar' və ya 'İdman üçün ritmik pop'"
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