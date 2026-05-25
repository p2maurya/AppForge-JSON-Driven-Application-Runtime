import { getSession } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  return ok({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  });
}
