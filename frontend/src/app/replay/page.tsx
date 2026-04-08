import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, ShieldAlert, Cpu, Trophy } from "lucide-react";

export default function Replay() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversation Replay</h1>
          <p className="text-muted-foreground mt-1 text-sm">Post-mortem review of agent's step-by-step logic and environment resolution.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <div className="text-sm font-medium text-white">Episode ep-7b89f2</div>
             <div className="text-xs text-green-400">Resolved • 0.8 Score</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full relative">
        {/* Timeline Line */}
        <div className="absolute left-[28px] top-4 bottom-4 w-px bg-white/10"></div>

        <div className="flex flex-col gap-8">
          
          {/* Step 1: initial State */}
          <div className="relative pl-16">
            <div className="absolute left-[16px] top-1.5 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center z-10">
               <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            </div>
            <Card className="glass-card border-none bg-white/5">
              <CardHeader className="py-3 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-blue-400 font-mono">Step 0 (Initial Observation)</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white/50 mb-1">Customer (Angry - SLA: 8)</h4>
                    <p className="text-sm text-white/90 bg-white/5 p-3 rounded-xl rounded-tl-sm border border-white/10">
                      I told you guys to cancel my subscription last month! Why am I being billed again? I want a refund right now.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Agent Action */}
          <div className="relative pl-16">
            <div className="absolute left-[16px] top-1.5 w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center z-10">
               <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <Card className="glass-card border-none bg-primary/5">
              <CardHeader className="py-3 border-b border-primary/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-primary font-mono">Step 1 (Agent Action)</CardTitle>
                <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Reward: +0.2</div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-semibold text-primary uppercase">Action: Respond</h4>
                    </div>
                    <p className="text-sm text-white/90 bg-primary/10 p-3 rounded-xl border border-primary/20">
                      I completely apologize for this frustration. You did request a cancellation, and it looks like our system failed to process it. I am issuing a full refund immediately.
                    </p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                       <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-xs text-white/70">
                         <span className="text-green-400 font-semibold block">Policy Check</span>
                         Apology present. No false promises.
                       </div>
                       <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-xs text-white/70">
                         <span className="text-primary font-semibold block">Env Update</span>
                         SLA drop to 7. Sentiment shifted to +0.3.
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Resolution */}
          <div className="relative pl-16">
            <div className="absolute left-[16px] top-1.5 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center z-10">
               <Trophy className="w-3 h-3 text-green-400" />
            </div>
            <Card className="glass-card border-green-500/20 shadow-[0_0_20px_rgba(74,222,128,0.1)] bg-white/5">
              <CardHeader className="py-3 border-b border-green-500/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-green-400 font-mono">Terminal State Reached</CardTitle>
                <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Reward: +1.0</div>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-sm text-white/80">Episode resolved. Deterministic grader triggered.</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
