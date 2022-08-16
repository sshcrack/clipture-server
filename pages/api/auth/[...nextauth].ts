import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
    session: {
        strategy: "database",
        maxAge: 12 * 30 * 24 * 60 * 60 * 1000, // 12 Months
    },
    callbacks: {
        session: async ({ session, user }) => {
            session.userId = user.id;
            return session
        }
    }
}

export default NextAuth(nextOptions)
