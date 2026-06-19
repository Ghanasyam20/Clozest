import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";

export const authOptions: NextAuthOptions = {
  // ── NO adapter — credentials + JWT sessions don't need one ──────────────
  // The PrismaAdapter conflicts with CredentialsProvider in next-auth v4:
  // it intercepts the authorize() callback and rejects valid credentials.
  // Sessions are JWT-based, so the adapter adds nothing and breaks everything.

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.log("[Auth] Validation failed:", parsed.error.issues[0].message);
            return null;
          }

          const { email, password } = parsed.data;

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: {
              id:           true,
              email:        true,
              name:         true,
              avatarUrl:    true,
              passwordHash: true,
              onboarded:    true,
            },
          });

          if (!user) {
            console.log("[Auth] User not found:", email);
            return null;
          }

          if (!user.passwordHash) {
            console.log("[Auth] No password hash for user:", email);
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            console.log("[Auth] Invalid password for:", email);
            return null;
          }

          console.log("[Auth] Login success:", email);
          return {
            id:        user.id,
            email:     user.email,
            name:      user.name ?? undefined,
            image:     user.avatarUrl ?? undefined,
          };
        } catch (error) {
          console.error("[Auth] authorize() error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Called on sign-in (user is present) and every subsequent request
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,

  // Prevent "JWTSessionError" in development
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Debug mode in development to see exactly what's happening
  debug: process.env.NODE_ENV === "development",
};

export { getServerSession } from "next-auth";
