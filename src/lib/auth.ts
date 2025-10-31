import type { JWT } from "next-auth/jwt"
import NextAuth from "next-auth/next"
import CredentialsProvider from "@/lib/credentialsProvider"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db"

type NextAuthConfig = Parameters<typeof NextAuth>[2]
type Callbacks = NonNullable<NextAuthConfig["callbacks"]>
type JWTCallbackParams = Parameters<NonNullable<Callbacks["jwt"]>>[0]
type SessionCallbackParams = Parameters<NonNullable<Callbacks["session"]>>[0]

export const authConfig: NextAuthConfig = {
	adapter: PrismaAdapter(prisma),
	providers: [CredentialsProvider],
	secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	callbacks: {
		async jwt({ token, user }: JWTCallbackParams) {
			if (user) {
				const typedToken = token as JWT & {
					id?: string
					email?: string | null
					name?: string | null
				}
				typedToken.id = user.id
				typedToken.email = user.email ?? null
				typedToken.name = "name" in user ? user.name ?? null : null
			}
			return token
		},
		async session({ session, token }: SessionCallbackParams) {
			const sessionToken = token as JWT & {
				id?: string
				email?: string | null
				name?: string | null
			}
			if (session.user) {
				const sessionUser = session.user as typeof session.user & {
					id?: string
					email?: string | null
					name?: string | null
				}
				const fallbackEmail = sessionUser.email ?? ""
				const fallbackName = sessionUser.name ?? ""
				sessionUser.id = sessionToken.id ?? sessionUser.id ?? ""
				sessionUser.email = sessionToken.email ?? fallbackEmail
				sessionUser.name = sessionToken.name ?? fallbackName
			}
			return session
		},
	},
}