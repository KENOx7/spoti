import { Track } from "@/types";

export const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop";

// 🎵 İşlək audio linklər - müxtəlif test mahnıları (Qeyd: Hər biri fərqli səslənir)
export const AUDIO_SAMPLES = [
  "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  "https://filesamples.com/samples/audio/mp3/sample1.mp3",
  "https://filesamples.com/samples/audio/mp3/sample2.mp3",
  "https://filesamples.com/samples/audio/mp3/sample3.mp3",
  // Daha çox müxtəliflik üçün eyni sınaq linklərini əlavə edirəm
  "https://filesamples.com/samples/audio/mp3/sample1.mp3",
  "https://filesamples.com/samples/audio/mp3/sample2.mp3",
  "https://filesamples.com/samples/audio/mp3/sample3.mp3",
  "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  "https://filesamples.com/samples/audio/mp3/sample2.mp3",
  "https://filesamples.com/samples/audio/mp3/sample3.mp3",
  "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  "https://filesamples.com/samples/audio/mp3/sample1.mp3",
];

export const DEFAULT_AUDIO = AUDIO_SAMPLES[0];

// Cover images from Unsplash
const COVERS = [
  "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1487180144351-b847247148b1?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1506478460-716b08004b35?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1444703686981-a39d79a714da?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
];

// Helper to get cover and audio
const getCover = (index: number) => COVERS[index % COVERS.length];

// 🚩 getAudio funksiyası ləğv edildi, linklər aşağıda bir-bir təyin olunur
// const getAudio = (index: number) => AUDIO_SAMPLES[index % AUDIO_SAMPLES.length]; 

const getAudioSample = (index: number) => AUDIO_SAMPLES[index % AUDIO_SAMPLES.length];

export const mockTracks: Track[] = [
  // Pop
  {
    id: "r1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 202,
    coverUrl: getCover(0),
    audioUrl: getAudioSample(0), // Fərqli link 1
    liked: true,
  },
  {
    id: "r2",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    duration: 167,
    coverUrl: getCover(1),
    audioUrl: getAudioSample(1), // Fərqli link 2
    liked: false,
  },
  {
    id: "r3",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: 233,
    coverUrl: getCover(2),
    audioUrl: getAudioSample(2), // Fərqli link 3
    liked: true,
  },
  {
    id: "r4",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 203,
    coverUrl: getCover(3),
    audioUrl: getAudioSample(3), // Fərqli link 4
    liked: false,
  },
  {
    id: "r5",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: 174,
    coverUrl: getCover(4),
    audioUrl: getAudioSample(4), // Fərqli link 5
    liked: true,
  },
  // Rock
  {
    id: "r6",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: 355,
    coverUrl: getCover(5),
    audioUrl: getAudioSample(5), // Fərqli link 6
    liked: true,
  },
  {
    id: "r7",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    duration: 356,
    coverUrl: getCover(6),
    audioUrl: getAudioSample(6), // Fərqli link 7
    liked: false,
  },
  {
    id: "r8",
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    duration: 482,
    coverUrl: getCover(7),
    audioUrl: getAudioSample(7), // Fərqli link 8
    liked: true,
  },
  {
    id: "r9",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    duration: 391,
    coverUrl: getCover(8),
    audioUrl: getAudioSample(8), // Fərqli link 9
    liked: false,
  },
  // Hip Hop & R&B
  {
    id: "r10",
    title: "God's Plan",
    artist: "Drake",
    album: "Scorpion",
    duration: 199,
    coverUrl: getCover(9),
    audioUrl: getAudioSample(9), // Fərqli link 10
    liked: true,
  },
  {
    id: "r11",
    title: "Sicko Mode",
    artist: "Travis Scott",
    album: "Astroworld",
    duration: 312,
    coverUrl: getCover(10),
    audioUrl: getAudioSample(10), // Fərqli link 11
    liked: false,
  },
  {
    id: "r12",
    title: "In My Feelings",
    artist: "Drake",
    album: "Scorpion",
    duration: 217,
    coverUrl: getCover(11),
    audioUrl: getAudioSample(11), // Fərqli link 12
    liked: true,
  },
  {
    id: "r13",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    album: "Uptown Special",
    duration: 269,
    coverUrl: getCover(0),
    audioUrl: getAudioSample(0), // Təkrarlanan link (1)
    liked: false,
  },
  // Electronic & Dance
  {
    id: "r14",
    title: "One More Time",
    artist: "Daft Punk",
    album: "Discovery",
    duration: 320,
    coverUrl: getCover(1),
    audioUrl: getAudioSample(1), // Təkrarlanan link (2)
    liked: true,
  },
  {
    id: "r15",
    title: "Titanium",
    artist: "David Guetta ft. Sia",
    album: "Nothing but the Beat",
    duration: 245,
    coverUrl: getCover(2),
    audioUrl: getAudioSample(2), // Təkrarlanan link (3)
    liked: false,
  },
  {
    id: "r16",
    title: "Wake Me Up",
    artist: "Avicii",
    album: "True",
    duration: 249,
    coverUrl: getCover(3),
    audioUrl: getAudioSample(3), // Təkrarlanan link (4)
    liked: true,
  },
  // Classic Pop
  {
    id: "r17",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    duration: 294,
    coverUrl: getCover(4),
    audioUrl: getAudioSample(4), // Təkrarlanan link (5)
    liked: true,
  },
  {
    id: "r18",
    title: "Someone Like You",
    artist: "Adele",
    album: "21",
    duration: 285,
    coverUrl: getCover(5),
    audioUrl: getAudioSample(5), // Təkrarlanan link (6)
    liked: false,
  },
  {
    id: "r19",
    title: "Rolling in the Deep",
    artist: "Adele",
    album: "21",
    duration: 228,
    coverUrl: getCover(6),
    audioUrl: getAudioSample(6), // Təkrarlanan link (7)
    liked: true,
  },
  {
    id: "r20",
    title: "Bad Guy",
    artist: "Billie Eilish",
    album: "When We All Fall Asleep, Where Do We Go?",
    duration: 194,
    coverUrl: getCover(7),
    audioUrl: getAudioSample(7), // Təkrarlanan link (8)
    liked: false,
  },
  // Alternative & Indie
  {
    id: "r21",
    title: "Somebody That I Used to Know",
    artist: "Gotye ft. Kimbra",
    album: "Making Mirrors",
    duration: 244,
    coverUrl: getCover(8),
    audioUrl: getAudioSample(8), // Təkrarlanan link (9)
    liked: true,
  },
  {
    id: "r22",
    title: "Pumped Up Kicks",
    artist: "Foster the People",
    album: "Torches",
    duration: 239,
    coverUrl: getCover(9),
    audioUrl: getAudioSample(9), // Təkrarlanan link (10)
    liked: false,
  },
  {
    id: "r23",
    title: "Radioactive",
    artist: "Imagine Dragons",
    album: "Night Visions",
    duration: 187,
    coverUrl: getCover(10),
    audioUrl: getAudioSample(10), // Təkrarlanan link (11)
    liked: true,
  },
  {
    id: "r24",
    title: "Counting Stars",
    artist: "OneRepublic",
    album: "Native",
    duration: 257,
    coverUrl: getCover(11),
    audioUrl: getAudioSample(11), // Təkrarlanan link (12)
    liked: false,
  },
  {
    id: "r25",
    title: "Heathens",
    artist: "Twenty One Pilots",
    album: "Suicide Squad: The Album",
    duration: 195,
    coverUrl: getCover(0),
    audioUrl: 'https://on.soundcloud.com/QxrnzGP8kIOjsOcFRx', // Təkrarlanan link (1)
    liked: true,
  },
];

export const chartTracks: Track[] = [
  {
    id: "c1",
    title: "Top of the World",
    artist: "Summit Seekers",
    album: "Peak Performance",
    duration: 234,
    coverUrl: getCover(0),
    audioUrl: getAudioSample(1), // Link 2
    liked: false,
  },
  {
    id: "c2",
    title: "Viral Beat",
    artist: "Trending Now",
    album: "Chart Toppers",
    duration: 201,
    coverUrl: getCover(1),
    audioUrl: getAudioSample(2), // Link 3
    liked: true,
  },
  {
    id: "c3",
    title: "Summer Hit",
    artist: "Beach Vibes",
    album: "Summer Collection",
    duration: 189,
    coverUrl: getCover(2),
    audioUrl: getAudioSample(3), // Link 4
    liked: false,
  },
  {
    id: "c4",
    title: "Dance Floor",
    artist: "Party Starters",
    album: "Club Anthems",
    duration: 223,
    coverUrl: getCover(3),
    audioUrl: getAudioSample(4), // Link 5
    liked: true,
  },
  {
    id: "c5",
    title: "Radio Favorite",
    artist: "Hit Makers",
    album: "Best of 2024",
    duration: 245,
    coverUrl: getCover(4),
    audioUrl: getAudioSample(5), // Link 6
    liked: false,
  },
];

// 🧹 SYNC funksiya: AI-dan gələn trekləri təmizləyir və oxunaqlı edir
export function cleanAITracks(aiTracks: Track[] = []): Track[] {
  return aiTracks.map((track, i) => {
    // 🚩 Burada da artıq 4 link yox, növbəti link təyin olunur
    const audioIndex = (mockTracks.length + i) % AUDIO_SAMPLES.length;
    
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