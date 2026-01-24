import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeModalProps {
  show: boolean;
  dashboardId: string;
  linkId: string | null;
  onClose: () => void;
  onDownload: (linkId?: string) => void;
}

export function QRCodeModal({
  show,
  dashboardId,
  linkId,
  onClose,
  onDownload
}: QRCodeModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {linkId ? "Link QR Code" : "Dashboard QR Code"}
          </CardTitle>
          <CardDescription>
            {linkId
              ? "Scan this QR code to visit the link directly"
              : "Scan this QR code to visit your public dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center bg-white p-6 rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                linkId
                  ? `/api/links/${linkId}/qrcode?size=300`
                  : `/api/dashboards/${dashboardId}/qrcode?size=300`
              }
              alt="QR Code"
              className="w-64 h-64"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onDownload(linkId || undefined)}
              className="flex-1 bg-black hover:bg-gray-800 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
