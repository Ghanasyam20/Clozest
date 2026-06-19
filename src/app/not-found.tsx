import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center animate-fade-in">
        <p className="font-display text-[10rem] leading-none text-foreground-faint/20 select-none mb-0">
          404
        </p>
        <h1 className="font-display text-display-md text-foreground -mt-8 mb-4">
          This outfit doesn&apos;t exist.
        </h1>
        <p className="text-foreground-muted mb-10 max-w-sm">
          The page you&apos;re looking for couldn&apos;t be found. Perhaps it&apos;s time to head back to your wardrobe.
        </p>
        <Link href="/dashboard">
          <Button size="lg">Back to Clozest</Button>
        </Link>
      </div>
    </main>
  );
}
