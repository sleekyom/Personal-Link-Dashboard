import { useState } from "react";

export function useQRCode(dashboardId: string) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrLinkId, setQrLinkId] = useState<string | null>(null);

  const handleShowQRCode = (linkId?: string) => {
    setQrLinkId(linkId || null);
    setShowQRCode(true);
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
    setQrLinkId(null);
  };

  const handleDownloadQRCode = async (linkId?: string) => {
    try {
      const url = linkId
        ? `/api/links/${linkId}/qrcode?size=500`
        : `/api/dashboards/${dashboardId}/qrcode?size=500`;

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = linkId ? `link-qr-${linkId}.png` : `dashboard-qr-${dashboardId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  return {
    showQRCode,
    qrLinkId,
    handleShowQRCode,
    handleCloseQRCode,
    handleDownloadQRCode
  };
}
