import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, GripVertical, QrCode } from "lucide-react";
import { Link } from "@/hooks/useDashboard";

interface SortableLinkProps {
  link: Link;
  onDelete: (id: string) => void;
  onShowQR: (linkId: string) => void;
}

export function SortableLink({
  link,
  onDelete,
  onShowQR,
}: SortableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-md transition-shadow border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {link.title}
                  </h3>
                  {link.category && (
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${link.category.color}20`,
                        color: link.category.color
                      }}
                    >
                      {link.category.name}
                    </span>
                  )}
                </div>
                {link.description && (
                  <p className="text-gray-600 mb-2">{link.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="h-4 w-4 mr-1" />
                  {link.clickCount} clicks
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShowQR(link.id)}
              >
                <QrCode className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(link.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
