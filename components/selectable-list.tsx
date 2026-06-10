"use client";

import { Label } from "@/components/ui/label";

type SelectableListProps = {
  emptyText: string;
  items: Array<{ id: string; meta: string; title: string }>;
  label: string;
  onToggle: (id: string) => void;
  selectedIds: string[];
};

export function SelectableList({
  emptyText,
  items,
  label,
  onToggle,
  selectedIds
}: SelectableListProps) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="grid max-h-56 gap-2 overflow-auto rounded-lg border bg-background/40 p-2">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm hover:bg-secondary"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="line-clamp-2 block text-foreground">{item.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.meta}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
