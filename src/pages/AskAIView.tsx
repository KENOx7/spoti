import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { Track } from "@/types";
import { Music, Send, Sparkles, AlertTriangle, Bot, User, Loader2 } from "lucide-react";
import { TrackItem } from "@/components/TrackItem";
import { GoogleGenAI } from "@google/genai";

// === TYPES ===
type Message = {
  role: "user" | "ai";
  content: string;
  tracks?: Track[];
  error?: boolean;
  isSearching?: boolean;
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

// AI sadəcə Artist və Mahnı adını verir
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
      duration: item.trackTimeMillis / 1000,
      coverUrl: item.artworkUrl100.replace("100x100", "600x600"),
      audioUrl: item.previewUrl,
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

  // Avtomatik aşağı sürüşdürmə
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

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyText = messages
        .filter((m) => !m.error)
        .slice(-6)
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
        .join("\n");

      const finalPrompt = `${systemPrompt}\n\nKeçmiş dialoq:\n${historyText}\n\nYeni sorğu:\n${textToSend}`;

      const response = await generateWithRetry(finalPrompt);
      const rawText = (response && (response as any).text) || "";
      const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let aiData: { responseText: string; suggestions: { artist: string; title: string }[] } | null = null;
      try {
        aiData = JSON.parse(cleanedText);
      } catch (e) {
        console.warn("JSON parse error");
      }

      if (aiData && aiData.suggestions && aiData.suggestions.length > 0) {
        setMessages((prev) => [
            ...prev, 
            { role: "ai", content: aiData!.responseText, isSearching: true }
        ]);
        
        setIsLoading(false);

        const trackPromises = aiData.suggestions.map(s => searchItunesTrack(s.artist, s.title));
        const foundTracks = await Promise.all(trackPromises);
        const validTracks = foundTracks.filter((track): track is Track => track !== null);

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
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: cleanedText || "Xəta baş verdi." },
        ]);
        setIsLoading(false);
      }

    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.", error: true },
      ]);
      setIsLoading(false);
    }
  };

  return (
    // MOBILE FIX: h-[calc(100dvh-layout)] istifadə edildi. 
    // Mobil brauzerlərin alt paneli nəzərə alınır (dvh).
    <div className="flex flex-col w-full h-[calc(100dvh-8rem)] sm:h-[calc(100vh-9rem)] max-w-4xl mx-auto relative">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 px-4 sm:px-0 shrink-0 pt-2">
        <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold truncate">{t("askAI")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate opacity-80">{t("askAIDescription")}</p>
        </div>
      </div>

      {/* Messages Area */}
      {/* MOBILE FIX: Padding azaldıldı, border silindi */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 min-h-0 bg-background/30 sm:bg-background/50 backdrop-blur-sm sm:border rounded-xl no-scrollbar">
        {messages.map((msg, index) => (
          <MessageItem 
            key={index} 
            message={msg} 
            onPlayAll={() => {
              if(msg.tracks) {
                setQueue(msg.tracks);
                playTrack(msg.tracks[0]);
              }
            }} 
            searchingText={t("searchingItunes")} 
          />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Controls Area */}
      <div className="mt-2 flex flex-col gap-2 px-2 sm:px-0 shrink-0 pb-2">
        
        {/* MOBILE FIX: Horizontal Scroll (Chips) */}
        {/* flex-nowrap, overflow-x-auto və no-scrollbar əlavə edildi */}
        <div className="flex gap-2 overflow-x-auto pb-1 w-full no-scrollbar mask-fade-right touch-pan-x">
          {suggestionChips.map((chip, idx) => (
            <Button
              key={idx}
              variant="secondary"
              size="sm"
              // flex-shrink-0 vacibdir ki, düymələr əzilməsin
              className="whitespace-nowrap flex-shrink-0 rounded-full text-xs h-8 px-4 bg-secondary/80 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all"
              onClick={() => handleSend(chip.query)}
              disabled={isLoading || !API_KEY}
            >
              {chip.label}
            </Button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 w-full items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            placeholder={t("askAIPlaceholder")}
            disabled={isLoading || !API_KEY}
            className="h-11 sm:h-12 text-sm sm:text-base rounded-2xl shadow-sm bg-background/80 backdrop-blur"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || !API_KEY}
            className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-2xl shadow-sm transition-transform active:scale-95"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {!API_KEY && <ApiErrorIndicator />}
    </div>
  );
}

// === SUB-COMPONENTS ===

const ApiErrorIndicator = () => (
  <div className="mt-2 p-3 bg-destructive/10 border border-destructive/50 rounded-xl flex items-center gap-3 mx-2">
    <AlertTriangle className="h-5 w-5 text-destructive" />
    <div className="text-destructive-foreground">
      <h3 className="font-semibold text-sm">API Error</h3>
      <p className="text-xs">Check configuration.</p>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex justify-start w-full animate-in fade-in duration-300">
    <div className="p-4 rounded-2xl rounded-tl-none bg-muted/50 flex items-center gap-2">
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150" />
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300" />
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
  onPlayAll: () => void;
  searchingText: string;
}) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}>
            {isUser ? <User size={14} /> : <Bot size={14} />}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <div
            className={`p-3 sm:p-4 rounded-2xl break-words text-sm shadow-sm ${
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : message.error
                ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none"
                : "bg-card border rounded-tl-none"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>

          {message.isSearching && (
             <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse ml-1">
                <Sparkles className="h-3 w-3" />
                {searchingText}
             </div>
          )}

          {message.tracks && message.tracks.length > 0 && (
            <div className="w-full space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <Button onClick={onPlayAll} className="w-full rounded-xl h-9 text-xs sm:text-sm" variant="secondary" size="sm">
                <Music className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Hamısını Oxut
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
