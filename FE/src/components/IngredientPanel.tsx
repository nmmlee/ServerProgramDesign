import { useState } from "react";
import { Plus, Trash2, Search, ChevronDown, ChevronUp, Refrigerator, BookMarked, Pencil, Check, X } from "lucide-react";
import type { Ingredient, SavedMessage } from "@/pages/MainPage";

type Tab = "fridge" | "recipes";

// MainPage에서 재료 CRUD 콜백과 저장된 레시피 목록을 props로 전달받아 사용
interface Props {
  ingredients: Ingredient[];
  onAdd: (ingredient: Omit<Ingredient, "id">) => void;
  onRemove: (id: string) => void;
  savedMessages: SavedMessage[];
  onRemoveSavedMessage: (id: string) => void;
  onEditSavedMessage: (id: string, title: string, content: string) => void;
}

// ISO 날짜 문자열을 한국어 날짜 형식으로 변환
const toKoreanDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ISO 날짜에서 시간만 추출 (HH:MM)
const toTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

// 오늘 기준 소비기한까지 남은 일수를 계산 (음수면 이미 만료)
const getDaysUntilExpiry = (expiry: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 차이 제거 후 날짜만 비교
  const exp = new Date(expiry);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// 남은 일수에 따라 D-day 뱃지 색상 클래스를 결정
// 1일 이하: 빨강(위험), 3일 이하: 주황(경고), 그 이상: 회색(정상)
const getExpiryStyle = (days: number) => {
  if (days <= 1) return "bg-destructive/10 text-destructive";
  if (days <= 3) return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
};

// 재료 관리 패널: 냉장고 재료 추가·삭제 + 저장된 레시피 탭
const IngredientPanel = ({ ingredients, onAdd, onRemove, savedMessages, onRemoveSavedMessage, onEditSavedMessage }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("fridge");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const startEdit = (msg: SavedMessage) => {
    setEditingId(msg.id);
    setEditTitle(msg.title);
    setEditContent(msg.content);
    setExpandedId(msg.id);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    onEditSavedMessage(id, editTitle.trim(), editContent);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // 입력값 유효성 검사 후 onAdd 콜백 호출, 성공 시 폼 초기화
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("재료명을 입력해주세요."); return; }
    if (!quantity || parseInt(quantity) <= 0) { setError("개수를 올바르게 입력해주세요."); return; }
    if (!expiry) { setError("소비기한(연도-월-일)을 선택해주세요."); return; }
    onAdd({ name: name.trim(), quantity: parseInt(quantity), expiry });
    setName("");
    setQuantity("");
    setExpiry("");
  };

  // 검색어로 필터링 후 날짜별로 내림차순 그룹화 (title과 content 모두 검색)
  const filteredMessages = savedMessages.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const groupedByDate = filteredMessages.reduce<Record<string, SavedMessage[]>>(
    (acc, msg) => {
      const date = toKoreanDate(msg.savedAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    },
    {}
  );
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="flex h-full flex-col p-3 lg:p-5">

      {/* 탭 버튼: 내 냉장고 / 내 레시피 */}
      <div className="mb-3 flex gap-2 lg:mb-4">
        <button
          onClick={() => setActiveTab("fridge")}
          className={`btn-press flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-bold transition-colors lg:gap-2 lg:px-4 lg:py-3 lg:text-base ${
            activeTab === "fridge"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}
        >
          <Refrigerator className="h-4 w-4 lg:h-5 lg:w-5" />
          내 냉장고
        </button>
        <button
          onClick={() => setActiveTab("recipes")}
          className={`btn-press relative flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-bold transition-colors lg:gap-2 lg:px-4 lg:py-3 lg:text-base ${
            activeTab === "recipes"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}
        >
          <BookMarked className="h-4 w-4 lg:h-5 lg:w-5" />
          내 레시피
          {savedMessages.length > 0 && (
            <span className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold lg:h-6 lg:w-6 lg:text-sm ${
              activeTab === "recipes" ? "bg-card text-primary" : "bg-primary text-primary-foreground"
            }`}>
              {savedMessages.length}
            </span>
          )}
        </button>
      </div>

      {/* ── 내 냉장고 탭 ── */}
      {activeTab === "fridge" && (
        <>
          {/* 재료 추가 폼: 재료명·개수·소비기한을 한 줄로 입력 */}
          <form onSubmit={handleAdd} className="mb-3 flex gap-2 lg:mb-4 lg:gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="재료명"
              className="h-12 w-full min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {/* font-number: index.css에 정의된 숫자 전용 폰트(Quicksand) 클래스 */}
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="개수"
              type="number"
              min="1"
              className="h-12 w-20 rounded-xl border border-input bg-card px-3 text-center font-number text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              type="date"
              className="h-12 rounded-xl border border-input bg-card px-3 font-number text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="btn-press flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow hover:opacity-90"
            >
              <Plus className="h-6 w-6" />
            </button>
          </form>

          {/* 입력값 오류 메시지 (유효성 검사 실패 시만 표시) */}
          {error && <p className="mb-2 -mt-1 text-xs font-medium text-destructive lg:mb-3 lg:-mt-2 lg:text-sm">{error}</p>}

          {/* 재료 목록: 스크롤 가능하며 항목이 없으면 안내 문구 표시 */}
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto lg:space-y-3">
            {ingredients.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground lg:py-8 lg:text-base">
                재료를 추가해보세요!
              </p>
            )}
            {ingredients.map((item) => {
              const days = getDaysUntilExpiry(item.expiry);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-sm lg:gap-3 lg:p-4"
                >
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground lg:text-base">{item.name}</span>
                  </div>
                  <span className="font-number text-sm font-bold text-foreground lg:text-base">
                    {item.quantity}개
                  </span>
                  {/* D-day 뱃지: 고정 너비로 텍스트 길이가 바뀌어도 레이아웃에 영향 없음 */}
                  <span
                    className={`w-14 shrink-0 rounded-full py-0.5 text-center font-number text-xs font-semibold lg:w-16 lg:text-sm ${getExpiryStyle(days)}`}
                  >
                    {days <= 0 ? "만료됨" : `D-${days}`}
                  </span>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="btn-press rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive lg:p-2"
                  >
                    <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── 내 레시피 탭 ── */}
      {activeTab === "recipes" && (
        <>
          {/* 키워드 검색 */}
          <div className="relative mb-3 lg:mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground lg:left-3.5 lg:h-5 lg:w-5" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="레시피 검색..."
              className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:h-12 lg:pl-11 lg:pr-4 lg:text-base"
            />
          </div>

          {/* 날짜별 레시피 목록 */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto lg:space-y-5">
            {savedMessages.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground lg:py-8 lg:text-base">
                저장된 레시피가 없어요.<br />채팅에서 마음에 드는 레시피를 저장해보세요!
              </p>
            )}
            {savedMessages.length > 0 && filteredMessages.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground lg:py-8 lg:text-base">
                검색 결과가 없어요.
              </p>
            )}
            {sortedDates.map((date) => (
              <div key={date}>
                {/* 날짜 구분선 */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground lg:text-sm">{date}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  {groupedByDate[date].map((msg) => {
                    const isExpanded = expandedId === msg.id;
                    const isEditing = editingId === msg.id;
                    return (
                      <div
                        key={msg.id}
                        className="rounded-2xl border border-border bg-card shadow-sm"
                      >
                        {/* 카드 헤더: 펼치기 영역 + 수정·삭제 버튼 */}
                        <div className="flex items-center gap-1 px-3 py-3 lg:px-4 lg:py-3.5">
                          <button
                            onClick={() => !isEditing && setExpandedId(isExpanded ? null : msg.id)}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <span className="flex-1 truncate text-sm font-semibold text-foreground lg:text-base">
                              {msg.title}
                            </span>
                            <span className="shrink-0 font-number text-xs text-muted-foreground lg:text-sm">
                              {toTime(msg.savedAt)}
                            </span>
                            {isExpanded
                              ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground lg:h-5 lg:w-5" />
                              : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground lg:h-5 lg:w-5" />
                            }
                          </button>
                          <button
                            onClick={() => startEdit(msg)}
                            title="수정"
                            className="btn-press rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary lg:p-2"
                          >
                            <Pencil className="h-4 w-4 lg:h-4 lg:w-4" />
                          </button>
                          <button
                            onClick={() => onRemoveSavedMessage(msg.id)}
                            title="삭제"
                            className="btn-press rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive lg:p-2"
                          >
                            <Trash2 className="h-4 w-4 lg:h-4 lg:w-4" />
                          </button>
                        </div>

                        {/* 펼쳐진 상태: 편집 모드 또는 내용 표시 */}
                        {isExpanded && (
                          <div className="border-t border-border px-3 py-3 lg:px-4 lg:py-4">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="레시피 이름"
                                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  rows={6}
                                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:text-sm"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={cancelEdit}
                                    className="btn-press flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    취소
                                  </button>
                                  <button
                                    onClick={() => saveEdit(msg.id)}
                                    className="btn-press flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    저장
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground lg:text-sm">
                                {msg.content}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default IngredientPanel;
