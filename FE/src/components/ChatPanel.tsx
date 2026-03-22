import { useState } from "react";
import { Send, Sparkles, Bookmark } from "lucide-react";
import type { Ingredient } from "@/pages/MainPage";

// 채팅 메시지 하나를 표현하는 타입
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// MainPage로부터 현재 재료 목록과 저장 상태를 props로 받아 사용
interface Props {
  ingredients: Ingredient[];
  savedMessageIds: Set<string>;
  onToggleSave: (id: string, content: string) => void;
}

// 채팅 패널: 사용자와 레시피 봇 간의 대화 UI 및 메시지 상태 관리
const ChatPanel = ({ ingredients, savedMessageIds, onToggleSave }: Props) => {
  // 첫 메시지는 봇의 환영 인사로 초기화
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 🍳 냉장고에 있는 재료를 바탕으로 레시피를 추천해드릴게요.\n\n\"오늘 뭐 해먹지?\" 라고 물어보세요!",
    },
  ]);
  const [input, setInput] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 사용자가 메시지를 전송하면 사용자 메시지 + 봇 응답을 동시에 추가
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    // TODO: 실제 LLM API(예: OpenAI) 호출로 대체 필요
    const ingredientList = ingredients.map((i) => i.name).join(", ");
    const mockResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateMockRecipe(input, ingredientList),
    };

    setMessages((prev) => [...prev, userMsg, mockResponse]);
    setInput("");
  };

  // "자동 추천받기" 버튼: 현재 재료 목록을 자동으로 메시지에 포함해 추천 요청
  const handleQuickAction = () => {
    const ingredientList = ingredients.map((i) => i.name).join(", ");
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `냉장고에 ${ingredientList}이(가) 있어요. 뭐 해먹을 수 있을까요?`,
    };
    const mockResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateMockRecipe("추천", ingredientList),
    };
    setMessages((prev) => [...prev, userMsg, mockResponse]);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* 채팅 패널 헤더: 타이틀과 빠른 추천 버튼 */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2.5 lg:px-6 lg:py-4">
        <h2>
          <span className="inline-flex items-center justify-center rounded-full border-2 border-primary bg-card px-4 py-1.5 text-sm font-bold text-primary lg:px-6 lg:py-2.5 lg:text-base">레시피 추천</span>
        </h2>
        <button
          onClick={handleQuickAction}
          className="btn-press flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground hover:opacity-80 lg:gap-2 lg:px-5 lg:py-2.5 lg:text-base"
        >
          <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
          자동 추천받기
        </button>
      </div>

      {/* 메시지 목록: overflow-y-auto로 스크롤 가능, chat-bubble-slide 애니메이션 적용 */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 lg:space-y-4 lg:p-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onMouseEnter={() => msg.role === "assistant" && setHoveredId(msg.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`chat-bubble-slide flex items-end gap-1.5 lg:gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-sm leading-relaxed lg:px-5 lg:py-4 lg:text-base ${
                msg.role === "user"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card text-card-foreground shadow-sm"
              }`}
            >
              {msg.content}
            </div>

            {/* AI 메시지에만 저장 버튼 표시: 호버 시 또는 이미 저장된 경우 보임 */}
            {msg.role === "assistant" && (
              <button
                onClick={() => onToggleSave(msg.id, msg.content)}
                title={savedMessageIds.has(msg.id) ? "저장 취소" : "저장하기"}
                className={`btn-press mb-1 flex-shrink-0 rounded-lg p-1.5 transition-all duration-150 lg:p-2 ${
                  hoveredId === msg.id || savedMessageIds.has(msg.id)
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                } ${
                  savedMessageIds.has(msg.id)
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                <Bookmark
                  className="h-4 w-4 lg:h-5 lg:w-5"
                  fill={savedMessageIds.has(msg.id) ? "currentColor" : "none"}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 메시지 입력 폼: 텍스트 입력 + 전송 버튼 */}
      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-border bg-card p-3 lg:p-4"
      >
        <div className="flex items-center gap-2 lg:gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="레시피를 물어보세요..."
            className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:h-12 lg:px-5 lg:text-base"
          />
          <button
            type="submit"
            className="btn-press flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow hover:opacity-90 lg:h-12 lg:w-12"
          >
            <Send className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Mock 레시피 응답 생성 함수: 실제 LLM 연동 전 임시 사용
// query와 ingredients를 받지만 현재는 랜덤으로 하나를 반환
function generateMockRecipe(query: string, ingredients: string): string {
  const recipes = [
    `📋 **계란볶음밥** 추천드려요!\n\n🥘 재료: ${ingredients}\n\n1. 밥을 준비하고 계란을 풀어주세요\n2. 양파, 당근을 잘게 썰어주세요\n3. 팬에 기름을 두르고 야채를 볶아주세요\n4. 밥을 넣고 함께 볶다가 계란을 넣어주세요\n5. 소금, 후추로 간을 맞추면 완성!\n\n⏱️ 조리시간: 약 15분`,
    `📋 **야채 오믈렛** 어떨까요?\n\n🥘 재료: ${ingredients}\n\n1. 계란 3개를 잘 풀어주세요\n2. 양파, 당근을 잘게 다져주세요\n3. 우유 2큰술을 계란물에 넣어주세요\n4. 팬에 버터를 두르고 야채를 볶아주세요\n5. 계란물을 부어 천천히 익혀주세요\n\n⏱️ 조리시간: 약 10분`,
    `📋 **당근 계란전** 만들어보세요!\n\n🥘 재료: ${ingredients}\n\n1. 당근을 채 썰어주세요\n2. 계란 2개에 당근, 소금을 넣고 섞어주세요\n3. 팬에 기름을 두르고 한 국자씩 부어주세요\n4. 앞뒤로 노릇하게 구워주면 완성!\n\n⏱️ 조리시간: 약 10분`,
  ];
  return recipes[Math.floor(Math.random() * recipes.length)];
}

export default ChatPanel;
