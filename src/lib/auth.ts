import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return null;
  }

  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) return null;
  return session.user;
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}
