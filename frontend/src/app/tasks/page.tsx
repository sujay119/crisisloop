import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TerminalSquare, AlertCircle } from "lucide-react";

export default function TasksBenchmarks() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks & Benchmarks</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review standard evaluation procedures and model baseline performances.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Task 1 */}
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <div className="text-8xl font-black">1</div>
          </div>
          <CardHeader className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Urgency Classification
                </CardTitle>
                <CardDescription className="mt-2 text-white/70 max-w-xl">
                  Correctly classify escalation urgency. Given minimal context, the agent must bucket the customer into low, medium, high, or critical without missing safety threats.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/20">Easy</Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Action Required</h4>
              <div className="font-mono text-xs bg-black/30 p-3 rounded-lg border border-white/5 text-primary">
                {"{ 'action_type': 'classify', 'urgency_class': string }"}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Grader Logic</h4>
              <p className="text-sm text-white/80">Deterministic exact match against true hidden urgency.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">GPT-4o Baseline</h4>
              <div className="text-3xl font-bold text-white tracking-tight">1.00 <span className="text-sm text-green-400 font-normal">Pass</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Task 2 */}
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <div className="text-8xl font-black">2</div>
          </div>
          <CardHeader className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TerminalSquare className="w-5 h-5 text-blue-400" />
                  Policy-Compliant Response
                </CardTitle>
                <CardDescription className="mt-2 text-white/70 max-w-xl">
                  Respond correctly without violating policy. The agent must acknowledge the issue, avoid false promises, and refrain from over-escalating when standard resolutions work.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/20">Medium</Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Action Required</h4>
              <div className="font-mono text-xs bg-black/30 p-3 rounded-lg border border-white/5 text-primary">
                {"{ 'action_type': 'respond' | 'offer_resolution', 'message': string, 'concession': float }"}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Grader Logic</h4>
              <p className="text-sm text-white/80">Deterministic weighted score testing tone (apology check), false commitment violations, and concession budget adherence.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">GPT-4o Baseline</h4>
              <div className="text-3xl font-bold text-white tracking-tight">0.85 <span className="text-sm text-white/50 font-normal">Avg</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Task 3 */}
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-orange-400">
             <div className="text-8xl font-black">3</div>
          </div>
          <CardHeader className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  Multi-Step Escalation Resolution
                </CardTitle>
                <CardDescription className="mt-2 text-white/70 max-w-xl">
                  Handle a multi-turn crisis. Face angry or legal-threat customers under tight SLAs, managing sentiment loops and escalation limits over 5-10 turns.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-orange-400/10 text-orange-400 border-orange-400/20">Hard</Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Action Required</h4>
              <div className="font-mono text-xs bg-black/30 p-3 rounded-lg border border-white/5 text-primary">
                 Multi-turn loop through full action schema space until terminal state reached.
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Grader Logic</h4>
              <p className="text-sm text-white/80">Bounded tracking of final episode outcome, time efficiency (SLA remaining), agent turn consistency, and terminal sentiment.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">GPT-4o Baseline</h4>
              <div className="text-3xl font-bold text-white tracking-tight">0.60 <span className="text-sm text-red-400/80 font-normal">Low</span></div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
