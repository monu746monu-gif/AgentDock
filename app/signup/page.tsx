"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Network } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const { error, isConfigured, resendVerification, signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResendMessage("");

    try {
      const result = await signup(email, password);

      if (result.requiresEmailConfirmation) {
        setSubmittedEmail(email);
        return;
      }

      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      await resendVerification(submittedEmail);
      setResendMessage("Verification email sent again.");
    } finally {
      setIsResending(false);
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
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          {!isConfigured ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
              Supabase is not configured. Add environment variables to enable signup.
            </p>
          ) : submittedEmail ? (
            <div className="grid gap-4">
              <p className="rounded-lg border bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
                We sent a verification link to <span className="font-medium text-foreground">{submittedEmail}</span>. Open that link to verify your email, then log in.
              </p>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {resendMessage ? <p className="text-sm text-primary">{resendMessage}</p> : null}
              <Button type="button" variant="outline" onClick={handleResend} disabled={isResending}>
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>
              <Button asChild>
                <Link href="/login">Back to login</Link>
              </Button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create account"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link className="text-primary" href="/login">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
