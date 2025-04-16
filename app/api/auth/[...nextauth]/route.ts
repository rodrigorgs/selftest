import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from '@/lib/prisma';

const authOptions = {
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };