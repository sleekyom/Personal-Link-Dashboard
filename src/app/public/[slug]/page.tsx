"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye } from "lucide-react";

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  clickCount: number;
}

interface Dashboard {
  id: string;
  title: string;
  description?: string;
  theme: string;
  links: Link[];
}

export default function PublicDashboard({
  params
}: {
  params: { slug: string };
}) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`/api/public/${params.slug}`);
        if (!response.ok) {
          throw new Error("Dashboard not found");
        }
        const data = await response.json();
        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [params.slug]);

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      await fetch(`/api/links/${linkId}/click`, {
        method: "POST"
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error tracking click:", error);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Dashboard Not Found
            </CardTitle>
            <CardDescription>
              The dashboard you're looking for doesn't exist or is private.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {dashboard.title}
          </h1>
          {dashboard.description && (
            <p className="text-lg text-gray-600">{dashboard.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {dashboard.links.map((link) => (
            <Card
              key={link.id}
              className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              onClick={() => handleLinkClick(link.id, link.url)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className="text-gray-600 mb-3">{link.description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      {link.clickCount} clicks
                    </div>
                  </div>
                  <ExternalLink className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dashboard.links.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No links available yet.</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Powered by Personal Link Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
