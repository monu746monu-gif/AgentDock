import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/memories";
import { Skill } from "@/lib/skills";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SkillCardProps = {
  onDelete: (skillId: string) => void;
  skill: Skill;
};

export function SkillCard({ onDelete, skill }: SkillCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{skill.name}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {skill.description || "No description added yet."}
            </p>
          </div>
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {skill.targetAgent}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border bg-secondary px-2 py-1 text-xs text-muted-foreground">
            {skill.category}
          </span>
          <span className="rounded-md border bg-secondary px-2 py-1 text-xs text-muted-foreground">
            Created {formatDate(skill.createdAt)}
          </span>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6">
          {skill.instructions}
        </p>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(skill.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
