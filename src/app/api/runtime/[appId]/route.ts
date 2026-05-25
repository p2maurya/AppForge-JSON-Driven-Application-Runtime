import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized, notFound } from "@/lib/response";
import { parseConfig } from "@/lib/config-validator";
import type { FormConfig } from "@/types/config";
import type { Prisma } from "@prisma/client";

async function resolveApp(appId: string, userId: string) {
  return prisma.app.findFirst({ where: { id: appId, userId } });
}

function validateRecordAgainstConfig(
  data: Record<string, unknown>,
  config: FormConfig
): string[] {
  const errors: string[] = [];

  for (const field of config.fields) {
    if (field.required && !data[field.name] && data[field.name] !== 0) {
      errors.push(`Field "${field.label}" is required`);
    }

    if (data[field.name] !== undefined) {
      if (field.type === "number" && typeof data[field.name] !== "number") {
        const asNum = Number(data[field.name]);
        if (isNaN(asNum)) errors.push(`Field "${field.label}" must be a number`);
        else data[field.name] = asNum;
      }

      if (
        field.type === "select" &&
        field.options &&
        !field.options.includes(String(data[field.name]))
      ) {
        errors.push(
          `Field "${field.label}" must be one of: ${field.options.join(", ")}`
        );
      }
    }
  }

  return errors;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { appId } = await params;
  const app = await resolveApp(appId, user.id);
  if (!app) return notFound("App");

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "20"));
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.appRecord.findMany({
      where: { appId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.appRecord.count({ where: { appId } }),
  ]);

  return ok({ records, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { appId } = await params;
  const app = await resolveApp(appId, user.id);
  if (!app) return notFound("App");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return err("Request body must be an object");
  }

  const data = body as Record<string, unknown>;

  const { config: parsedConfig } = parseConfig(app.config);
  if (parsedConfig?.type === "form") {
    const validationErrors = validateRecordAgainstConfig(data, parsedConfig);
    if (validationErrors.length > 0) {
      return err(validationErrors.join("; "), 422);
    }
  }

  const record = await prisma.appRecord.create({
    data: { appId, data: data as Prisma.InputJsonValue },
  });

  return ok(record, 201);
}