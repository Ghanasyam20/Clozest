import { prisma }    from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

/** POST /api/profile/complete-onboarding — marks user as onboarded */
export async function POST() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await prisma.user.update({
    where: { id: userId },
    data:  { onboarded: true },
  });

  return ok({ onboarded: true });
}
