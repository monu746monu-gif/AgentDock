import { Trash2 } from "lucide-react";
import { formatDate, Memory } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const importanceStyles = {
  Low: "border-slate-500/30 bg-slate-500/10 text-slate-200",
  Medium: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  High: "border-rose-400/30 bg-rose-400/10 text-rose-200"
};

type MemoryCardProps = {
  memory: Memory;
  onDelete?: (memoryId: string) => void;
  project?: Project;
};

export function MemoryCard({ memory, onDelete, project }: MemoryCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{project?.name ?? "Unknown project"}</CardTitle>
            <p className="mt-2 text-xs text-muted-foreground">
              Created {formatDate(memory.createdAt)}
            </p>
          </div>
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium",
              importanceStyles[memory.importance]
            )}
          >
            {memory.importance}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <p className="whitespace-pre-wrap text-sm leading-6">{memory.content}</p>

        {memory.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border bg-secondary px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {onDelete ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(memory.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
