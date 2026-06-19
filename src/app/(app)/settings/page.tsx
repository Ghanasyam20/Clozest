import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/features/settings/components/SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <SettingsClient userId={session.user.id} email={session.user.email!} />
  );
}
