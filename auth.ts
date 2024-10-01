import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Custom user type
interface CustomUser {
  id: string;
  email: string;
  username: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials) return null;

        const { email, username, password } = credentials as {
          email: string;
          username: string;
          password: string;
        };

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }],
          },
        });

        if (!user) {
          throw new Error("No user found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return custom user object
        return { id: user.id.toString(), email: user.email, username: user.username };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser; // Explicitly type the user as CustomUser
        token.id = customUser.id;
        token.email = customUser.email;
        token.username = customUser.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.username = token.username as string;
      return session;
    },
  },
});
