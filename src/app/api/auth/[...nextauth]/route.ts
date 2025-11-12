
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

//@ts-expect-error: NextAuth expects a specific type for authOptions that is not fully compatible with the inferred type.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
