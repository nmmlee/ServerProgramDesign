import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// 404 페이지: 정의되지 않은 경로 접근 시 표시 (App.tsx의 catch-all 라우트에서 렌더링)
const NotFound = () => {
  const location = useLocation();

  // 잘못된 경로 접근을 콘솔에 기록해 디버깅 시 추적 가능하도록 함
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        {/* <a> 태그 사용: 라우터 상태를 완전히 초기화하며 홈으로 이동 */}
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
