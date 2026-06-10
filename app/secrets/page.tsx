"use client";

import { useMemo, useState } from "react";
import { KeyRound, Search } from "lucide-react";
import { CreateSecretDialog } from "@/components/create-secret-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SecretCard } from "@/components/secret-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useSecrets } from "@/hooks/use-secrets";
import { SECRET_PROVIDERS, SecretProvider } from "@/lib/secrets";

type ProviderFilter = "All" | SecretProvider;

export default function SecretsPage() {
  const { projects } = useProjects();
  const {
    addExampleSecrets,
    addSecret,
    deleteSecret,
    isLoaded,
    secrets
  } = useSecrets();
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("All");
  const [projectFilter, setProjectFilter] = useState("All");

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const filteredSecrets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return secrets.filter((secret) => {
      const projectName =
        secret.projectId === "global"
          ? "global"
          : projectsById.get(secret.projectId)?.name.toLowerCase() ?? "";
      const matchesSearch =
        !normalizedSearch ||
        secret.name.toLowerCase().includes(normalizedSearch) ||
        secret.provider.toLowerCase().includes(normalizedSearch) ||
        secret.notes.toLowerCase().includes(normalizedSearch) ||
        projectName.includes(normalizedSearch);
      const matchesProvider =
        providerFilter === "All" || secret.provider === providerFilter;
      const matchesProject =
        projectFilter === "All" || secret.projectId === projectFilter;

      return matchesSearch && matchesProvider && matchesProject;
    });
  }, [projectFilter, projectsById, providerFilter, searchQuery, secrets]);

  const handleCopyReference = async (reference: string) => {
    await navigator.clipboard.writeText(reference);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Secrets Vault</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Secrets Vault</h1>
          <p className="mt-2 text-muted-foreground">
            Manage local API key references for projects and agent prompts.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={addExampleSecrets}>
            <KeyRound className="h-4 w-4" />
            Add Example Secret References
          </Button>
          <CreateSecretDialog onCreateSecret={addSecret} projects={projects} />
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
        MVP mode: secrets are stored locally in your browser for demo purposes. Do not
        store production keys yet.
      </div>

      <div className="mt-6 grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_220px_220px]">
        <div className="grid gap-2">
          <Label htmlFor="secret-search">Search secrets</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="secret-search"
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, provider, notes"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="secret-provider-filter">Provider</Label>
          <Select
            id="secret-provider-filter"
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value as ProviderFilter)}
          >
            <option value="All">All providers</option>
            {SECRET_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="secret-project-filter">Project</Label>
          <Select
            id="secret-project-filter"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="All">All access</option>
            <option value="global">Global</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!isLoaded ? null : secrets.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <KeyRound className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">
            No secrets yet. Save your first API key reference.
          </p>
        </div>
      ) : filteredSecrets.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">No secrets match those filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filteredSecrets.map((secret) => (
            <SecretCard
              key={secret.id}
              onCopyReference={handleCopyReference}
              onDelete={deleteSecret}
              project={
                secret.projectId === "global"
                  ? undefined
                  : projectsById.get(secret.projectId)
              }
              secret={secret}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
