import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from '@/lib/prisma';

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: { email?: string | null; name?: string | null; image?: string | null } }) {
      if (user.email?.endsWith("@ufba.br")) {
        console.log('User:', user.email, user.name, user.image);
        const userCount = await prisma.user.count();
        const isAdmin = userCount === 0;
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            admin: isAdmin,
          },
        });
        return true;
      }
      return false;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.email) {
        const user = await prisma.user.findUnique({ where: { email: token.email } });
        session.user.isAdmin = user?.admin || false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };