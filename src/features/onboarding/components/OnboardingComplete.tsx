"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion }    from "framer-motion";
import { Sparkles, Shirt, BarChart3, ArrowRight } from "lucide-react";
import { Button }    from "@/components/ui/button";

interface OnboardingCompleteProps {
  firstName:   string;
  itemCount?:  number;
}

const features = [
  {
    icon:  Shirt,
    title: "Your digital wardrobe",
    body:  "Everything you own, organised and searchable.",
  },
  {
    icon:  Sparkles,
    title: "AI outfit generator",
    body:  "Get styled looks from pieces you already own.",
  },
  {
    icon:  BarChart3,
    title: "Wardrobe analytics",
    body:  "See what you wear, what you don't, and why.",
  },
];

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export function OnboardingComplete({ firstName, itemCount = 0 }: OnboardingCompleteProps) {
  const router = useRouter();

  // Auto-redirect after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => router.push("/dashboard"), 6000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(38 46% 60%) 0%, transparent 70%)" }}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative text-center max-w-lg w-full"
      >
        {/* Animated check / sparkle */}
        <motion.div
          variants={item}
          className="w-24 h-24 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-8"
        >
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0,   scale: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.5, duration: 0.8 }}
          >
            <Sparkles className="h-10 w-10 text-accent" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={item} className="font-display text-display-md text-foreground mb-3">
          Welcome to Clozest,{" "}
          <span className="text-gradient-gold">{firstName}.</span>
        </motion.h1>

        <motion.p variants={item} className="text-foreground-muted leading-relaxed mb-10">
          Your wardrobe is set up and ready to go.
          {itemCount > 0 && (
            <> You&apos;ve already added <strong className="text-foreground">{itemCount} piece{itemCount !== 1 ? "s" : ""}</strong>.</>
          )}
        </motion.p>

        {/* Feature highlights */}
        <motion.div variants={item} className="grid gap-4 mb-10">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex items-start gap-4 glass rounded-xl p-4 text-left"
            >
              <div className="p-2 rounded-lg bg-accent/10 flex-shrink-0">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-foreground-muted mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={item}>
          <Button
            size="xl"
            onClick={() => router.push("/dashboard")}
            className="group w-full sm:w-auto"
          >
            Go to my wardrobe
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-xs text-foreground-faint mt-4">
            Redirecting automatically in a moment…
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
