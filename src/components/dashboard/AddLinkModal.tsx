import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Category } from "@/hooks/useDashboard";

interface AddLinkModalProps {
  showAddLink: boolean;
  newLink: {
    title: string;
    url: string;
    description: string;
    categoryId?: string;
  };
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onLinkChange: (link: {
    title: string;
    url: string;
    description: string;
    categoryId?: string;
  }) => void;
  onShowAdd: () => void;
}

export function AddLinkModal({
  showAddLink,
  newLink,
  categories,
  onSubmit,
  onCancel,
  onLinkChange,
  onShowAdd
}: AddLinkModalProps) {
  if (showAddLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add New Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                value={newLink.title}
                onChange={(e) =>
                  onLinkChange({ ...newLink, title: e.target.value })
                }
                placeholder="Enter link title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <Input
                type="url"
                value={newLink.url}
                onChange={(e) =>
                  onLinkChange({ ...newLink, url: e.target.value })
                }
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <Input
                value={newLink.description}
                onChange={(e) =>
                  onLinkChange({ ...newLink, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (optional)
              </label>
              <select
                value={newLink.categoryId || ""}
                onChange={(e) =>
                  onLinkChange({ ...newLink, categoryId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
              >
                Add Link
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
    );
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
      <CardContent
        className="flex flex-col items-center justify-center h-32"
        onClick={onShowAdd}
      >
        <Plus className="h-8 w-8 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Add New Link
        </h3>
        <p className="text-sm text-gray-500">
          Click to add a new link to your dashboard
        </p>
      </CardContent>
    </Card>
  );
}
