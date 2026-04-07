import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Activity, LayoutDashboard, Settings, Video, FileText, CheckCircle2, Zap, Server } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrisisLoop Dashboard",
  description: "Customer Escalation Crisis Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col md:flex-row bg-background`}>
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 glass border-r md:h-screen sticky top-0 flex flex-col pt-6 px-4 gap-4 z-50">
          <div className="flex items-center gap-2 px-2 pb-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">CrisisLoop</h1>
          </div>
          <nav className="flex flex-col gap-1 mt-4">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Overview
            </Link>
            <Link href="/studio" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              <Video className="w-4 h-4 text-primary" />
              Episode Studio
            </Link>
            <Link href="/tasks" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Tasks & Benchmark
            </Link>
            <Link href="/scenarios" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              <FileText className="w-4 h-4 text-primary" />
              Scenarios
            </Link>
            <Link href="/boost" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              <Zap className="w-4 h-4 text-primary" />
              LLM Boost
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              <Activity className="w-4 h-4 text-primary" />
              Analytics
            </Link>
            <div className="pt-4 mt-4 border-t border-white/5 flex flex-col gap-1">
               <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Integrations</p>
               <Link href="/device-sync" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium text-green-300 hover:text-green-200">
                 <Activity className="w-4 h-4 text-green-400" />
                 Device Sync (Live Call)
               </Link>
               <Link href="/omnichannel" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium text-purple-300 hover:text-purple-200">
                 <Server className="w-4 h-4 text-purple-400" />
                 Omnichannel Simulator
               </Link>
               <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-sm font-medium">
                 <Settings className="w-4 h-4 text-white/60" />
                 App Credentials
               </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
