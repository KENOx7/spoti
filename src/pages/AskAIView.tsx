import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { Track } from "@/types";
import { Music, Send, Sparkles, AlertTriangle } from "lucide-react";
import { TrackItem } from "@/components/TrackItem";
import { GoogleGenAI } from "@google/genai";
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

const systemPrompt = `
Sən Spotify bənzəri musiqi tətbiqində istifadəçiyə mahnılar təklif edən köməkçisən.
Yalnız JSON formatında cavab ver:
{
  "responseText": "İstifadəçiyə qısa və mehriban mesaj (Azərbaycan dilində)",
  "tracks": [
    {
      "id": "unikal-id",
      "title": "Mahnı adı",
      "artist": "Sənətçi",
      "album": "Albom",
      "duration": 240,
      "coverUrl": "",
      "audioUrl": "",
      "liked": false
    }
  ]
}

ÖNƏMLİ QAYDALLAR:
1. Yalnız məşhur və həqiqi mövcud mahnı adlarını və sənətçilərini təklif et
2. Uydurma mahnılar yaratma - yalnız real dünyada mövcud olanları təklif et
3. Her track üçün düzgün "title" və "artist" ver
4. coverUrl və audioUrl boş string olaraq qalmalıdır ("") - sistem özü tapacaq
5. responseText mehriban və faydalı olmalıdır
6. 3-5 mahnı təklif etmək optimal sayıdır
7. İstifadəçinin zövqünə və ya sorğusuna uyğun mahnılar seç

Nümunə:
- Əgər istifadəçi "rock mahnıları" istəyirsə: Nirvana, AC/DC, Queen kimi məşhur rock qruplarının mahnılarını təklif et
- Əgər konkret sənətçi adı deyirsə: o sənətçinin ən məşhur mahnılarını ver
`;

const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

async function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function generateWithRetry(
  prompt: string,
  maxAttempts = 5,
  baseDelayMs = 800
) {
  if (!genAI) throw new Error("GenAI client mövcud deyil.");

  let attempt = 0;
  let lastErr: any = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        ...generationConfig,
      } as any);
      return response;
    } catch (err: any) {
      lastErr = err;
      const code =
        err?.error?.code || err?.statusCode || err?.status || err?.code;
      const shouldRetry =
        code === 429 || code === 503 || !code || err.message?.includes("fetch");

      if (!shouldRetry || attempt === maxAttempts) throw err;

      const exp = Math.pow(2, attempt - 1);
      const jitter = baseDelayMs * exp * (0.5 + Math.random() * 0.5);
      console.warn(
        `⚠️ Cəhd ${attempt} (${code || "unknown"}) – ${Math.round(
          jitter
        )}ms sonra yenidən cəhd edilir...`
      );
      await wait(jitter);
    }
  }

  throw lastErr ?? new Error("Retries exhausted");
}

export default function AskAIView() {
  const { t } = useLanguage();
  const { setQueue, playTrack } = usePlayer();
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: t("aiWelcomeMessage") },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !genAI) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyText = messages
        .filter((m) => !m.error)
        .map((m) =>
          m.role === "user" ? `User: ${m.content}` : `AI: ${m.content}`
        )
        .join("\n");

      const finalPrompt = `${systemPrompt}\n\nKeçmiş dialoq:\n${historyText}\n\nYeni sorğu:\n${input}`;

      const response = await generateWithRetry(finalPrompt, 5, 800);
      const rawText = (response && (response as any).text) || "";

      const cleaned = String(rawText)
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let aiData: { responseText: string; tracks?: Track[] } | null = null;
      try {
        aiData = JSON.parse(cleaned);
      } catch {
        console.warn("⚠️ AI cavabı JSON kimi parse olunmadı.");
      }

      if (aiData && aiData.tracks && aiData.tracks.length > 0) {
        // 🎵 AI-dan gələn mahnıları təmizlə və oxunaqlı et (artıq sync)
        const cleanedTracks = cleanAITracks(aiData.tracks);
        
        const aiMessage: Message = {
          role: "ai",
          content: aiData.responseText || "Budur sizin üçün seçilmiş mahnılar! 🎵",
          tracks: cleanedTracks,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const aiMessage: Message = {
          role: "ai",
          content:
            cleaned || "AI cavabı alınmadı. (Xahiş olunur yenidən cəhd et.)",
          error: !cleaned,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err: any) {
      console.error("GenAI xətası:", err);
      const code =
        err?.error?.code || err?.statusCode || err?.status || err?.code;
      const errorMessage =
        code === 503
          ? "Model yüklüdür (503). Bir az sonra yenidən cəhd edin."
          : `Xəta: ${err.message || JSON.stringify(err)}`;

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: errorMessage, error: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  const handlePlayAllFromAI = (tracks: Track[]) => {
    setQueue(tracks);
    if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-muted/50">
          <Sparkles className="h-8 w-8 text-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t("askAI")}</h1>
          <p className="text-muted-foreground">{t("askAIDescription")}</p>
        </div>
      </div>

      <Card className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <MessageItem key={index} message={msg} onPlayAll={handlePlayAllFromAI} />
        ))}
        {isLoading && <LoadingIndicator />}
      </Card>

      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
          placeholder={t("askAIPlaceholder")}
          disabled={isLoading || !API_KEY}
          className="h-12 text-base"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isLoading || !input.trim() || !API_KEY}
          className="h-12 w-12"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {!API_KEY && <ApiErrorIndicator />}
    </div>
  );
}

const ApiErrorIndicator = () => (
  <div className="mt-4 p-3 bg-destructive/20 border border-destructive rounded-lg flex items-center gap-3">
    <AlertTriangle className="h-6 w-6 text-destructive" />
    <div className="text-destructive-foreground">
      <h3 className="font-semibold">API Açar tapılmadı!</h3>
      <p className="text-sm">
        `.env.local` faylına <code>VITE_GEMINI_API_KEY=API_AÇARIN</code> əlavə et.
      </p>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="p-4 rounded-lg bg-muted flex items-center gap-2">
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
      </div>
    </div>
  </div>
);

const MessageItem = ({
  message,
  onPlayAll,
}: {
  message: Message;
  onPlayAll: (tracks: Track[]) => void;
}) => (
  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[80%] space-y-2`}>
      <div
        className={`p-4 rounded-lg ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : message.error
            ? "bg-destructive/20 text-destructive-foreground border border-destructive"
            : "bg-muted"
        }`}
      >
        <p>{message.content}</p>
      </div>

      {message.tracks && message.tracks.length > 0 && (
        <div className="w-full space-y-2">
          <Button onClick={() => onPlayAll(message.tracks!)} className="w-full" variant="outline">
            <Music className="mr-2 h-4 w-4" /> Hamısını Oxut
          </Button>
          <div className="p-2 border rounded-md">
            {message.tracks.map((track) => (
              <TrackItem key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);