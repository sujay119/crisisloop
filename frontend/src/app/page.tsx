"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Timer, TrendingUp } from "lucide-react";

export default function OverviewDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
    
    // Auto-refresh stats every 5 seconds
    const intervalId = setInterval(() => {
        fetch('/stats')
          .then(res => res.json())
          .then(data => setStats(data))
          .catch(console.error);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const aiResolutionScore = stats?.ai_resolution_score || "0.0%";
  const slaBreachRate = stats?.sla_breach_rate || "0.0%";
  const policyViolationRate = stats?.policy_violation_rate || "0.0%";
  const latestRuns = stats?.latest_runs || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <div className="text-sm text-muted-foreground glass px-3 py-1.5 rounded-full">
          Status: Operational · Live Stats
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        <Card className="glass-card border-none bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Avg AI Resolution Score</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{aiResolutionScore}</div>
            <p className="text-xs text-green-400 mt-1">Based on live runs</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
            <CardTitle className="text-sm font-medium text-white/80">SLA Breach Rate</CardTitle>
            <Timer className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{slaBreachRate}</div>
            <p className="text-xs text-red-400/80 mt-1">Keep under 5%</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Policy Violations</CardTitle>
            <ShieldAlert className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{policyViolationRate}</div>
            <p className="text-xs text-white/50 mt-1">Total policy breaks across episodes</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Episodes run</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{stats?.total_episodes || 0}</div>
            <p className="text-xs text-white/50 mt-1">Total lifetime simulations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Baseline Performance */}
        <Card className="glass-card border-none bg-white/5 flex flex-col min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Task Leaderboard (Baseline)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-white/80">Task 1: Urgency Classification</span>
              <span className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">1.00</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-white/80">Task 2: Policy Compliance</span>
              <span className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">0.85</span>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="font-semibold text-white/80">Task 3: Multi-Step Escalation</span>
              <span className="text-orange-400 font-mono bg-orange-400/10 px-2 py-1 rounded">0.60</span>
            </div>
          </CardContent>
        </Card>

        {/* Latest Runs */}
        <Card className="glass-card border-none bg-white/5 flex flex-col min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Latest Runs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
             {latestRuns.length === 0 && (
                <div className="text-white/50 text-sm py-4 text-center">No episodes run yet. Go to Scenario Library to start!</div>
             )}
             {latestRuns.map((run: any) => (
               <div key={run.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-white">episode-{run.id} ({run.task})</div>
                  </div>
                  <div className={`text-sm font-semibold px-2 py-1 rounded-md ${
                    run.status === 'Resolved' ? 'text-green-400 bg-green-400/10' :
                    run.status === 'Sla breach' || run.status === 'Max steps reached' ? 'text-red-400 bg-red-400/10' :
                    'text-primary bg-primary/10'
                  }`}>{run.status}</div>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
