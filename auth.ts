import { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: Record<string, string> | undefined) => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const argon2 = (await import("argon2")).default;
        const ok = await argon2.verify(user.passwordHash, credentials.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? "Admin", role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) token.role = (user as any).role || "ADMIN";
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) (session.user as any).role = (token as any).role || "ADMIN";
      return session;
    },
  },
  pages: { signIn: "/admin/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
