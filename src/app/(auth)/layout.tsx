import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: editorial panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-surface">
        {/* Gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(38 46% 60%) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(38 46% 60%) 0%, transparent 70%)" }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <span className="font-display text-2xl text-gradient-gold tracking-widest uppercase">
            Clozest
          </span>
        </Link>

        {/* Editorial quote */}
        <div className="relative z-10">
          <blockquote className="font-display text-3xl text-foreground leading-relaxed italic mb-6">
            &ldquo;Style is a way to say who you are without having to speak.&rdquo;
          </blockquote>
          <p className="text-foreground-muted text-sm tracking-wide">— Rachel Zoe</p>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 flex gap-12">
          {[
            { value: "80%",      label: "of wardrobes underused" },
            { value: "2.5×",     label: "more outfit combinations" },
            { value: "100%",     label: "free, always" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl text-accent">{s.value}</p>
              <p className="text-xs text-foreground-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden mb-10">
          <span className="font-display text-2xl text-gradient-gold tracking-widest uppercase">
            Clozest
          </span>
        </Link>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
