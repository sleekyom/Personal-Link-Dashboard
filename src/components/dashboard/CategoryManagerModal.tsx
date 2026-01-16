import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryManagerModalProps {
  show: boolean;
  newCategory: {
    name: string;
    color: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCategoryChange: (category: { name: string; color: string }) => void;
}

export function CategoryManagerModal({
  show,
  newCategory,
  onSubmit,
  onCancel,
  onCategoryChange
}: CategoryManagerModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <Input
                value={newCategory.name}
                onChange={(e) =>
                  onCategoryChange({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g., Social, Projects, Resources"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    onCategoryChange({ ...newCategory, color: e.target.value })
                  }
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={newCategory.color}
                  onChange={(e) =>
                    onCategoryChange({ ...newCategory, color: e.target.value })
                  }
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
              >
                Create Category
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
