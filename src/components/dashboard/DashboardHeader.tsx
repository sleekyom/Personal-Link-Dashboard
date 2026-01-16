import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, QrCode, Edit, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  dashboardId: string;
  title: string;
  onShowQRCode: () => void;
}

export function DashboardHeader({
  dashboardId,
  title,
  onShowQRCode
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-black/80 shadow-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-white">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/${dashboardId}/analytics`)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowQRCode}
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
  );
}
