import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// react-router의 NavLink는 className에 함수만 허용하지만,
// 이 래퍼는 string className과 활성/대기 상태별 별도 className을 지원하도록 확장
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;       // 항상 적용되는 기본 클래스
  activeClassName?: string; // isActive일 때 추가되는 클래스
  pendingClassName?: string; // isPending일 때 추가되는 클래스
}

// forwardRef: 부모 컴포넌트가 내부 <a> 태그에 직접 ref를 연결할 수 있도록 허용
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        // cn()으로 상태에 따라 클래스명을 조건부 병합
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
