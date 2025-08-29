import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login", // 로그인 페이지
  },
});

export const config = {
  matcher: ["/console/:path*"], // 보호할 경로
};
