import { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  _count?: {
    links: number;
  };
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  order: number;
  clickCount: number;
  categoryId?: string;
  category?: Category;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  theme: string;
  links: Link[];
  categories: Category[];
}

export function useDashboard(dashboardId: string) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`);
      if (!response.ok) {
        throw new Error("Dashboard not found");
      }
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !dashboard) {
      return;
    }

    const oldIndex = dashboard.links.findIndex((link) => link.id === active.id);
    const newIndex = dashboard.links.findIndex((link) => link.id === over.id);

    // Update local state immediately for better UX
    const newLinks = arrayMove(dashboard.links, oldIndex, newIndex);
    setDashboard({ ...dashboard, links: newLinks });

    // Update order in the backend
    try {
      const linkIds = newLinks.map((link) => link.id);
      const response = await fetch(`/api/dashboards/${dashboardId}/links/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ linkIds })
      });

      if (!response.ok) {
        // Revert if the API call fails
        fetchDashboard();
      }
    } catch (error) {
      console.error("Error reordering links:", error);
      // Revert on error
      fetchDashboard();
    }
  };

  return {
    dashboard,
    loading,
    fetchDashboard,
    handleDragEnd
  };
}
