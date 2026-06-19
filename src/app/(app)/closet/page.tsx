import type { Metadata } from "next";
import { ClosetClient } from "@/features/closet/components/ClosetClient";

export const metadata: Metadata = { title: "My Closet" };

export default function ClosetPage() {
  return <ClosetClient />;
}
