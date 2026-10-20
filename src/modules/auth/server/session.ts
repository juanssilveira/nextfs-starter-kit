import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Usuário não autenticado.");
  }
  return user;
}
