import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import cookingHero from "@/assets/cooking-hero.png";

// 회원가입 페이지: 이름·이메일·비밀번호를 입력받고 제출 시 로그인 페이지로 이동
const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 비밀번호 일치 검증 및 실제 회원가입 API 연동 필요
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* 상단 히어로 이미지: 로그인 페이지보다 작게(h-24) 표시해 폼 공간 확보 */}
        <div className="flex flex-col items-center gap-2">
          <img src={cookingHero} alt="요리 일러스트" className="h-24 w-24" />
          <h1 className="text-2xl font-bold text-foreground">회원가입</h1>
          <p className="text-sm text-muted-foreground">간단한 정보를 입력해주세요</p>
        </div>

        {/* 회원가입 폼: 이름 → 이메일 → 비밀번호 → 비밀번호 확인 순서 */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            className="btn-press h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-md hover:opacity-90"
          >
            가입하기
          </button>
        </form>

        {/* 이미 계정이 있는 사용자를 위한 로그인 페이지 이동 링크 */}
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link to="/" className="font-semibold text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
