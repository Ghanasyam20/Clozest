"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { LogOut, Trash2, Bell, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn";

interface SettingsClientProps {
  userId: string;
  email: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
  destructive = false,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description?: string;
  action: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-4 gap-4",
        destructive && "opacity-90",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-lg mt-0.5 flex-shrink-0",
            destructive ? "bg-destructive/10" : "bg-surface-2",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              destructive ? "text-destructive" : "text-foreground-muted",
            )}
          />
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              destructive ? "text-destructive" : "text-foreground",
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-xs text-foreground-faint mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  );
}

export function SettingsClient({ email }: SettingsClientProps) {
  const [signOutConfirm, setSignOutConfirm] = useState(false);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-2xl"
    >
      <motion.div variants={item}>
        <h1 className="font-display text-display-md text-foreground leading-none">
          Settings
        </h1>
        <p className="text-foreground-muted mt-2 text-sm">
          Manage your account and preferences.
        </p>
      </motion.div>

      {/* Account section */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <h2 className="text-xs font-medium text-foreground-muted tracking-widest uppercase mb-1">
          Account
        </h2>
        <p className="text-xs text-foreground-faint mb-4">{email}</p>

        <Separator className="mb-2" />

        <SettingRow
          icon={Shield}
          title="Password"
          description="Change your account password"
          action={
            <Button variant="outline" size="sm" disabled>
              Coming soon
            </Button>
          }
        />

        <Separator />

        <SettingRow
          icon={Bell}
          title="Notifications"
          description="Email and push notification preferences"
          action={
            <Button variant="outline" size="sm" disabled>
              Coming soon
            </Button>
          }
        />

        <Separator />

        <SettingRow
          icon={Eye}
          title="Privacy"
          description="Control your data and privacy settings"
          action={
            <Button variant="outline" size="sm" disabled>
              Coming soon
            </Button>
          }
        />
      </motion.div>

      {/* Danger zone */}
      <motion.div
        variants={item}
        className="glass rounded-2xl p-6 border border-destructive/20"
      >
        <h2 className="text-xs font-medium text-destructive/70 tracking-widest uppercase mb-4">
          Danger Zone
        </h2>

        <SettingRow
          icon={LogOut}
          title="Sign out"
          description="Sign out from all devices"
          destructive
          action={
            signOutConfirm ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSignOutConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90 text-white border-0"
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.href = "/";
                  }}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setSignOutConfirm(true)}
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign out
              </Button>
            )
          }
        />

        <Separator />

        <SettingRow
          icon={Trash2}
          title="Delete account"
          description="Permanently delete your account and all data. This cannot be undone."
          destructive
          action={
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled
            >
              Delete account
            </Button>
          }
        />
      </motion.div>

      {/* App info */}
      <motion.div variants={item} className="text-center py-4">
        <p className="text-xs text-foreground-faint">
          Clozest MVP · Phase 2 · Built with Next.js 15, Prisma & Supabase
        </p>
        <p className="text-xs text-foreground-faint mt-1">
          No ads · No data selling · Free forever
        </p>
      </motion.div>
    </motion.div>
  );
}
