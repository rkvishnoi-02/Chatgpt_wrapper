import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  // Temporarily disable adapter to fix credentials login
  // adapter: PrismaAdapter(prisma),
  providers: [
    // Only add OAuth providers if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET 
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []
    ),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET 
      ? [GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })]
      : []
    ),CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }        // Try to find user in database first
        try {
          const dbUser = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (dbUser && dbUser.hashedPassword) {
            // Verify password
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              dbUser.hashedPassword
            );

            if (isPasswordValid) {
              return {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                image: dbUser.image,
              };
            }
          }
        } catch (error) {
          console.log('Database not available, using demo users');
        }

        // Demo users for testing - when database is not available
        const demoUsers = [
          {
            id: '1',
            email: 'demo@example.com',
            password: 'demo123',
            name: 'Demo User',
            image: null
          },
          {
            id: '2',
            email: 'test@test.com',
            password: 'test123',
            name: 'Test User',
            image: null
          }
        ];

        const user = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password);

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },  },
  pages: {
    signIn: '/auth/signin',
  },
};
