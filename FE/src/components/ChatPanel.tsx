import { useState } from "react";
import { Send, Sparkles, Bookmark } from "lucide-react";
import type { Ingredient } from "@/pages/MainPage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
}

interface Props {
  ingredients: Ingredient[];
  savedMessageIds: Set<string>;
  onToggleSave: (id: string, title: string, content: string) => void;
}

const ChatPanel = ({ ingredients, savedMessageIds, onToggleSave }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "안녕하세요! 🍳 냉장고에 있는 재료로 레시피를 추천해드릴게요." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchRecipe = async (userMessage?: string) => {
    setIsLoading(true);
    try {
      // URL 쿼리 파라미터에서 userId 추출 (?userId=...)
     const currentUserId = localStorage.getItem("userId");

      if (!currentUserId) {
        alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          ingredients: ingredients.map(i => i.name),
          message: userMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          title: data.title,
          content: data.content
        }]);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("레시피를 가져오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: input }]);
    fetchRecipe(input);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b p-4">
        <h2 className="font-bold text-primary">레시피 추천</h2>
        <button 
          onClick={() => fetchRecipe()} 
          disabled={isLoading}
          className="btn-press flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold"
        >
          <Sparkles className={isLoading ? "animate-spin" : ""} size={18} />
          {isLoading ? "셰프 요리 중..." : "자동 추천받기"}
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            onMouseEnter={() => setHoveredId(msg.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === "user" ? "bg-secondary" : "bg-card"}`}>
              {msg.title && <div className="mb-2 text-base font-bold text-primary">🍳 {msg.title}</div>}
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
            {msg.role === "assistant" && msg.id !== "welcome" && (
              <button 
                onClick={() => onToggleSave(msg.id, msg.title || "", msg.content)}
                className={`transition-opacity ${hoveredId === msg.id || savedMessageIds.has(msg.id) ? "opacity-100" : "opacity-0"}`}
              >
                <Bookmark size={20} className={savedMessageIds.has(msg.id) ? "text-primary" : "text-muted"} fill={savedMessageIds.has(msg.id) ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="질문을 입력하세요..." 
          className="flex-1 rounded-xl border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <button type="submit" className="rounded-xl bg-primary p-2 text-white" disabled={isLoading}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;