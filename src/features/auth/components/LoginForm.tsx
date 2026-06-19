"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/schemas/auth";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";

  const [values,   setValues]   = useState<LoginInput>({ email: "", password: "" });
  const [errors,   setErrors]   = useState<FieldErrors>({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState("");

  function handleChange(field: keyof LoginInput) {
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

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as keyof LoginInput;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Use next-auth's official client helper instead of raw fetch().
      // Raw fetch() with redirect:"manual" returns an opaque response
      // (status 0) in the browser, which made every login look like a
      // failure even when the credentials were correct.
      const result = await signIn("credentials", {
        email:    parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setAuthError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Success — hard navigate so the new session is picked up
      // everywhere (layouts, middleware) on a fresh load.
      window.location.href = callbackUrl;
    } catch {
      setAuthError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-display-sm text-foreground mb-2">Welcome back</h1>
        <p className="text-foreground-muted text-sm">Sign in to your Clozest account.</p>
      </div>

      {authError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
            placeholder="Your password"
            autoComplete="current-password"
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
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
