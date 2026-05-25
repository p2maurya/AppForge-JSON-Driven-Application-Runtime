import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, slugify } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/response";
import { parseConfig } from "@/lib/config-validator";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  config: z.unknown(),
});

export async function GET() {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const apps = await prisma.app.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      config: true,
    },
  });

  return ok(apps);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON");
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message);

  const { name, config } = parsed.data;

  const { config: safeConfig, errors } = parseConfig(config);
  if (!safeConfig) return err(`Invalid config: ${errors.join(", ")}`);

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const conflict = await prisma.app.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });
    if (!conflict) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const app = await prisma.app.create({
    data: {
      userId: user.id,
      name,
      slug,
      config: safeConfig as object,
    },
  });

  return ok(app, 201);
}
