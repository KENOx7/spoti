import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { Track } from "@/types";
import { Music, Send, Sparkles, AlertTriangle, Bot, User } from "lucide-react";
import { TrackItem } from "@/components/TrackItem";
import { GoogleGenAI } from "@google/genai";

// === TYPES ===
type Message = {
  role: "user" | "ai";
  content: string;
  tracks?: Track[];
  error?: boolean;
  isSearching?: boolean; // iTunes axtarışı gedirsə
};

// === CONFIG ===
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL_NAME = "gemini-2.0-flash";

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1024,
};

// AI sadəcə Artist və Mahnı adını verir, qalanını biz tapırıq
const systemPrompt = `
Sən Spotify bənzəri tətbiqdə musiqi köməkçisisən.
Məqsəd: İstifadəçinin istəyinə uyğun 3-5 ədəd real mahnı təklif etmək.

ÇIXIŞ FORMATI (YALNIZ JSON):
{
  "responseText": "İstifadəçiyə qısa, səmimi cavab (Azərbaycan dilində)",
  "suggestions": [
    { "artist": "Artist Adı", "title": "Mahnı Adı" },
    { "artist": "Artist Adı", "title": "Mahnı Adı" }
  ]
}

QAYDALAR:
1. Yalnız real və məşhur mahnılar təklif et.
2. Mahnı adlarını və artist adlarını orijinal (ingilis və ya öz dilində) yaz.
3. JSON-dan kənar heç bir mətn yazma.
`;

const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// === HELPERS ===

// iTunes Axtarış Funksiyası
async function searchItunesTrack(artist: string, title: string): Promise<Track | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    // limit=1 ən uyğun nəticəni götürmək üçün
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`);
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const item = data.results[0];

    return {
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName,
      duration: item.trackTimeMillis / 1000, // millis to seconds
      coverUrl: item.artworkUrl100.replace("100x100", "600x600"), // Yüksək keyfiyyətli şəkil
      audioUrl: item.previewUrl, // 30 saniyəlik preview
      liked: false
    };
  } catch (e) {
    console.error("iTunes search error:", e);
    return null;
  }
}

async function generateWithRetry(prompt: string) {
  if (!genAI) throw new Error("GenAI client is missing");
  const response = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    ...generationConfig,
  } as any);
  return response;
}

// === COMPONENT ===
export default function AskAIView() {
  const { t } = useLanguage();
  const { setQueue, playTrack } = usePlayer();
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: t("aiWelcomeMessage") },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mesaj gələndə aşağı sürüşdür
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Hazır Promtlar
  const suggestionChips = [
    { label: t("suggestionSad"), query: "Mənə qulaq asmaq üçün çox kədərli, ağladacaq mahnılar məsləhət gör." },
    { label: t("suggestionWorkout"), query: "İdman zalında məşq edərkən qulaq asmaq üçün enerji verən, basslı mahnılar." },
    { label: t("suggestionChill"), query: "Axşam çay içərkən arxa fonda çalacaq sakit, lo-fi və ya caz mahnıları." },
    { label: t("suggestionParty"), query: "Dostlarımla rəqs etmək üçün hərəkətli pop və ya disco mahnıları." },
    { label: t("suggestionRock"), query: "Queen, AC/DC kimi qruplardan ən yaxşı klassik rok mahnıları." },
    { label: t("suggestionFocus"), query: "Dərs oxuyarkən fikrimi yayındırmayan instrumental və ya klassik musiqilər." },
  ];

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !genAI) return;

    // 1. İstifadəçi mesajını əlavə et
    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Tarixçəni qurmaq (kontekst üçün)
      const historyText = messages
        .filter((m) => !m.error)
        .slice(-6) // Son 6 mesajı götürürük ki, token limiti dolmasın
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
        .join("\n");

      const finalPrompt = `${systemPrompt}\n\nKeçmiş dialoq:\n${historyText}\n\nYeni sorğu:\n${textToSend}`;

      // 2. AI-dan cavab al
      const response = await generateWithRetry(finalPrompt);
      const rawText = (response && (response as any).text) || "";
      
      // JSON təmizləmə
      const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let aiData: { responseText: string; suggestions: { artist: string; title: string }[] } | null = null;
      try {
        aiData = JSON.parse(cleanedText);
      } catch (e) {
        console.warn("JSON parse error, fallback text mode");
      }

      if (aiData && aiData.suggestions && aiData.suggestions.length > 0) {
        // 3. iTunes Axtarışına başla (Loading göstərərək)
        // Müvəqqəti AI mesajı əlavə edirik
        setMessages((prev) => [
            ...prev, 
            { role: "ai", content: aiData!.responseText, isSearching: true }
        ]);
        
        setIsLoading(false); // Inputu aktiv edirik, amma axtarış davam edir

        // Paralel olaraq bütün mahnıları axtar
        const trackPromises = aiData.suggestions.map(s => searchItunesTrack(s.artist, s.title));
        const foundTracks = await Promise.all(trackPromises);

        // Yalnız tapılan mahnıları saxla (null olmayanları)
        const validTracks = foundTracks.filter((track): track is Track => track !== null);

        // Mesajı yenilə (isSearching silinir, mahnılar gəlir)
        setMessages((prev) => {
            const newArr = [...prev];
            const lastMsg = newArr[newArr.length - 1];
            if (lastMsg.role === "ai" && lastMsg.isSearching) {
                lastMsg.isSearching = false;
                lastMsg.tracks = validTracks;
                if (validTracks.length === 0) {
                    lastMsg.content += `\n\n(${t("noTracksFound")})`;
                }
            }
            return newArr;
        });

      } else {
        // Sadə mətn cavabı (mahnı yoxdur)
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: cleanedText || "Bağışlayın, xəta baş verdi." },
        ]);
        setIsLoading(false);
      }

    } catch (err: any) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.", error: true },
      ]);
      setIsLoading(false);
    }
  };

  const handlePlayAllFromAI = (tracks: Track[]) => {
    setQueue(tracks);
    if (tracks.length > 0) playTrack(tracks[0]);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-9rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-0 shrink-0">
        <div className="p-3 rounded-xl bg-primary/10 shrink-0">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{t("askAI")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("askAIDescription")}</p>
        </div>
      </div>

      {/* Messages Area */}
      <Card className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 min-h-0 bg-background/50 backdrop-blur-sm border-none sm:border rounded-xl">
        {messages.map((msg, index) => (
          <MessageItem key={index} message={msg} onPlayAll={handlePlayAllFromAI} searchingText={t("searchingItunes")} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </Card>

      {/* Controls Area */}
      <div className="mt-4 flex flex-col gap-3 px-2 sm:px-0 shrink-0">
        
        {/* Suggestion Chips (Horizontal Scroll) */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-fade-right">
          {suggestionChips.map((chip, idx) => (
            <Button
              key={idx}
              variant="secondary"
              size="sm"
              className="whitespace-nowrap rounded-full text-xs h-8 px-4"
              onClick={() => handleSend(chip.query)}
              disabled={isLoading || !API_KEY}
            >
              {chip.label}
            </Button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            placeholder={t("askAIPlaceholder")}
            disabled={isLoading || !API_KEY}
            className="h-12 text-base rounded-2xl shadow-sm"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || !API_KEY}
            className="h-12 w-12 shrink-0 rounded-2xl shadow-sm"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!API_KEY && <ApiErrorIndicator />}
    </div>
  );
}

// === SUB-COMPONENTS ===

const ApiErrorIndicator = () => (
  <div className="mt-4 p-3 bg-destructive/20 border border-destructive rounded-xl flex items-center gap-3 mx-2">
    <AlertTriangle className="h-5 w-5 text-destructive" />
    <div className="text-destructive-foreground">
      <h3 className="font-semibold text-sm">API Açar yoxdur</h3>
      <p className="text-xs">`.env.local` faylına açarı əlavə edin.</p>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex justify-start w-full">
    <div className="p-4 rounded-2xl rounded-tl-none bg-muted/50 flex items-center gap-2">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
      </div>
    </div>
  </div>
);

const MessageItem = ({
  message,
  onPlayAll,
  searchingText
}: {
  message: Message;
  onPlayAll: (tracks: Track[]) => void;
  searchingText: string;
}) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[95%] sm:max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          {/* Bubble */}
          <div
            className={`p-3 sm:p-4 rounded-2xl break-words text-sm sm:text-base shadow-sm ${
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : message.error
                ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none"
                : "bg-card border rounded-tl-none"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>

          {/* iTunes Searching State */}
          {message.isSearching && (
             <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse ml-1">
                <Sparkles className="h-3 w-3" />
                {searchingText}
             </div>
          )}

          {/* Tracks */}
          {message.tracks && message.tracks.length > 0 && (
            <div className="w-full space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <Button onClick={() => onPlayAll(message.tracks!)} className="w-full rounded-xl" variant="secondary" size="sm">
                <Music className="mr-2 h-4 w-4" /> Hamısını Oxut
              </Button>
              <div className="space-y-1">
                {message.tracks.map((track) => (
                  <TrackItem key={track.id} track={track} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
