import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "@/lib/db/users";
import { dummyVerify, verifyPassword } from "@/lib/password";

/**
 * Вход только по кредам, которые выдаёт владелец: регистрации нет,
 * внешних провайдеров нет. Стратегия сессий — jwt, она обязательна
 * для Credentials-провайдера.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Логин и пароль",
      credentials: {
        email: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await getUserByEmail(email);

        if (!user) {
          // Считаем хеш и для несуществующего логина: время ответа не выдаёт,
          // заведена ли такая учётка
          await dummyVerify();
          return null;
        }

        if (!(await verifyPassword(password, user.passwordHash))) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "student";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "student";
      }
      return session;
    },
  },
});
