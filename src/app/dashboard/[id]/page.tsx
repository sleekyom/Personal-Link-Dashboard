"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, ExternalLink, Eye, ArrowLeft, GripVertical, BarChart3, Tag, X, QrCode, Download } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  _count?: {
    links: number;
  };
}

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  order: number;
  clickCount: number;
  categoryId?: string;
  category?: Category;
}

interface Dashboard {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  theme: string;
  links: Link[];
  categories: Category[];
}

function SortableLink({
  link,
  onDelete,
  onShowQR,
}: {
  link: Link;
  onDelete: (id: string) => void;
  onShowQR: (linkId: string) => void;
}) {
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

export default function DashboardPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddLink, setShowAddLink] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrLinkId, setQrLinkId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#3B82F6" });
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    categoryId: "" as string | undefined
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status, params.id, router]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/dashboards/${params.id}`);
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

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    try {
      const response = await fetch(`/api/dashboards/${params.id}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newLink)
      });

      if (response.ok) {
        setNewLink({ title: "", url: "", description: "", categoryId: "" });
        setShowAddLink(false);
        fetchDashboard(); // Refresh the dashboard
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
        fetchDashboard(); // Refresh the dashboard
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

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
      const response = await fetch(`/api/dashboards/${params.id}/links/reorder`, {
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;

    try {
      const response = await fetch(`/api/dashboards/${params.id}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        setNewCategory({ name: "", color: "#3B82F6" });
        setShowCategoryManager(false);
        fetchDashboard();
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure? Links in this category will not be deleted.")) return;

    try {
      const response = await fetch(`/api/dashboards/${params.id}/categories/${categoryId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchDashboard();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleDownloadQRCode = async (linkId?: string) => {
    try {
      const url = linkId
        ? `/api/links/${linkId}/qrcode?size=500`
        : `/api/dashboards/${params.id}/qrcode?size=500`;

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = linkId ? `link-qr-${linkId}.png` : `dashboard-qr-${params.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const filteredLinks = selectedCategory
    ? dashboard?.links.filter((link) => link.categoryId === selectedCategory) || []
    : dashboard?.links || [];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Dashboard Not Found
            </CardTitle>
            <CardDescription>
              The dashboard you&apos;re looking for doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <header className="bg-black/80 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-white">
                {dashboard.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/${params.id}/analytics`)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQrLinkId(null);
                  setShowQRCode(true);
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Manage Your Links
          </h2>
          <p className="text-gray-300">
            Add, edit, and organize your links. Drag to reorder them.
          </p>
        </div>

        {/* Category Filter & Management */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "" : "border-gray-600 text-gray-300 hover:bg-gray-800"}
          >
            All ({dashboard.links.length})
          </Button>
          {dashboard.categories.map((category) => (
            <div key={category.id} className="flex items-center gap-1">
              <Button
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
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
                onClick={() => handleDeleteCategory(category.id)}
                className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryManager(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Tag className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>

        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredLinks.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredLinks.map((link) => (
                <SortableLink
                  key={link.id}
                  link={link}
                  onDelete={handleDeleteLink}
                  onShowQR={(linkId) => {
                    setQrLinkId(linkId);
                    setShowQRCode(true);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>

          {showAddLink ? (
            <Card>
              <CardHeader>
                <CardTitle>Add New Link</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddLink} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <Input
                      value={newLink.title}
                      onChange={(e) =>
                        setNewLink({ ...newLink, title: e.target.value })
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
                        setNewLink({ ...newLink, url: e.target.value })
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
                        setNewLink({ ...newLink, description: e.target.value })
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
                        setNewLink({ ...newLink, categoryId: e.target.value || undefined })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Category</option>
                      {dashboard.categories.map((category) => (
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
                      onClick={() => setShowAddLink(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
              <CardContent
                className="flex flex-col items-center justify-center h-32"
                onClick={() => setShowAddLink(true)}
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
          )}
        </div>

        {/* Category Manager Modal */}
        {showCategoryManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name
                    </label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
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
                          setNewCategory({ ...newCategory, color: e.target.value })
                        }
                        className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={newCategory.color}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, color: e.target.value })
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
                      onClick={() => {
                        setShowCategoryManager(false);
                        setNewCategory({ name: "", color: "#3B82F6" });
                      }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {qrLinkId ? "Link QR Code" : "Dashboard QR Code"}
                </CardTitle>
                <CardDescription>
                  {qrLinkId
                    ? "Scan this QR code to visit the link directly"
                    : "Scan this QR code to visit your public dashboard"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center bg-white p-6 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      qrLinkId
                        ? `/api/links/${qrLinkId}/qrcode?size=300`
                        : `/api/dashboards/${params.id}/qrcode?size=300`
                    }
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDownloadQRCode(qrLinkId || undefined)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQRCode(false);
                      setQrLinkId(null);
                    }}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
