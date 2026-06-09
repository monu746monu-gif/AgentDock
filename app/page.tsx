import Link from "next/link";
import { ArrowRight, BrainCircuit, Boxes, Cable, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: BrainCircuit,
    title: "Shared project context",
    description: "Keep project details, repo links, commands, and current work in one durable place."
  },
  {
    icon: Cable,
    title: "Built for agent handoffs",
    description: "Give every AI coding agent the same baseline before it starts editing code."
  },
  {
    icon: LayoutDashboard,
    title: "Workspace overview",
    description: "Track your project count, task load, and most recent project from the dashboard."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="agent-grid relative border-b border-border">
        <div className="mx-auto grid min-h-[88vh] w-full max-w-7xl content-center gap-12 px-4 py-8 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Boxes className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold">AgentDock</span>
            </Link>
            <Button asChild variant="outline">
              <Link href="/dashboard">Open app</Link>
            </Button>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Project Workspace MVP
              </p>
              <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                AgentDock
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                One workspace for your AI coding agents.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/projects">
                    Create Project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/dashboard">View dashboard</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card/90 p-4 shadow-2xl shadow-black/30">
              <div className="rounded-md border border-border/70 bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Workspace signal</p>
                    <p className="text-xs text-muted-foreground">Agent-ready project context</p>
                  </div>
                  <span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                    Local
                  </span>
                </div>
                <div className="grid gap-3">
                  {["Repo URL", "Run commands", "Current bugs", "Tech stack"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-md border bg-card px-3 py-3 text-sm"
                    >
                      <span>{item}</span>
                      <span className="h-2 w-20 rounded-full bg-primary/40" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
