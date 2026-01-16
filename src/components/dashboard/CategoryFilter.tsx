import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";
import { Category } from "@/hooks/useDashboard";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  totalLinks: number;
  onSelectCategory: (categoryId: string | null) => void;
  onDeleteCategory: (categoryId: string) => void;
  onShowCategoryManager: () => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  totalLinks,
  onSelectCategory,
  onDeleteCategory,
  onShowCategoryManager
}: CategoryFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(null)}
        className={selectedCategory === null ? "" : "border-gray-600 text-gray-300 hover:bg-gray-800"}
      >
        All ({totalLinks})
      </Button>
      {categories.map((category) => (
        <div key={category.id} className="flex items-center gap-1">
          <Button
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className={selectedCategory === category.id ? "" : "border-gray-600 text-gray-300 hover:bg-gray-800"}
            style={
              selectedCategory === category.id
                ? { backgroundColor: category.color, borderColor: category.color }
                : {}
            }
          >
            {category.name} ({category._count?.links || 0})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteCategory(category.id)}
            className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={onShowCategoryManager}
        className="border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        <Tag className="mr-2 h-4 w-4" />
        New Category
      </Button>
    </div>
  );
}
