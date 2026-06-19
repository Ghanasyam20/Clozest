"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/schemas/auth";

type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

export function RegisterForm() {
  const [values, setValues] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState("");

  function handleChange(field: keyof RegisterInput) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
      setAuthError("");
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setAuthError("");

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      parsed.error.issues.forEach((err) => {
        const key = err.path[0] as keyof RegisterInput;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    // Step 1: Create the account via API
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const json = await res.json();

    if (!res.ok || json.error) {
      setAuthError(json.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // Step 2: Small delay to ensure DB write is fully committed
    // before next-auth's authorize() reads it
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Step 3: Auto sign-in
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      // Account created — sign in manually
      window.location.href = "/login?registered=true";
      return;
    }

    // Success → onboarding
    window.location.href = "/onboarding/style";
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-display-sm text-foreground mb-2">
          Create your account
        </h1>
        <p className="text-foreground-muted text-sm">
          Join Clozest and unlock your wardrobe&apos;s potential.
        </p>
      </div>

      {authError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Full name"
          type="text"
          placeholder="Alex Johnson"
          autoComplete="name"
          icon={<User className="h-4 w-4" />}
          value={values.name}
          onChange={handleChange("name")}
          error={errors.name}
          disabled={loading}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="alex@example.com"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          value={values.email}
          onChange={handleChange("email")}
          error={errors.email}
          disabled={loading}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            value={values.password}
            onChange={handleChange("password")}
            error={errors.password}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-9 text-foreground-faint hover:text-foreground-muted transition-colors"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {values.password.length > 0 && (
          <ul className="text-xs text-foreground-faint space-y-1 pl-1">
            <li className={values.password.length >= 8 ? "text-accent" : ""}>
              {values.password.length >= 8 ? "✓" : "○"} At least 8 characters
            </li>
            <li className={/[A-Z]/.test(values.password) ? "text-accent" : ""}>
              {/[A-Z]/.test(values.password) ? "✓" : "○"} One uppercase letter
            </li>
            <li className={/[0-9]/.test(values.password) ? "text-accent" : ""}>
              {/[0-9]/.test(values.password) ? "✓" : "○"} One number
            </li>
          </ul>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          loading={loading}
        >
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-foreground-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
