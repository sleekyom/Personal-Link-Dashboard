"use client";

import { useEffect, useMemo } from "react";
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
import { ArrowLeft } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Custom hooks
import { useDashboard } from "@/hooks/useDashboard";
import { useLinkManagement } from "@/hooks/useLinkManagement";
import { useCategoryManagement } from "@/hooks/useCategoryManagement";
import { useQRCode } from "@/hooks/useQRCode";

// Components
import { SortableLink } from "@/components/dashboard/SortableLink";
import { AddLinkModal } from "@/components/dashboard/AddLinkModal";
import { CategoryManagerModal } from "@/components/dashboard/CategoryManagerModal";
import { QRCodeModal } from "@/components/dashboard/QRCodeModal";
import { CategoryFilter } from "@/components/dashboard/CategoryFilter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Custom hooks for data and state management
  const { dashboard, loading, fetchDashboard, handleDragEnd } = useDashboard(params.id);
  const {
    showAddLink,
    setShowAddLink,
    newLink,
    setNewLink,
    handleAddLink,
    handleDeleteLink
  } = useLinkManagement(params.id, fetchDashboard);
  const {
    showCategoryManager,
    setShowCategoryManager,
    selectedCategory,
    setSelectedCategory,
    newCategory,
    setNewCategory,
    handleAddCategory,
    handleDeleteCategory
  } = useCategoryManagement(params.id, fetchDashboard);
  const {
    showQRCode,
    qrLinkId,
    handleShowQRCode,
    handleCloseQRCode,
    handleDownloadQRCode
  } = useQRCode(params.id);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Filter links by selected category
  const filteredLinks = useMemo(() => {
    if (!dashboard) return [];
    if (selectedCategory) {
      return dashboard.links.filter((link) => link.categoryId === selectedCategory);
    }
    return dashboard.links;
  }, [dashboard, selectedCategory]);

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Dashboard not found state
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
      <DashboardHeader
        dashboardId={params.id}
        title={dashboard.title}
        onShowQRCode={() => handleShowQRCode()}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Manage Your Links
          </h2>
          <p className="text-gray-300">
            Add, edit, and organize your links. Drag to reorder them.
          </p>
        </div>

        <CategoryFilter
          categories={dashboard.categories}
          selectedCategory={selectedCategory}
          totalLinks={dashboard.links.length}
          onSelectCategory={setSelectedCategory}
          onDeleteCategory={handleDeleteCategory}
          onShowCategoryManager={() => setShowCategoryManager(true)}
        />

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
                  onShowQR={(linkId) => handleShowQRCode(linkId)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <AddLinkModal
            showAddLink={showAddLink}
            newLink={newLink}
            categories={dashboard.categories}
            onSubmit={handleAddLink}
            onCancel={() => setShowAddLink(false)}
            onLinkChange={setNewLink}
            onShowAdd={() => setShowAddLink(true)}
          />
        </div>

        <CategoryManagerModal
          show={showCategoryManager}
          newCategory={newCategory}
          onSubmit={handleAddCategory}
          onCancel={() => {
            setShowCategoryManager(false);
            setNewCategory({ name: "", color: "#3B82F6" });
          }}
          onCategoryChange={setNewCategory}
        />

        <QRCodeModal
          show={showQRCode}
          dashboardId={params.id}
          linkId={qrLinkId}
          onClose={handleCloseQRCode}
          onDownload={handleDownloadQRCode}
        />
      </main>
    </div>
  );
}
