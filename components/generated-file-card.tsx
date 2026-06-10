"use client";

import { Copy, Download, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { GeneratedFile } from "@/lib/generated-files";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GeneratedFileCardProps = {
  file: GeneratedFile;
  onCopy: (content: string) => void;
  onDelete: (fileId: string) => void;
  onDownload: (fileName: string, content: string) => void;
  project?: Project;
};

export function GeneratedFileCard({
  file,
  onCopy,
  onDelete,
  onDownload,
  project
}: GeneratedFileCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{file.fileName}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {project?.name ?? "Unknown project"}
            </p>
          </div>
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {file.fileType}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <p className="text-xs text-muted-foreground">
          Created {formatDate(file.createdAt)}
        </p>
        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {file.content}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onCopy(file.content)}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onDownload(file.fileName, file.content)}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onDelete(file.id)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
