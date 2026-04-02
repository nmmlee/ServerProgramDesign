import { useState, useEffect } from 'react';
import IngredientPanel from '@/components/IngredientPanel';
import ChatPanel from '@/components/ChatPanel';
import { AUTH_TOKEN_STORAGE_KEY, getUserId } from '@/lib/ingredientsApi';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 재료 데이터 구조: id는 Date.now()로 생성, expiry는 YYYY-MM-DD 형식
export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    expiry: string; // YYYY-MM-DD
}

// 저장된 AI 레시피 메시지 구조
export interface SavedMessage {
    id: string;
    title: string;
    content: string;
    savedAt: string; // ISO string
}

// 헤더 애니메이션용 음식 카테고리 목록
const cuisineTypes = ['한식', '중식', '일식', '양식'];

// 메인 페이지: 재료 관리(왼쪽)와 레시피 챗봇(오른쪽) 2패널 레이아웃
const MainPage = () => {
    const navigate = useNavigate();

    // 헤더에서 순환 강조되는 카테고리의 현재 인덱스
    const [activeIndex, setActiveIndex] = useState(0);

    // 저장된 레시피 메시지 목록
    const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);

    const handleToggleSave = (id: string, title: string, content: string) => {
        setSavedMessages((prev) => {
            const exists = prev.find((m) => m.id === id);
            if (exists) return prev.filter((m) => m.id !== id);
            return [
                ...prev,
                { id, title, content, savedAt: new Date().toISOString() },
            ];
        });
    };

    const handleRemoveSavedMessage = (id: string) => {
        setSavedMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const handleEditSavedMessage = (
        id: string,
        title: string,
        content: string,
    ) => {
        setSavedMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, title, content } : m)),
        );
    };

    const savedMessageIds = new Set(savedMessages.map((m) => m.id));

    // 재료 목록 상태: 새로고침 시 초기화됨 (localStorage 연동 미구현)
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        // { id: "1", name: "계란", quantity: 6, expiry: "2026-03-16" },
        // { id: "2", name: "양파", quantity: 3, expiry: "2026-03-20" },
        // { id: "3", name: "당근", quantity: 2, expiry: "2026-03-25" },
        // { id: "4", name: "우유", quantity: 1, expiry: "2026-03-14" },
    ]);

    // 1.2초마다 헤더의 음식 카테고리를 순환 강조하는 인터벌
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % cuisineTypes.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    // 사용자 Id가 없으면 로그인 페이지로 이동(Token이 없는 경우 메인페이지 접근 불가)
    useEffect(() => {
        const userId = getUserId();
        if (!userId) {
            navigate('/', { replace: true });
            return;
        }

        // [BE 통신] - Ingredients Get API 호출
        const fetchIngredients = async () => {
            const res = await fetch(
                `/api/ingredients?userId=${encodeURIComponent(userId)}`,
            );
            const data = await res.json();
            setIngredients(data);
        };

        fetchIngredients();
    }, [navigate]);

    // [BE 통신] - Ingredients Add API 호출
    const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
        const userId = getUserId();
        if (!userId) {
            navigate('/', { replace: true });
            return;
        }

        const res = await fetch('/api/ingredients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...ingredient,
                userId,
            }),
        });

        const data = await res.json();
        setIngredients((prev) => [...prev, data]);
    };

    const updateIngredient = async (
        id: string,
        updates: Omit<Ingredient, 'id'>,
    ) => {
        const res = await fetch(`/api/ingredients/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setIngredients((prev) =>
            prev.map((i) =>
                i.id === id
                    ? {
                          ...i,
                          name: data.name,
                          quantity: Number(data.quantity),
                          expiry: data.expiry,
                      }
                    : i,
            ),
        );
    };

    // [BE 통신] - Ingredients Delete API 호출
    const removeIngredient = async (id: string) => {
        await fetch(`/api/ingredients/${id}`, {
            method: 'DELETE',
        });

        setIngredients((prev) => prev.filter((i) => i.id !== id));
    };

    // const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    //     setIngredients((prev) => [
    //         ...prev,
    //         { ...ingredient, id: Date.now().toString() },
    //     ]);
    // };

    // const removeIngredient = (id: string) => {
    //     setIngredients((prev) => prev.filter((i) => i.id !== id));
    // };

    return (
        // h-screen + overflow-hidden 으로 페이지 스크롤 완전 제거
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            {/* 상단 헤더: shrink-0으로 높이 고정, 모바일에선 컴팩트하게 */}
            <header className="z-10 flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2.5 shadow-sm lg:px-6 lg:py-4">
                <div className="flex items-center gap-2 lg:gap-4">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground lg:px-5 lg:py-2 lg:text-base">
                        냉장고 레시피
                    </span>

                    {/* 음식 카테고리 순환 애니메이션: 모바일에서는 숨김 */}
                    <div className="hidden items-center gap-2 lg:flex">
                        {cuisineTypes.map((cuisine, i) => (
                            <span
                                key={cuisine}
                                className="inline-block transition-all duration-300 ease-in-out"
                                style={{
                                    fontSize:
                                        i === activeIndex
                                            ? '1.3rem'
                                            : '0.95rem',
                                    fontWeight: i === activeIndex ? 700 : 400,
                                    color:
                                        i === activeIndex
                                            ? 'hsl(var(--primary))'
                                            : 'hsl(var(--muted-foreground))',
                                    transform:
                                        i === activeIndex
                                            ? 'scale(1.15)'
                                            : 'scale(1)',
                                }}
                            >
                                {cuisine}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 로그아웃: 모바일에서는 아이콘만 표시 */}
                <button
                    onClick={() => {
                        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
                        navigate('/');
                    }}
                    className="btn-press flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted lg:gap-1.5 lg:px-4 lg:py-2 lg:text-base"
                >
                    <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="hidden sm:inline">로그아웃</span>
                </button>
            </header>

            {/* 2패널 본문: flex-1로 헤더 뺀 나머지 전체 차지, 모바일 세로·데스크탑 가로 */}
            <div className="flex flex-1 flex-col overflow-hidden p-3 lg:p-5">
                <div className="flex h-full w-full flex-col gap-3 lg:mx-auto lg:flex-row lg:gap-5 lg:w-fit">
                    {/* 재료 패널: 모바일 flex-1(절반), 데스크탑 고정 너비 400px */}
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:flex-none lg:w-[520px]">
                        <IngredientPanel
                            ingredients={ingredients}
                            onAdd={addIngredient}
                            onUpdate={updateIngredient}
                            onRemove={removeIngredient}
                            savedMessages={savedMessages}
                            onRemoveSavedMessage={handleRemoveSavedMessage}
                            onEditSavedMessage={handleEditSavedMessage}
                        />
                    </div>

                    {/* 채팅 패널: 데스크탑 고정 너비 480px */}
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:flex-none lg:w-[800px]">
                        <ChatPanel
                            ingredients={ingredients}
                            savedMessageIds={savedMessageIds}
                            onToggleSave={handleToggleSave}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
