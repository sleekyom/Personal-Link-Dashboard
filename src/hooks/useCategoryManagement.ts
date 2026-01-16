import { useState } from "react";

interface NewCategory {
  name: string;
  color: string;
}

export function useCategoryManagement(dashboardId: string, onSuccess: () => void) {
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: "",
    color: "#3B82F6"
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        setNewCategory({ name: "", color: "#3B82F6" });
        setShowCategoryManager(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure? Links in this category will not be deleted.")) return;

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/categories/${categoryId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return {
    showCategoryManager,
    setShowCategoryManager,
    selectedCategory,
    setSelectedCategory,
    newCategory,
    setNewCategory,
    handleAddCategory,
    handleDeleteCategory
  };
}
