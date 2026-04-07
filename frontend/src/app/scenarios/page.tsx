"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Layers, PlaySquare, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ScenarioLibrary() {
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    fetch('/scenarios')
      .then(res => res.json())
      .then(data => setScenarios(data))
      .catch(console.error);
  }, []);

  if (scenarios.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenario Library</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pre-configured testing packs targeting specific escalation risks.</p>
        </div>
        <div className="text-white/50 animate-pulse">Loading scenarios from backend...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenario Library</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pre-configured testing packs targeting specific escalation risks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Link href={`/analytics?scenario_id=${scenario.id}`} key={scenario.id}>
            <Card className="glass-card border-none bg-white/5 flex flex-col hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden h-full">
              
              <div className={`absolute top-0 left-0 w-full h-1 ${scenario.difficulty === 'Easy' ? 'bg-green-500' : scenario.difficulty === 'Medium' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={
                    scenario.difficulty === 'Easy' ? 'bg-green-400/10 text-green-400 border-green-400/20' : 
                    scenario.difficulty === 'Medium' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 
                    'bg-orange-400/10 text-orange-400 border-orange-400/20'
                  }>{scenario.difficulty}</Badge>
                  <div className="text-xs font-mono text-white/40">{scenario.id}</div>
                </div>
                <CardTitle className="text-lg">{scenario.type}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 flex-1 text-sm">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50 flex items-center gap-2"><Users className="w-4 h-4"/> Personality</span>
                  <span className="font-medium text-white/90">{scenario.personality}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50 flex items-center gap-2"><Layers className="w-4 h-4"/> Channel</span>
                  <span className="font-medium text-white/90">{scenario.channel}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50 flex items-center gap-2"><FileText className="w-4 h-4"/> SLA</span>
                  <span className="font-medium text-white/90">{scenario.sla}</span>
                </div>
                
                <div className="mt-2 text-xs text-white/70 bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="block font-semibold text-white mb-1">Active Policy:</span>
                  {scenario.policy}
                </div>
              </CardContent>

              <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                <span className="text-primary font-medium flex items-center gap-2">
                  <PlaySquare className="w-4 h-4" /> View Analytics
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
