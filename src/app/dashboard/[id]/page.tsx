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
import { Plus, Edit, Trash2, ExternalLink, Eye, ArrowLeft } from "lucide-react";

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  order: number;
  clickCount: number;
}

interface Dashboard {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  theme: string;
  links: Link[];
}

export default function DashboardPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: ""
  });

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
        setNewLink({ title: "", url: "", description: "" });
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
              The dashboard you're looking for doesn't exist.
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

        <div className="space-y-4">
          {dashboard.links.map((link) => (
            <Card
              key={link.id}
              className="hover:shadow-md transition-shadow border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className="text-gray-600 mb-2">{link.description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      {link.clickCount} clicks
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

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
      </main>
    </div>
  );
}
