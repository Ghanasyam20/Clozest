import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "@/features/profile/components/ProfileClient";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { styleProfile: true },
  });

  if (!user) redirect("/login");

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        passwordHash: null,
      }}
      styleProfile={user.styleProfile}
    />
  );
}
