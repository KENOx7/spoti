import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { Track } from "@/types";
import { Music, Send, Sparkles, AlertTriangle, Bot, User } from "lucide-react";
import { TrackItem } from "@/components/TrackItem";
// SDK importunu sildik, birbaşa fetch istifadə edəcəyik
import { cleanAITracks } from "@/data/tracks"; 

type Message = {
  role: "user" | "ai";
  content: string;
  tracks?: Track[];
  error?: boolean;
};

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL_NAME = "gemini-2.0-flash";

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1024,
};

// Sistem təlimatı - JSON formatını məcbur edirik
const systemPrompt = `
Sən Spotify bənzəri musiqi tətbiqində istifadəçiyə mahnılar təklif edən köməkçisən.
Yalnız JSON formatında cavab ver:
{
  "responseText": "İstifadəçiyə qısa və mehriban mesaj (maksimum 2 cümlə)",
  "tracks": [
    { "title": "Mahnı Adı", "artist": "Müğənni" }
  ]
}
Əgər mahnı istənilmirsə, "tracks" massivini boş saxla.
Cavabı heç bir markdown formatı olmadan (məsələn \`\`\`json olmadan), sadəcə təmiz JSON olaraq ver.
`;

// Yüklənmə animasiyası
const LoadingBubble = () => (
  <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2">
    <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
      <Bot className="w-4 h-4 text-primary animate-pulse" />
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
      </div>
    </div>
  </div>
);

// Mesaj Komponenti
const MessageItem = ({
  message,
  onPlayAll,
}: {
  message: Message;
  onPlayAll: (tracks: Track[]) => void;
}) => (
  <div className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"} mb-6 animate-in fade-in slide-in-from-bottom-2`}>
    <div className={`flex gap-3 max-w-[95%] sm:max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
      
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
        {message.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary" />}
      </div>

      {/* Bubble Content */}
      <div className="flex flex-col gap-2 min-w-0">
        <div
          className={`p-3 sm:p-4 rounded-2xl shadow-sm break-words text-sm sm:text-base leading-relaxed ${
            message.role === "user"
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : message.error
              ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none"
              : "bg-card border border-border/50 rounded-tl-none"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Track List - Çatın içində göstəririk */}
        {message.tracks && message.tracks.length > 0 && (
          <div className="w-full space-y-2 mt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Music className="w-3 h-3" /> {message.tracks.length} Songs
              </span>
              <Button 
                onClick={() => onPlayAll(message.tracks!)} 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 -mr-2"
              >
                Play All
              </Button>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden shadow-sm">
              {message.tracks.map((track, idx) => (
                <TrackItem key={idx} track={track} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function AskAIView() {
  const { t } = useLanguage();
  const { setQueue, playTrack } = usePlayer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Avtomatik aşağı sürüşdürmə
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !API_KEY) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // FIX: Heç bir SDK-ya ehtiyac olmadan birbaşa REST API istifadə edirik
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: systemPrompt + "\n\nUser: " + userMessage
              }]
            }],
            generationConfig: generationConfig
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      // Cavabı çıxarırıq
      const responseRaw = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseRaw) throw new Error("No response from AI");

      // JSON təmizləmə (Markdown bloklarını təmizləmək üçün)
      const cleanedRaw = responseRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonMatch = cleanedRaw.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("Invalid JSON response");
      
      const data = JSON.parse(jsonMatch[0]);
      
      let tracks: Track[] = [];
      if (data.tracks && Array.isArray(data.tracks)) {
        tracks = cleanAITracks(data.tracks);
      }

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.responseText, tracks },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Üzr istəyirəm, bir xəta baş verdi. Yenidən cəhd edin.", error: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = useCallback((tracks: Track[]) => {
    if (tracks.length > 0) {
      setQueue(tracks);
      playTrack(tracks[0]);
    }
  }, [setQueue, playTrack]);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] max-w-3xl mx-auto w-full relative">
      
      {/* Header Badge */}
      <div className="flex items-center justify-center py-4 shrink-0">
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-primary/20 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          {t("aiAssistant")}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 opacity-70 mt-10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-lg font-medium">{t("aiDescription")}</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {[t("suggestionHappy"), t("suggestionWorkout"), t("suggestionChill")].map((sug, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(sug)}
                  className="text-xs bg-card border border-border px-3 py-1.5 rounded-full hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <MessageItem key={index} message={msg} onPlayAll={handlePlayAll} />
        ))}
        
        {isLoading && <LoadingBubble />}
        <div ref={scrollRef} />
      </div>

      {/* Input Area (Sticky) */}
      <div className="shrink-0 p-4 pt-2 bg-background/95 backdrop-blur-lg border-t border-border/50">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("aiDescription")}
            className="pr-12 h-12 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/30 transition-all shadow-sm text-base"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </Button>
        </form>
        {!API_KEY && (
          <div className="flex items-center gap-2 text-xs text-amber-500 mt-2 justify-center bg-amber-500/10 py-1 rounded-md">
            <AlertTriangle className="w-3 h-3" />
            <span>API Key is missing in .env file</span>
          </div>
        )}
      </div>
    </div>
  );
}