"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, AlertTriangle, ShieldCheck, Zap, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const initScenario = searchParams.get('scenario_id');
  
  const [episodeId, setEpisodeId] = useState(initScenario || "latest");
  const [fetchId, setFetchId] = useState(initScenario || "latest");
  const [data, setData] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrader = async () => {
      setLoading(true);
      try {
        let url = `/grader?episode_id=${fetchId}`;
        // If fetchId looks like a scenario ID rather than UUID or latest, pass it as scenario_id
        if (fetchId !== "latest" && (fetchId.startsWith("easy_") || fetchId.startsWith("medium_") || fetchId.startsWith("hard_"))) {
            url = `/grader?scenario_id=${fetchId}`;
        }

        const res = await fetch("" + url);
        if (!res.ok) throw new Error("Analytics not found or backend not running locally. Try running a call in Studio first.");
        const json = await res.json();
        setData(json);
        setError("");
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };

    const fetchScenarios = async () => {
      try {
        const res = await fetch("" + `/scenarios`);
        if (res.ok) {
           const json = await res.json();
           setScenarios(json);
        }
      } catch (err) {}
    };

    fetchGrader();
    fetchScenarios();
  }, [fetchId]);

  const handleSearch = () => setFetchId(episodeId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Grader Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">{initScenario ? `Viewing Baseline benchmark for ${initScenario}` : 'Deep inspection of episode deterministic scoring connected to Supabase backend.'}</p>
        </div>
        <div className="flex gap-2 w-64">
          <Input 
             value={episodeId} 
             onChange={e => setEpisodeId(e.target.value)} 
             placeholder="Episode UUID or Scenario ID" 
             className="bg-black/30 text-white border-white/20"
          />
          <Button onClick={handleSearch} variant="secondary"><Search className="w-4 h-4"/></Button>
        </div>
      </div>

      {loading && (
         <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
         </div>
      )}

      {error && !loading && (
         <div className="h-64 flex items-center justify-center text-red-400 font-medium">
            <AlertTriangle className="w-6 h-6 mr-2" /> {error}
         </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Final Score Hero */}
            <Card className="glass-card border-none bg-primary/5 lg:col-span-1 flex flex-col justify-center items-center py-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <CardHeader className="text-center pb-2 z-10">
                <CardTitle className="text-xl text-white/80">Final Grader Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-2 z-10">
                <span className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  {(data.final_score * 100).toFixed(0)}%
                </span>
                <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full mt-2 ${data.final_score > 0.6 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                  {data.final_score > 0.6 ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {data.final_score > 0.6 ? "Passed Validator" : "Failed Minimum Standard"}
                </div>
              </CardContent>
            </Card>

            {/* Component Scores Breakdown */}
            <Card className="glass-card border-none bg-white/5 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Score Components Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80 flex items-center gap-2"><Target className="w-4 h-4 text-blue-400"/> Resolution</span>
                      <span className="font-mono text-white">{data.resolution.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]" style={{width: `${Math.max(10, data.resolution * 100)}%`}}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400"/> Policy Compliance</span>
                      <span className="font-mono text-white">{data.policy_compliance.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-400 h-full rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" style={{width: `${Math.max(10, data.policy_compliance * 100)}%`}}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400"/> Tone/Sentiment Maintained</span>
                      <span className="font-mono text-white">{data.tone.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-400 h-full rounded-full shadow-[0_0_8px_rgba(251,146,60,0.5)]" style={{width: `${Math.max(10, data.tone * 100)}%`}}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Overall Correctness</span>
                      <span className="font-mono text-white">{data.correctness.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full shadow-[0_0_8px_rgba(250,204,21,0.5)]" style={{width: `${Math.max(10, data.correctness * 100)}%`}}></div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

          <div className="mt-2 text-center text-sm text-white/50">
            Analytics pulling correctly via HF Space Inference Backend.
          </div>

          {/* Scenarios Benchmark Suite Table */}
          {scenarios.length > 0 && (
            <Card className="glass-card border-none bg-white/5 mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Benchmark Test Suite ({scenarios.length} scenarios)</CardTitle>
                <CardDescription className="text-white/60">
                  Full suite of available evaluation scenarios. Run these test cases via the Studio or API to grade policy compliance and agent trajectory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                  {scenarios.map((s, idx) => (
                    <div key={idx} className="flex flex-col p-3 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-xs text-white/80">{s.id}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${s.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : s.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {s.difficulty}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white">{s.type || s.issue_type}</div>
                      <div className="text-xs text-white/60 mt-1 flex items-center gap-1">
                        Channel: <span className="capitalize">{s.channel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function GraderAnalytics() {
  return (
    <Suspense fallback={<div className="p-10 text-white/50">Loading Analytics dashboard...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
