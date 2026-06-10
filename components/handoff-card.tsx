"use client";

import { Copy, Download, Trash2 } from "lucide-react";
import { Handoff } from "@/lib/handoffs";
import { formatDate } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HandoffCardProps = {
  handoff: Handoff;
  onCopy: (content: string) => void;
  onDelete: (handoffId: string) => void;
  onDownload: (fileName: string, content: string) => void;
  project?: Project;
};

export function HandoffCard({
  handoff,
  onCopy,
  onDelete,
  onDownload,
  project
}: HandoffCardProps) {
  const includedLabels = Object.entries(handoff.includedSections)
    .filter(([, included]) => included)
    .map(([key]) => key);

  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{handoff.sourceAgentName}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {project?.name ?? "Unknown project"} · {handoff.exportTarget}
            </p>
          </div>
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {formatDate(handoff.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <div className="flex flex-wrap gap-2">
          {includedLabels.map((label) => (
            <span
              key={label}
              className="rounded-md border bg-secondary px-2 py-1 text-xs text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onCopy(handoff.content)}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onDownload("agentdock-handoff.md", handoff.content)}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onDelete(handoff.id)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
