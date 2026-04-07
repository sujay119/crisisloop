"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock, HeartPulse, Send, PhoneCall, Bot, User, Radio } from "lucide-react";

type Message = { role: "customer" | "agent" | "system"; content: string; isAuto?: boolean };

function StudioContent() {
  const searchParams = useSearchParams();
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "ai-active" | "human-handoff" | "resolved">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [sla, setSla] = useState(5);
  const [sentiment, setSentiment] = useState(0.5);
  const [patience, setPatience] = useState(3);
  
  const [humanInput, setHumanInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const startCall = async () => {
    setMessages([]);
    setStatus("idle");
    try {
      const scenario_id = searchParams.get("scenario_id") || "hard_1";
      const task_id = searchParams.get("task_id") || "task_3";
      
      const res = await fetch("" + "/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task_id, scenario_id: scenario_id })
      });
      const data = await res.json();
      setEpisodeId(data.episode_id);
      
      setSla(data.observation.sla_remaining || 5);
      setSentiment(data.observation.visible_sentiment_score || 0.5);
      setPatience(3); // Patience is tracked on EpisodeState but not explicitly surfaced in Observation, using default
      
      
      const firstCustomerMsg = data.observation.customer_message;
      setMessages([{ role: "customer", content: firstCustomerMsg }]);
      
      // Start Auto AI CRM Flow
      setStatus("ai-active");
    } catch (e) {
      console.error(e);
      alert("Backend not reachable. Ensure FastAPI is running on port 8000.");
    }
  };

  // AI Loop logic
  useEffect(() => {
    let active = true;
    
    const runAITurn = async () => {
      if (status !== "ai-active" || !episodeId) return;
      
      // Prevent running if the last message was from the agent (wait for customer)
      if (messages.length > 0 && messages[messages.length - 1].role === "agent") return;

      // 1. Ask Auto-Agent for Action
      try {
        const payload = {
          history: messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })),
          sentiment,
          sla_remaining: sla,
          patience
        };

        const aiRes = await fetch("" + "/crm/auto-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        if (!aiRes.ok) throw new Error("Auto-Agent failed");
        const aiData = await aiRes.json();
        
        // Push AI message to UI
        const newMsg: Message = { role: "agent", content: aiData.message, isAuto: true };
        setMessages(prev => [...prev, newMsg]);

        // If AI chose to escalate (Hand off to Human)
        if (aiData.action_type === "escalate") {
           setStatus("human-handoff");
           setMessages(prev => [...prev, { role: "system", content: "AI Agent explicitly escalated. HUMAN HANDOFF INITIATED." }]);
           return;
        }

        // Wait a slight moment for realism
        await new Promise(r => setTimeout(r, 1000));
        
        // 2. Submit AI Action to Environment Step
        const stepRes = await fetch("" + "/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episode_id: episodeId,
            action: {
              action_type: aiData.action_type,
              message: aiData.message,
              concession_amount: aiData.concession_amount
            }
          })
        });
        
        const stepData = await stepRes.json();
        
        // Update states
        setSla(stepData.observation.sla_remaining || 5);
        setSentiment(stepData.observation.visible_sentiment_score || 0.5);
        setPatience(3); // static patience fallback since observation drops it
        
        // Check for terminal condition or implicit handoff
        if (stepData.done) {
           if (stepData.reward.total_score < 0 || stepData.observation.visible_sentiment_score < 0.3) {
               // Prevent abrupt disconnect, we force a handoff so the rep can save it
               setStatus("human-handoff");
               setMessages(prev => [...prev, { role: "system", content: "CUSTOMER AT RISK OF CHURN. SYSTEM INTERCEPTED HANGUP. HUMAN HANDOFF REQUIRED." }]);
               return;
           } else {
               setStatus("resolved");
               setMessages(prev => [...prev, { role: "system", content: "Call Successfully Resolved/Disconnected." }]);
               return;
           }
        }
        
        // Critical conditions force handoff
        if (sentiment < 0.2) {
           setStatus("human-handoff");
           setMessages(prev => [...prev, { role: "customer", content: stepData.observation.customer_message }, { role: "system", content: "CRITICAL SENTIMENT METRIC TRIGGERED. ALARM: HUMAN HANDOFF REQUIRED." }]);
           return;
        }

        // Push customer next message
        if (active) {
            setMessages(prev => [...prev, { role: "customer", content: stepData.observation.customer_message }]);
        }

      } catch (err) {
         console.error(err);
         setStatus("human-handoff");
         setMessages(prev => [...prev, { role: "system", content: "SYSTEM ERROR: Handing off to human." }]);
      }
    };

    if (status === "ai-active" && messages.length > 0 && messages[messages.length - 1].role === "customer") {
       // Simulate AI "typing" delay before requesting API
       const timer = setTimeout(() => {
          runAITurn();
       }, 2000);
       return () => { active = false; clearTimeout(timer); };
    }
  }, [messages, status, episodeId, sla, sentiment, patience]);

  const sendHumanAction = async (actionType: string) => {
    if (!humanInput || status !== "human-handoff") return;
    
    const myMsg = humanInput;
    setHumanInput("");
    setMessages(prev => [...prev, { role: "agent", content: myMsg, isAuto: false }]);
    
    try {
      const stepRes = await fetch("" + "/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episode_id: episodeId,
            action: {
              action_type: actionType,
              message: myMsg,
              concession_amount: actionType === "offer_resolution" ? 50 : 0
            }
          })
        });
        
        const stepData = await stepRes.json();
        
        setSla(stepData.observation.sla_remaining || 5);
        setSentiment(stepData.observation.visible_sentiment_score || 0.5);
        setPatience(3);
        
        if (stepData.done) {
           setStatus("resolved");
           setMessages(prev => [...prev, { role: "system", content: "Call successfully resolved/ended." }]);
        } else {
           setMessages(prev => [...prev, { role: "customer", content: stepData.observation.customer_message }]);
        }
    } catch(e) {
       console.error(e);
    }
  };

  return (
    <div className={`flex flex-col gap-6 h-[calc(100vh-4rem)] transition-colors duration-1000 \${status === 'human-handoff' ? 'bg-red-950/20' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {status === "human-handoff" && <AlertTriangle className="text-red-500 animate-pulse w-8 h-8" />}
            Live CRM Support Agent
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time autonomous AI interaction with fallback to manual dashboard.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={startCall} disabled={status !== "idle" && status !== "resolved"} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg">
            <PhoneCall className="w-4 h-4 mr-2" /> Simulate Incoming Call
          </Button>
        </div>
      </div>

      {!episodeId ? (
         <Card className="glass-card border-none bg-white/5 flex-1 flex flex-col items-center justify-center">
            <Radio className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl text-white/80">Waiting for Calls</h3>
            <p className="text-sm text-white/40">The AI Auto-Agent queue is currently empty.</p>
         </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* Main Transcript Panel */}
          <Card className={`glass-card border-none lg:col-span-8 flex flex-col overflow-hidden transition-all duration-500 \${status === 'human-handoff' ? 'border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] bg-black/40' : 'bg-white/5'}`}>
            <CardHeader className="border-b border-white/10 pb-4 flex flex-row items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                {status === "ai-active" ? (
                   <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse flex items-center gap-1">
                     <Bot className="w-3 h-3" /> AI Handling Call
                   </Badge>
                ) : status === "human-handoff" ? (
                   <Badge className="bg-red-500/20 text-red-500 border-red-500/40 animate-pulse flex items-center gap-1">
                     <User className="w-3 h-3" /> HUMAN INTERVENTION REQUIRED
                   </Badge>
                ) : status === "resolved" ? (
                   <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                     Resolved Confirmed
                   </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Radio className="w-4 h-4 text-green-400 animate-pulse" /> Live Transcript Feed
              </div>
            </CardHeader>

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef as any}>
              <div className="flex flex-col gap-4 pb-4">
                {messages.map((msg, i) => (
                   msg.role === "system" ? (
                     <div key={i} className="text-center w-full py-2">
                       <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider \${status === 'human-handoff' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white/50'}`}>
                         {msg.content}
                       </span>
                     </div>
                   ) : (
                     <div key={i} className={`flex gap-3 \${msg.role === 'agent' ? 'flex-row-reverse' : ''}`}>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 \${msg.role === 'customer' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : msg.isAuto ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-primary/20 text-primary border border-primary/20'}`}>
                         {msg.role === "customer" ? "C" : msg.isAuto ? <Bot className="w-4 h-4"/> : <User className="w-4 h-4"/>}
                       </div>
                       <div className={`p-3 text-sm max-w-[80%] shadow-lg \${msg.role === 'customer' ? 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm text-white/90' : msg.isAuto ? 'bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-tr-sm text-blue-50' : 'bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-sm text-white'}`}>
                         {msg.content}
                       </div>
                     </div>
                   )
                ))}
                {status === "ai-active" && messages.length > 0 && messages[messages.length - 1].role === "customer" && (
                   <div className="flex gap-3 flex-row-reverse opacity-50">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20"><Bot className="w-4 h-4 text-blue-400"/></div>
                     <div className="p-3 bg-blue-500/5 rounded-2xl rounded-tr-sm border border-blue-500/10 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                     </div>
                   </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Auto-Agent Voice Visualization */}
            {status === "ai-active" && (
               <div className="h-12 bg-blue-900/20 border-t border-blue-500/20 flex items-center justify-center gap-1">
                 {[...Array(30)].map((_, i) => (
                   <div key={i} className="bg-blue-500/50 w-1 rounded-full animate-pulse" style={{
                     height: `\${Math.max(10, Math.random() * 30)}px`,
                     animationDuration: `\${0.5 + Math.random()}s`
                   }}></div>
                 ))}
               </div>
            )}

            {/* Human Action Composer (Locked during AI) */}
            <div className={`p-4 border-t transition-colors \${status === 'human-handoff' ? 'bg-red-950/30 border-red-500/30' : 'bg-black/30 border-white/5'}`}>
               {status === "ai-active" ? (
                 <div className="text-center py-6 flex flex-col items-center opacity-50">
                    <Bot className="w-6 h-6 mb-2 text-white/50" />
                    <p className="text-sm font-medium text-white/80">Dashboard Locked</p>
                    <p className="text-xs text-white/40">AI CRM Agent is actively handling this call.</p>
                 </div>
               ) : status === "human-handoff" ? (
                 <div className="flex flex-col gap-3">
                   <div className="flex gap-2">
                     <Badge onClick={() => sendHumanAction('respond')} variant="outline" className="cursor-pointer bg-white/10 hover:bg-white/20 select-none">Manual Respond</Badge>
                     <Badge onClick={() => sendHumanAction('offer_resolution')} variant="outline" className="cursor-pointer bg-white/10 hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/30 select-none">Offer Resolution ($50)</Badge>
                   </div>
                   <div className="flex gap-3 relative">
                     <textarea 
                       value={humanInput}
                       onChange={e => setHumanInput(e.target.value)}
                       className="flex-1 bg-white/5 border border-red-500/30 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-400 resize-none h-20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                       placeholder="AI failed to resolve. Type message to save customer..."
                     ></textarea>
                     <Button onClick={() => sendHumanAction('respond')} className="absolute bottom-3 right-3 rounded-lg w-10 h-10 p-0 bg-red-600 hover:bg-red-500 text-white shadow-lg">
                       <Send className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-6 opacity-30">
                    <p className="text-sm text-white">Call Finished</p>
                 </div>
               )}
            </div>
          </Card>

          {/* Metrics Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <Card className={`glass-card border-none transition-colors \${status === 'human-handoff' ? 'bg-red-500/10' : 'bg-white/5'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className={`w-4 h-4 \${sla <= 2 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`} />
                  SLA Pressure Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-bold \${sla <= 2 ? 'text-red-500' : 'text-orange-400'}`}>{sla}</span>
                  <span className="text-xs text-white/50 mb-1">steps remaining</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 \${sla <= 2 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] w-[10%]' : 'bg-orange-400 w-[50%]'}`}></div>
                </div>
              </CardContent>
            </Card>

            <Card className={`glass-card border-none \${sentiment < 0.3 ? 'bg-red-500/10' : 'bg-white/5'}`}>
              <CardHeader className="pb-3 text-sm">
                <CardTitle className="font-medium flex items-center gap-2">
                  <HeartPulse className={`w-4 h-4 \${sentiment < 0.3 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
                  Live Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold text-white mb-2">{(sentiment || 0).toFixed(2)}</div>
                 <div className="flex gap-1 h-8 opacity-70">
                   <div className={`flex-1 rounded-l-md ${(sentiment || 0) <= 0.2 ? 'bg-red-500' : 'bg-white/10'}`}></div>
                   <div className={`flex-1 ${(sentiment || 0) > 0.2 && (sentiment || 0) <= 0.4 ? 'bg-orange-500' : 'bg-white/10'}`}></div>
                   <div className={`flex-1 ${(sentiment || 0) > 0.4 && (sentiment || 0) <= 0.6 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
                   <div className={`flex-1 ${(sentiment || 0) > 0.6 && (sentiment || 0) <= 0.8 ? 'bg-green-400' : 'bg-white/10'}`}></div>
                   <div className={`flex-1 rounded-r-md ${(sentiment || 0) > 0.8 ? 'bg-green-500' : 'bg-white/10'}`}></div>
                 </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}
    </div>
  );
}

export default function Studio() {
  return (
    <Suspense fallback={<div className="p-10 text-white/50">Loading Studio environment...</div>}>
      <StudioContent />
    </Suspense>
  );
}
