"use client";

import { type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";

/**
 * Generic drag-to-reorder grid (Notion/Figma-style) — pass any array of
 * items with stable string ids, get back the reordered array on drop.
 * Handles pointer + keyboard input so it stays accessible.
 */
export function SortableGrid<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableCell key={item.id} id={item.id}>
              {renderItem(item, index)}
            </SortableCell>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCell({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "z-10 opacity-60",
      )}
    >
      {children}
    </div>
  );
}
