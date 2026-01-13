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
import { ArrowLeft, TrendingUp, Users, MousePointer, Calendar } from "lucide-react";

interface AnalyticsData {
  summary: {
    totalClicks: number;
    uniqueVisitors: number;
    totalLinks: number;
    dateRange: {
      start: string;
      end: string;
      days: number;
    };
  };
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  topReferrers: Array<{ referrer: string; count: number }>;
  timeSeriesData: Array<{ date: string; count: number }>;
  linkStats: Array<{
    id: string;
    title: string;
    clicks: number;
    totalClicks: number;
  }>;
}

export default function AnalyticsPage({
  params
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, params.id, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/dashboards/${params.id}/analytics?days=${timeRange}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-100"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Analytics Not Available
            </CardTitle>
            <CardDescription className="text-gray-400">
              Unable to load analytics data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push(`/dashboard/${params.id}`)}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, deviceBreakdown, browserBreakdown, osBreakdown, topReferrers, timeSeriesData, linkStats } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <header className="bg-black/80 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/dashboard/${params.id}`)}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-white">Analytics</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={timeRange === 7 ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(7)}
                className={timeRange === 7 ? "" : "text-gray-300 hover:text-white"}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === 30 ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(30)}
                className={timeRange === 30 ? "" : "text-gray-300 hover:text-white"}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === 90 ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(90)}
                className={timeRange === 90 ? "" : "text-gray-300 hover:text-white"}
              >
                90 Days
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Clicks
              </CardTitle>
              <MousePointer className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary.totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Last {summary.dateRange.days} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Unique Visitors
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary.uniqueVisitors.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Based on IP addresses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Links
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary.totalLinks}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Active links
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Avg. Clicks/Day
              </CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(summary.totalClicks / summary.dateRange.days).toFixed(1)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Daily average
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Series Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Clicks Over Time</CardTitle>
              <CardDescription className="text-gray-400">
                Daily click activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeSeriesData.slice(-14).map((data) => (
                  <div key={data.date} className="flex items-center">
                    <div className="text-sm text-gray-400 w-24">
                      {new Date(data.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.max(
                              (data.count / Math.max(...timeSeriesData.map(d => d.count))) * 100,
                              5
                            )}%`
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            {data.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Links */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Links</CardTitle>
              <CardDescription className="text-gray-400">
                Most clicked links in this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {linkStats.slice(0, 5).map((link, index) => (
                  <div key={link.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {link.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {link.totalClicks} total clicks
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {link.clicks}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Breakdown */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Devices</CardTitle>
              <CardDescription className="text-gray-400">
                Breakdown by device type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(deviceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{device}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(count / summary.totalClicks) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Browser Breakdown */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Browsers</CardTitle>
              <CardDescription className="text-gray-400">
                Breakdown by browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(browserBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{browser}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${(count / summary.totalClicks) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* OS Breakdown */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Operating Systems</CardTitle>
              <CardDescription className="text-gray-400">
                Breakdown by OS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(osBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([os, count]) => (
                    <div key={os} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{os}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${(count / summary.totalClicks) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Referrers */}
        {topReferrers.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Top Referrers</CardTitle>
              <CardDescription className="text-gray-400">
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topReferrers.map((ref) => (
                  <div key={ref.referrer} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 truncate flex-1">
                      {ref.referrer}
                    </span>
                    <span className="text-sm font-semibold text-white ml-4">
                      {ref.count} visits
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
