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
    
    // Home Page
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
    addSongsToPlaylist: "Add songs to this playlist using the menu on any track.",
    tracks: "tracks",
    track: "track",
    
    // Liked Songs
    noLikedSongs: "You haven't liked any songs yet",
    likedSongsDescription: "Songs you like will appear here. Click the heart icon on any track to add it.",
    
    // Actions
    addToPlaylist: "Add to Playlist",
    removeFromPlaylist: "Remove from Playlist",
    like: "Like",
    unlike: "Unlike",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    
    // Messages
    playlistCreated: "Playlist created successfully",
    playlistDeleted: "Playlist deleted",
    trackAdded: "Track added to playlist",
    trackRemoved: "Track removed from playlist",
    trackAlreadyInPlaylist: "Track is already in this playlist",
    error: "An error occurred",
    tryAgain: "Please try again",
    
    // AI
    askAI: "Ask AI",
    askAIDescription: "Get music recommendations powered by AI",
    askAIPlaceholder: "Ask for music recommendations...",
    aiWelcomeMessage: "Hi! I can help you discover new music. What genre would you like to listen to?",
    
    // Settings
    appearance: "Appearance",
    darkMode: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    newReleases: "New Releases",
    artistUpdates: "Artist Updates",
    
    // Empty States
    noPlaylists: "No playlists yet",
    noPlaylistsDescription: "Create your first playlist to organize your favorite tracks.",
    noTracks: "No tracks found",
    
    // Recently Added
    recentlyAdded: "Recently Added",
    recentlyAddedDescription: "Tracks you've recently liked or added to playlists",

    // Account Page (BU HİSSƏNİ ƏLAVƏ EDİN)
    accountSubtitle: "Manage your account details and settings.",
    profileInfo: "Profile Information",
    changePhoto: "Change Photo",
    username: "Username",
    email: "Email",
    saveChanges: "Save Changes",
    security: "Security",
    oldPassword: "Old Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    changePassword: "Change Password",
    logoutTitle: "Log Out",
    logoutButton: "Log Out",
    
    // Alerts (Bildirişlər üçün)
    enterOldPassword: "Please enter your old password.",
    shortPassword: "New password must be at least 6 characters.",
    passwordMismatch: "New passwords do not match.",
    passwordChanged: "Password changed successfully.",
    profileSaved: "Profile information saved.",
    loggedOut: "Logged out successfully."
  },
  az: {
    // Navigation
    home: "Əsas Səhifə",
    charts: "Hit Parad",
    likedSongs: "Bəyəndiklərim",
    collections: "Kolleksiyalar",
    recentlyAdded: "Yeni Əlavə Edilənlər",
    makePlaylist: "Playlist Yarat",
    account: "Hesabım",
    settings: "Tənzimləmələr",
    askAI: "AI-dan Soruş",
    appName: "Musiqi",
    
    // Player
    play: "Oxut",
    pause: "Dayandır",
    next: "Növbəti",
    previous: "Əvvəlki",
    volume: "Səs",
    shuffle: "Qarışdır",
    repeat: "Təkrarla",
    repeatAll: "Hamısını Təkrarla",
    repeatOne: "Birini Təkrarla",
    repeatOff: "Təkrarla Yox",
    
    // Common
    search: "Axtar",
    songs: "mahnı",
    song: "mahnı",
    playAll: "Hamısını Oxut",
    
    // Home Page
    trending: "Populyar",
    recentlyPlayed: "Son Oxunmuşlar",
    myPlaylists: "Playlistlərim",
    recommended: "Sizin Üçün Tövsiyə Olunanlar",
    discover: "Kəşf Et",
    
    // Playlists
    createPlaylist: "Playlist Yarat",
    playlistName: "Playlist Adı",
    playlistDescription: "Təsvir (könüllü)",
    emptyPlaylist: "Bu playlist boşdur",
    addSongsToPlaylist: "Hər hansı mahnıdakı menyudan istifadə edərək bu playlistə mahnı əlavə edin.",
    tracks: "mahnı",
    track: "mahnı",
    
    // Liked Songs
    noLikedSongs: "Hələ bəyəndiyiniz mahnı yoxdur",
    likedSongsDescription: "Bəyəndiyiniz mahnılar burada görünəcək. Hər hansı mahnıdakı ürək ikonuna klikləyin.",
    
    // Actions
    addToPlaylist: "Playlistə Əlavə Et",
    removeFromPlaylist: "Playlistdən Çıxar",
    like: "Bəyən",
    unlike: "Bəyənməkdən Çıx",
    delete: "Sil",
    save: "Saxla",
    cancel: "Ləğv Et",
    
    // Messages
    playlistCreated: "Playlist uğurla yaradıldı",
    playlistDeleted: "Playlist silindi",
    trackAdded: "Mahnı playlistə əlavə edildi",
    trackRemoved: "Mahnı playlistdən çıxarıldı",
    trackAlreadyInPlaylist: "Mahnı artıq bu playlistdədir",
    error: "Xəta baş verdi",
    tryAgain: "Zəhmət olmasa yenidən cəhd edin",
    
    // AI
    askAI: "AI-dan Soruş",
    askAIDescription: "AI ilə gücləndirilmiş musiqi tövsiyələri alın",
    askAIPlaceholder: "Musiqi tövsiyələri üçün soruşun...",
    aiWelcomeMessage: "Salam! Yeni musiqi kəşf etməkdə kömək edə bilərəm. Nə tərz musiqi dinləmək istəyirsiniz?",
    
    // Settings
    appearance: "Görünüş",
    darkMode: "Qaranlıq Mod",
    language: "Dil",
    notifications: "Bildirişlər",
    newReleases: "Yeni Mahnılar",
    artistUpdates: "Sənətçi Yeniləmələri",
    
    // Empty States
    noPlaylists: "Hələ playlist yoxdur",
    noPlaylistsDescription: "Sevimli mahnılarınızı təşkil etmək üçün ilk playlistinizi yaradın.",
    noTracks: "Mahnı tapılmadı",
    
    // Recently Added
    recentlyAdded: "Yeni Əlavə Edilənlər",
    recentlyAddedDescription: "Son bəyəndiyiniz və ya playlistə əlavə etdiyiniz mahnılar",

    accountSubtitle: "Hesab məlumatlarınızı və parametrlərinizi idarə edin.",
    profileInfo: "Profil Məlumatları",
    changePhoto: "Şəkli Dəyiş",
    username: "İstifadəçi Adı",
    email: "E-poçt",
    saveChanges: "Dəyişiklikləri Yadda Saxla",
    security: "Təhlükəsizlik",
    oldPassword: "Köhnə Şifrə",
    newPassword: "Yeni Şifrə",
    confirmPassword: "Yeni Şifrə (Təkrar)",
    changePassword: "Şifrəni Dəyiş",
    logoutTitle: "Hesabdan Çıxış",
    logoutButton: "Çıxış Et",

    // Alerts (Bildirişlər üçün)
    enterOldPassword: "Köhnə şifrəni daxil edin.",
    shortPassword: "Yeni şifrə ən az 6 simvol olmalıdır.",
    passwordMismatch: "Yeni şifrə və təkrar uyğun deyil.",
    passwordChanged: "Şifrə dəyişdirildi.",
    profileSaved: "Profil məlumatları yadda saxlanıldı.",
    loggedOut: "Hesabdan çıxış edildi."
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get initial language from localStorage or default to Azerbaijani
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

  // Save language preference
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
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
