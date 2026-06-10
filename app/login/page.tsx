"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Network } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { error, isConfigured, isLoading, login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifiedRedirect] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("verified") === "1"
  );

  useEffect(() => {
    if (!isLoading && user) {
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(nextPath ?? "/dashboard");
    }
  }, [isLoading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.push(nextPath ?? "/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Network className="h-5 w-5" />
            </span>
            <span className="font-semibold">AgentDock</span>
          </div>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          {!isConfigured ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
              Supabase is not configured. Add environment variables to enable login.
            </p>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {isVerifiedRedirect ? (
                <p className="rounded-lg border bg-background/60 p-4 text-sm text-muted-foreground">
                  Email verified. You can log in now.
                </p>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
              <p className="text-sm text-muted-foreground">
                No account?{" "}
                <Link className="text-primary" href="/signup">
                  Sign up
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
