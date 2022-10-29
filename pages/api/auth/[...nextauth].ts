import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
//TODO always check user image

export const nextOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        DiscordProvider({
            clientId: process.env.CLIENT_ID as string,
            clientSecret: process.env.CLIENT_SECRET as string
        })
    ],

    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXT_SECRET,
    theme: { colorScheme: "dark" },
    session: {
        strategy: "database",
        maxAge: 5 * 30 * 24 * 60 * 60, // 5 months
    },
    callbacks: {
        session: async ({ session, user }) => {
            session.userId = user.id;
            return session
        }
    }
}

export default NextAuth(nextOptions)
