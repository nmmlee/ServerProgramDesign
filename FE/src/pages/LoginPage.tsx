import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import cookingHero from "@/assets/cooking-hero.png";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/ingredientsApi";

// 로그인 페이지: 앱 진입점 화면으로, 이메일·비밀번호 입력 후 메인으로 이동
const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 입력 받은 email의 공백 제거 및 소문자 변환
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    // [BE 통신] - Login API 호출
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
    const data: { message?: string; token?: string } = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.message ?? "로그인에 실패했습니다.");
      return;
    }
    if (!data.token) {
      setError("서버 응답에 토큰이 없습니다.");
      return;
    }
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token);
    navigate("/main");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* 로고 & 히어로 이미지: 앱 브랜드 인상을 첫 화면에서 전달 */}
        <div className="flex flex-col items-center gap-2">
          <img src={cookingHero} alt="요리 일러스트" className="h-32 w-32" />
          <h1 className="text-2xl font-bold text-foreground">냉장고 레시피</h1>
          <p className="text-sm text-muted-foreground">냉장고 속 재료로 맛있는 요리를 찾아보세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-center text-sm font-medium text-destructive">{error}</p>
          )}

          {/* btn-press: index.css에 정의된 탭 시 살짝 축소되는 인터랙션 클래스 */}
          <button
            type="submit"
            className="btn-press h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-md hover:opacity-90"
          >
            로그인
          </button>
        </form>

        {/* 회원가입 페이지 이동 링크 */}
        <p className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
