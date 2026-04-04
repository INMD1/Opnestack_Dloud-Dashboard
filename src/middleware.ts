import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      if (!token?.keystone_token) return false;
      if (token.exp && Date.now() / 1000 > (token.exp as number)) return false;
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/console/:path*",
    "/api/v1/:path*",
  ],
};
