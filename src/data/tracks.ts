import { Track } from "@/types";

export const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop";

// 🎵 İşlək audio linklər - müxtəlif test mahnıları
export const AUDIO_SAMPLES = [
  "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  "https://filesamples.com/samples/audio/mp3/sample1.mp3",
  "https://filesamples.com/samples/audio/mp3/sample2.mp3",
  "https://filesamples.com/samples/audio/mp3/sample3.mp3",
];

export const DEFAULT_AUDIO = AUDIO_SAMPLES[0];

export const mockTracks: Track[] = [
  {
    id: "1",
    title: "Midnight Dreams",
    artist: "Luna Echo",
    album: "Echoes of Tomorrow",
    duration: 245,
    coverUrl:
      "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[0],
    liked: true,
  },
  {
    id: "2",
    title: "Electric Pulse",
    artist: "Neon Waves",
    album: "Digital Horizon",
    duration: 198,
    coverUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[1],
    liked: false,
  },
  {
    id: "3",
    title: "Ocean Breeze",
    artist: "Coastal Harmony",
    album: "Seaside Sessions",
    duration: 312,
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[2],
    liked: true,
  },
  {
    id: "4",
    title: "Urban Symphony",
    artist: "City Sounds",
    album: "Metropolitan Vibes",
    duration: 267,
    coverUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[3],
    liked: false,
  },
  {
    id: "5",
    title: "Stellar Journey",
    artist: "Cosmic Travelers",
    album: "Beyond the Stars",
    duration: 289,
    coverUrl:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[0],
    liked: true,
  },
  {
    id: "6",
    title: "Səhər Yeli",
    artist: "Ritmin Nəfəsi",
    album: "Yeni Gün",
    duration: 215,
    coverUrl:
      "https://images.unsplash.com/photo-1487180144351-b847247148b1?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[1],
    liked: false,
  },
  {
    id: "7",
    title: "Xəzər Axşamı",
    artist: "Dalğalar",
    album: "Sahil Hekayələri",
    duration: 277,
    coverUrl:
      "https://images.unsplash.com/photo-1506478460-716b08004b35?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[2],
    liked: true,
  },
  {
    id: "8",
    title: "Ulduzların Altında",
    artist: "Kosmik Səyahət",
    album: "Sonsuzluq",
    duration: 305,
    coverUrl:
      "https://images.unsplash.com/photo-1444703686981-a39d79a714da?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[3],
    liked: false,
  },
];

export const chartTracks: Track[] = [
  {
    id: "c1",
    title: "Top of the World",
    artist: "Summit Seekers",
    album: "Peak Performance",
    duration: 234,
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[0],
    liked: false,
  },
  {
    id: "c2",
    title: "Viral Beat",
    artist: "Trending Now",
    album: "Chart Toppers",
    duration: 201,
    coverUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    audioUrl: AUDIO_SAMPLES[1],
    liked: true,
  },
];

// 🧹 SYNC funksiya: AI-dan gələn trekləri təmizləyir və oxunaqlı edir
export function cleanAITracks(aiTracks: Track[] = []): Track[] {
  return aiTracks.map((track, i) => {
    // Hər mahnıya müxtəlif audio təyin et (variantlıq üçün)
    const audioIndex = i % AUDIO_SAMPLES.length;
    
    return {
      ...track,
      id: track.id || `ai-${Date.now()}-${i}`,
      title: track.title || "Naməlum Mahnı",
      artist: track.artist || "Naməlum İfaçı",
      album: track.album || "AI Playlist",
      duration: track.duration || 200,
      coverUrl:
        track.coverUrl?.startsWith("http") && !track.coverUrl.includes("spotify")
          ? track.coverUrl
          : DEFAULT_COVER,
      // 🎵 İşlək audio - hər mahnıya müxtəlif sample
      audioUrl: AUDIO_SAMPLES[audioIndex],
      liked: false,
    };
  });
}

// 🔁 AI treklərini "mockTracks" siyahısına birləşdirir
export function mergeAITracks(aiTracks: Track[] = []): Track[] {
  const cleaned = cleanAITracks(aiTracks);

  const existingIds = new Set(mockTracks.map((t) => t.id));
  const merged = [
    ...mockTracks,
    ...cleaned.filter((t) => !existingIds.has(t.id)),
  ];

  return merged;
}