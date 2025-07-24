import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { DashboardWidget } from '../types';

interface SortableWidgetProps {
  widget: DashboardWidget;
  children: React.ReactNode;
}

export function SortableWidget({ widget, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
      }}
      className={`
        relative bg-gray-800 rounded shadow-gray-900/30 p-4
        transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="absolute top-2 right-2 cursor-move z-10" {...attributes} {...listeners}>
        <GripVertical size={20} className="text-gray-400 hover:text-gray-300" aria-label="Mover widget" />
      </div>
      {children}
    </div>
  );
}

