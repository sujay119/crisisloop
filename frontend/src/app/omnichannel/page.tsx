"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Server, Activity, ArrowRight, Play, Terminal, Zap } from "lucide-react";

export default function OmnichannelSimulator() {
  const [platform, setPlatform] = useState<"email" | "sms" | "slack" | "discord">("slack");
  const [payload, setPayload] = useState("");
  const [logs, setLogs] = useState<{time: string, mode: "info"|"success"|"error"|"ai", text: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (mode: "info"|"success"|"error"|"ai", text: string) => {
    const time = new Date().toISOString().split('T')[1].substring(0, 12);
    setLogs(prev => [...prev, { time, mode, text }]);
  };

  const handleInject = async () => {
    if (!payload.trim()) return;
    
    setIsProcessing(true);
    addLog("info", `Initiating Webhook Injection: POST /omnichannel/webhook -> Payload size: \${payload.length} bytes`);
    addLog("info", `Routing dispatch to Python \${platform.toUpperCase()} Agent bounds...`);
    
    try {
      const res = await fetch("" + "/omnichannel/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, message: payload })
      });
      
      if (!res.ok) {
        addLog("error", `FastAPI Backend connection failed with code \${res.status}`);
      } else {
        const data = await res.json();
        addLog("ai", `Hugging Face Inference Complete in \${data.process_time_ms}ms`);
        if (data.success) {
           addLog("success", `[Action]: \${data.action.toUpperCase()}`);
           addLog("success", `[Simulated \${platform.toUpperCase()} Response]:\n\${data.response_text}`);
        } else {
           addLog("error", `Agent Error: \${data.response_text}`);
        }
      }
    } catch(e) {
      addLog("error", "Network fault. Ensure backend is running.");
    }
    
    setIsProcessing(false);
    setPayload("");
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" /> Omnichannel Backstage
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Live simulation environment to invoke strict platform-specific Python agents natively.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Left: Input Dashboard */}
        <Card className="glass-card border-none bg-white/5 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Payload Injector</CardTitle>
            <CardDescription>Select a target system and fire a mock webhook containing customer data.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1 text-sm text-white/80">
            <div className="space-y-3">
              <label className="font-semibold text-white">Target Python Agent:</label>
              <div className="flex bg-black/30 rounded-xl p-1 gap-1">
                 {["email", "sms", "slack", "discord"].map(p => (
                    <button 
                       key={p} onClick={() => setPlatform(p as any)}
                       className={`flex-1 py-2 rounded-lg capitalize font-medium transition-colors \${platform === p ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5'}`}
                    >
                      {p}
                    </button>
                 ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col flex-1 relative">
              <label className="font-semibold text-white mb-2">Simulated Payload Body ({platform.toUpperCase()}):</label>
              <textarea 
                value={payload}
                onChange={e => setPayload(e.target.value)}
                placeholder="e.g. 'My server has been down for 2 hours! Fix this right now!'"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary resize-none font-mono text-sm leading-relaxed"
              ></textarea>
            </div>

            <Button onClick={handleInject} disabled={!payload.trim() || isProcessing} className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg">
                <Zap className="w-5 h-5 mr-2" /> 
                {isProcessing ? "Processing Webhook..." : `Fire Webhook to \${platform.toUpperCase()} Listener`}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Tracing Output */}
        <Card className="border-none bg-black/90 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden font-mono border border-white/10 rounded-xl">
           <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
           <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-white/5">
             <Terminal className="w-4 h-4 text-white/50" />
             <span className="text-sm font-semibold text-white/70">Backend Terminal Execution Trace</span>
             <Badge className="ml-auto bg-green-500/20 text-green-400">Listener Active</Badge>
           </div>
           
           <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
              {logs.length === 0 ? (
                <div className="text-white/20 text-center mt-20 flex flex-col items-center">
                  <Activity className="w-8 h-8 mb-4 animate-pulse opacity-20" />
                  Waiting for webhook injection...
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map((log, i) => (
                    <div key={i} className="flex text-xs leading-relaxed">
                       <span className="text-white/30 mr-3 shrink-0">[{log.time}]</span>
                       {log.mode === "info" && <span className="text-blue-300">{log.text}</span>}
                       {log.mode === "success" && <span className="text-green-400 whitespace-pre-wrap">{log.text}</span>}
                       {log.mode === "error" && <span className="text-red-400">{log.text}</span>}
                       {log.mode === "ai" && <span className="text-purple-400 flex items-center gap-1"><ArrowRight className="w-3 h-3"/>{log.text}</span>}
                    </div>
                  ))}
                </div>
              )}
           </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
