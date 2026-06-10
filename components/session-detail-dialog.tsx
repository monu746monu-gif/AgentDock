"use client";

import { Copy, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/memories";
import { Project } from "@/lib/projects";
import {
  PromptSession,
  SESSION_STATUSES,
  SessionStatus
} from "@/lib/sessions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type SessionDetailDialogProps = {
  onCopy: (prompt: string) => void;
  onDelete: (sessionId: string) => void;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (sessionId: string, status: SessionStatus) => void;
  open: boolean;
  project?: Project;
  session: PromptSession | null;
};

export function SessionDetailDialog({
  onCopy,
  onDelete,
  onOpenChange,
  onStatusChange,
  open,
  project,
  session
}: SessionDetailDialogProps) {
  if (!session) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{session.title}</DialogTitle>
          <DialogDescription>
            {session.projectName}
            {session.agentName ? ` · ${session.agentName}` : ""} · {session.targetAgent} · Created{" "}
            {formatDate(session.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="detail-status">Status</Label>
            <Select
              id="detail-status"
              value={session.status}
              onChange={(event) =>
                onStatusChange(session.id, event.target.value as SessionStatus)
              }
            >
              {SESSION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2 rounded-lg border bg-background/60 p-4">
            <p className="text-sm font-medium">Project context summary</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {project?.description || "No project description saved."}
            </p>
            <p className="text-xs text-muted-foreground">
              Tech stack: {project?.techStack || "Not provided"}
            </p>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Task</p>
            <p className="whitespace-pre-wrap rounded-lg border bg-background/60 p-4 text-sm leading-6">
              {session.task}
            </p>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Full prompt / notes</p>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-background/60 p-4 text-sm leading-6">
              {session.prompt || "No prompt or notes saved."}
            </pre>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onCopy(session.prompt)}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button type="button" variant="outline" onClick={() => onDelete(session.id)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
