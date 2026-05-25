import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => null);
  }

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.delete("session_token");
  return response;
}
