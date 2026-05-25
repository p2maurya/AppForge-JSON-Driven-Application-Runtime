import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized, notFound } from "@/lib/response";
import { parseConfig } from "@/lib/config-validator";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.unknown().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { appId } = await params;

  const app = await prisma.app.findFirst({
    where: { id: appId, userId: user.id },
  });

  if (!app) return notFound("App");
  return ok(app);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { appId } = await params;

  const app = await prisma.app.findFirst({
    where: { id: appId, userId: user.id },
  });
  if (!app) return notFound("App");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON");
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message);

  const updates: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (typeof parsed.data.isPublished === "boolean") {
    updates.isPublished = parsed.data.isPublished;
  }

  if (parsed.data.config !== undefined) {
    const { config: safeConfig, errors } = parseConfig(parsed.data.config);
    if (!safeConfig) return err(`Invalid config: ${errors.join(", ")}`);
    updates.config = safeConfig as object;
  }

  const updated = await prisma.app.update({
    where: { id: appId },
    data: updates,
  });

  return ok(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { appId } = await params;

  const app = await prisma.app.findFirst({
    where: { id: appId, userId: user.id },
  });
  if (!app) return notFound("App");

  await prisma.app.delete({ where: { id: appId } });
  return ok({ deleted: true });
}
