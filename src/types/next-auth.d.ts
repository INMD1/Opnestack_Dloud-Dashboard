import "next-auth";

declare module "next-auth" {
  interface Session {
    keystone_token?: string;
    exp?: number;
    skyline_session?: Record<string, unknown>;
    user?: {
      id: string;
      name: string;
      email: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    keystone_token?: string;
    exp?: number;
    session?: Record<string, unknown>;
  }
}
