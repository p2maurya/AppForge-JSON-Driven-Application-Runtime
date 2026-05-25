import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { ok, err } from "@/lib/response";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message);

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return err("Invalid credentials", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return err("Invalid credentials", 401);

  const token = generateToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const response = ok({ user: { id: user.id, email: user.email, name: user.name } });
  response.cookies.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
