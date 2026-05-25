import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized, notFound } from "@/lib/response";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim());

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

export async function POST(
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

  const formData = await req.formData().catch(() => null);
  if (!formData) return err("Expected multipart/form-data");

  const file = formData.get("file");
  if (!file || typeof file === "string") return err("No file provided");

  const text = await (file as Blob).text();
  if (!text.trim()) return err("CSV file is empty");

  const rows = parseCSV(text);
  if (rows.length === 0) return err("CSV has no data rows");
  if (rows.length > 1000) return err("CSV exceeds 1000 row limit");

  const records = await prisma.$transaction(
    rows.map((row) =>
      prisma.appRecord.create({
        data: { appId, data: row },
      })
    )
  );

  return ok({ imported: records.length }, 201);
}
