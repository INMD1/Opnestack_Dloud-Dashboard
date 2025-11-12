// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers:
    process.env.develop === "no_api"
      ? [
        // 개발 모드
        CredentialsProvider({
          name: "Credentials",
          credentials: {
            username: { label: "아이디", type: "text" },
            password: { label: "비밀번호", type: "password" },
          },
          async authorize(credentials) {
            if (
              credentials?.username === "admin" &&
              credentials?.password === "1234"
            ) {
              return { id: "1", name: "개발 관리자" };
            }
            return null;
          },
        }),
      ]
      : [
        // 운영 모드
        CredentialsProvider({
          name: "Skyline",
          credentials: {
            username: { label: "아이디", type: "text" },
            password: { label: "비밀번호", type: "password" },
          },
          async authorize(credentials) {
            try {
              const res = await fetch(
                `${process.env.SKYLINE_API_URL}/api/v1/login`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    domain: "default",
                    region: "RegionOne",
                    username: credentials?.username,
                    password: credentials?.password,
                  }),

                }
              );

              if (!res.ok) return null;

              const data = await res.json();
              console.log(data);

              return {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                keystone_token: data.keystone_token,
                session: data,
              };
            } catch (err) {
              console.error("Skyline login error:", err);
              return null;
            }
          },
        }),
      ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.keystone_token = user.keystone_token;
        token.exp = user.session?.exp;
      }

      // JWT 만료 시 토큰 초기화
      if (token.exp && Date.now() / 1000 > token.exp) {
        return {};
      }
      return token;
    },

    async session({ session, token }) {
      if (!token?.keystone_token) return null;


      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
      };

      session.keystone_token = token.keystone_token;
      session.exp = token.exp;
      session.skyline_session = token.skyline_session;

      return session;
    },
  },
};
