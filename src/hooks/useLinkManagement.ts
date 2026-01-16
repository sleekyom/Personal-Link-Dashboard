import { useState } from "react";

interface NewLink {
  title: string;
  url: string;
  description: string;
  categoryId?: string;
}

export function useLinkManagement(dashboardId: string, onSuccess: () => void) {
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState<NewLink>({
    title: "",
    url: "",
    description: "",
    categoryId: ""
  });

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newLink)
      });

      if (response.ok) {
        setNewLink({ title: "", url: "", description: "", categoryId: "" });
        setShowAddLink(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  return {
    showAddLink,
    setShowAddLink,
    newLink,
    setNewLink,
    handleAddLink,
    handleDeleteLink
  };
}
