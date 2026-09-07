"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { AuthApi } from "../../src/api/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await AuthApi.login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(
        err?.message ||
          err?.detail ||
          "Invalid credentials. Please verify your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-bg-app p-4 w-full min-h-screen">
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, var(--color-accent-primary) 0%, transparent 60%)",
        }}
      />
      <div className="z-10 relative space-y-6 bg-[var(--color-bg-card)] shadow-2xl p-8 border border-border-subtle rounded-2xl w-full max-w-md">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex justify-center items-center shadow-blue-500/20 shadow-lg mb-2 rounded-xl w-12 h-12 text-white bg-[var(--color-accent-primary)]">
            <Compass size={28} />
          </div>
          <h1 className="font-bold text-[var(--color-text-heading)] text-xl tracking-tight">
            Hospital Navigator Admin
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xs">
            Sign in to access facility management and navigation controls.
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-[var(--color-status-danger-bg)] p-3 border border-[var(--color-status-danger-border)] rounded-lg text-[var(--color-status-danger-text)] text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@hospital.org"
            icon={<Mail size={15} />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={15} />}
          />

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 w-full"
            icon={!loading ? <ArrowRight size={16} /> : undefined}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="pt-4 border-border-subtle border-t text-text-muted text-xs text-center">
          <span>Hospital Navigator Admin Portal</span>
        </div>
      </div>
    </div>
  );
}
