"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Plus,
  ExternalLink,
  Settings,
  Share2,
  Link as LinkIcon,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Star,
  Users,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

          {/* Navigation */}
          <nav className="relative z-10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">LinkDash</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </a>
              </div>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="relative z-10 px-6 py-20">
            <div className="max-w-7xl mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Your Links,
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {" "}
                    Beautifully{" "}
                  </span>
                  Organized
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Create stunning link dashboards that showcase your content.
                  Share your world with style and simplicity.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Button
                  onClick={() => signIn(undefined, { callbackUrl: "/" })}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => signIn("google")}
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </div>

              {/* Demo Preview */}
              <div className="relative max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-black rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            John Doe
                          </h3>
                          <p className="text-sm text-gray-500">@johndoe</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          title: "My Portfolio",
                          desc: "Check out my latest work",
                          color: "from-gray-800 to-black"
                        },
                        {
                          title: "GitHub",
                          desc: "Open source projects",
                          color: "from-gray-700 to-gray-900"
                        },
                        {
                          title: "LinkedIn",
                          desc: "Professional network",
                          color: "from-gray-600 to-gray-800"
                        },
                        {
                          title: "Blog",
                          desc: "Thoughts and tutorials",
                          color: "from-gray-500 to-gray-700"
                        }
                      ].map((link, i) => (
                        <div
                          key={i}
                          className={`bg-gradient-to-r ${link.color} p-4 rounded-xl text-white hover:scale-105 transition-transform duration-200 cursor-pointer`}
                        >
                          <h4 className="font-semibold">{link.title}</h4>
                          <p className="text-sm opacity-90">{link.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div
            id="features"
            className="relative z-10 px-6 py-20 bg-white/5 backdrop-blur-sm"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Why Choose LinkDash?
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Everything you need to create and share beautiful link
                  collections
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Zap className="w-8 h-8" />,
                    title: "Lightning Fast",
                    description:
                      "Create and share your dashboards in seconds with our intuitive interface."
                  },
                  {
                    icon: <Shield className="w-8 h-8" />,
                    title: "Secure & Private",
                    description:
                      "Your data is encrypted and secure. Choose what to share publicly."
                  },
                  {
                    icon: <Globe className="w-8 h-8" />,
                    title: "Global Access",
                    description:
                      "Access your dashboards from anywhere, on any device, anytime."
                  },
                  {
                    icon: <BarChart3 className="w-8 h-8" />,
                    title: "Analytics",
                    description:
                      "Track clicks and engagement to understand what resonates with your audience."
                  },
                  {
                    icon: <Users className="w-8 h-8" />,
                    title: "Team Collaboration",
                    description:
                      "Share dashboards with your team and collaborate on link collections."
                  },
                  {
                    icon: <Star className="w-8 h-8" />,
                    title: "Customizable",
                    description:
                      "Personalize your dashboards with themes, colors, and custom layouts."
                  }
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative z-10 px-6 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users who are already organizing their links
                beautifully.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => signIn(undefined, { callbackUrl: "/" })}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
                >
                  Create Your Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="text-center text-sm text-gray-400">
                  No credit card required • Free forever
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 px-6 py-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-black" />
                </div>
                <span className="text-lg font-bold text-white">LinkDash</span>
              </div>
              <div className="flex items-center space-x-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">LinkDash</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {session.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="text-gray-300 font-medium">
                  {session.user?.name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {session.user?.name?.split(" ")[0]}
            </span>
            !
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create beautiful link dashboards and share them with the world. Your
            digital presence starts here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Dashboards
                  </p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Links
                  </p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-gray-900">1.2K</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-gray-900">+12%</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboards Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            Your Dashboards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Dashboard Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all duration-300 cursor-pointer group hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                  Create New Dashboard
                </h3>
                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  Start building your personal link collection with our
                  beautiful templates
                </p>
              </CardContent>
            </Card>

            {/* Sample Dashboard Cards */}
            {[
              {
                title: "My Portfolio",
                description: "Professional links and projects",
                links: 8,
                views: 1234,
                color: "bg-gray-100",
                slug: "my-portfolio"
              },
              {
                title: "Social Media",
                description: "All my social profiles in one place",
                links: 5,
                views: 856,
                color: "bg-gray-200",
                slug: "social-media"
              },
              {
                title: "Resources",
                description: "Useful tools and documentation",
                links: 12,
                views: 2103,
                color: "bg-gray-300",
                slug: "resources"
              }
            ].map((dashboard, i) => (
              <Card
                key={i}
                className="hover:shadow-xl transition-all duration-300 group border-0 shadow-lg"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${dashboard.color} rounded-xl flex items-center justify-center`}
                      >
                        <LinkIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-gray-600 transition-colors">
                          {dashboard.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {dashboard.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {dashboard.links} links
                      </span>
                      <span className="text-gray-600">
                        {dashboard.views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/public/${dashboard.slug}`}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium hover:underline"
                      >
                        yourdomain.com/{dashboard.slug}
                      </Link>
                      <Button
                        size="sm"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5" />
                <span className="font-semibold">New Dashboard</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-16 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5" />
                <span className="font-semibold">View Analytics</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-16 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Share All</span>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
