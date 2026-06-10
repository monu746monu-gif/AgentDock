"use client";

import { Copy, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/memories";
import { PromptSession } from "@/lib/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SessionCardProps = {
  onCopy: (prompt: string) => void;
  onDelete: (sessionId: string) => void;
  onOpen?: (session: PromptSession) => void;
  session: PromptSession;
};

export function SessionCard({ onCopy, onDelete, onOpen, session }: SessionCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{session.title}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {session.projectName}
              {session.agentName ? ` · ${session.agentName}` : ""}
            </p>
          </div>
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {session.targetAgent}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-md border bg-secondary px-2 py-1">
            {session.type}
          </span>
          <span className="rounded-md border bg-secondary px-2 py-1">
            {session.status}
          </span>
          <span className="rounded-md border bg-secondary px-2 py-1">
            Created {formatDate(session.createdAt)}
          </span>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {session.prompt}
        </p>

        <div className="flex justify-end gap-2">
          {onOpen ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(session)}>
              Open
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onCopy(session.prompt)}
          >
            <Copy className="h-4 w-4" />
            Copy prompt
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(session.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
