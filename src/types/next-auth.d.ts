import "next-auth";

declare module "next-auth" {
  interface Session {
    keystone_token?: string;
    exp?: number;
    skyline_session?: any;
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
    session?: any;
  }
}
