"use client";

import { Copy, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { Secret } from "@/lib/secrets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SecretCardProps = {
  onCopyReference: (reference: string) => void;
  onDelete: (secretId: string) => void;
  project?: Project;
  secret: Secret;
};

export function SecretCard({
  onCopyReference,
  onDelete,
  project,
  secret
}: SecretCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{secret.name}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {secret.projectId === "global" ? "Global" : project?.name ?? "Unknown project"}
            </p>
          </div>
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {secret.provider}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <div className="grid gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Masked value
          </p>
          <p className="font-mono text-sm">{secret.maskedValue}</p>
        </div>

        <div className="grid gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reference
          </p>
          <p className="break-all rounded-md border bg-background/70 p-2 font-mono text-xs">
            {secret.reference}
          </p>
        </div>

        {secret.notes ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {secret.notes}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Created {formatDate(secret.createdAt)}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onCopyReference(secret.reference)}
            >
              <Copy className="h-4 w-4" />
              Copy reference
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(secret.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
