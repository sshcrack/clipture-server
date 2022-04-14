import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from "next-auth/providers/discord";
import { DataSourceOptions } from 'typeorm';
import { TypeORMLegacyAdapter } from "@next-auth/typeorm-legacy-adapter"


console.log(process.env.TYPEORM_PASSWORD)
const port = parseInt(process.env.TYPEORM_PORT as string);
const host = process.env.TYPEORM_HOST;
const username = process.env.TYPEORM_USERNAME;
const password = process.env.TYPEORM_PASSWORD;
const database = process.env.TYPEORM_DATABASE;

let dbOptions: DataSourceOptions = {
    type: "postgres",
    port: port,
    host: host,
    username: username,
    password: password,
    database: database,
    synchronize: true
}

const options: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        DiscordProvider({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        })
    ],

    adapter: TypeORMLegacyAdapter(dbOptions),
    secret: process.env.NEXT_SECRET,
    session: {
        strategy: "database"
    }
}

export default NextAuth(options)