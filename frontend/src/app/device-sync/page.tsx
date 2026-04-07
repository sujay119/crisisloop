"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, RefreshCcw, Link as LinkIcon, PhoneCall } from "lucide-react";

export default function DeviceSyncPage() {
  const [url, setUrl] = useState<string>("");
  const [episodeId, setEpisodeId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const generateNewSession = async () => {
    setLoading(true);
    try {
      // Create a brand new episode session for the call
      const res = await fetch("" + "/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: "random" }),
      });
      const data = await res.json();
      const newEpisodeId = data.episode_id;
      setEpisodeId(newEpisodeId);
      
      // Determine the current host to point the QR code to the Mobile UI
      const currentOrigin = window.location.origin;
      setUrl(`${currentOrigin}/live-call?episode=${newEpisodeId}`);
    } catch (e) {
      console.error("Failed to generate session", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    generateNewSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-8 max-w-2xl mx-auto min-h-[80vh]">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
          <Smartphone className="w-10 h-10 text-primary" /> Device Sync
        </h1>
        <p className="text-muted-foreground text-lg">
          Scan this code with your mobile phone to simulate a live native voice call to the CrisisLoop AI Agent.
        </p>
      </div>

      <Card className="glass-card border-none bg-white/5 relative overflow-hidden w-full p-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <CardHeader className="text-center z-10 relative pb-2">
          <CardTitle className="text-2xl text-primary font-mono tracking-widest uppercase">Awaiting Connection</CardTitle>
          <CardDescription>Open your camera app to link your hardware</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 z-10 relative gap-6">
          
          {loading ? (
             <div className="w-64 h-64 bg-black/50 rounded-xl flex items-center justify-center border border-white/10 animate-pulse">
                <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
             </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-transform hover:scale-105 duration-500 relative">
              <QRCode 
                value={url} 
                size={256}
                bgColor="#ffffff"
                fgColor="#000000"
                level="Q"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-lg">
                 <PhoneCall className="w-8 h-8 text-primary" />
              </div>
            </div>
          )}

          <div className="text-center mt-4 w-full">
            <p className="text-xs text-white/50 mb-2 uppercase tracking-widest font-mono">Session ID: {episodeId}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={generateNewSession} variant="outline" className="bg-white/5 border-white/10">
                <RefreshCcw className="w-4 h-4 mr-2" /> Revoke & Regenerate
              </Button>
              <Button onClick={() => window.open(url, '_blank')} className="bg-white/10 hover:bg-white/20 border border-white/20">
                <LinkIcon className="w-4 h-4 mr-2" /> Open Locally
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-white/40 max-w-sm">
        Once scanned, your phone will utilize native WebRTC Microphones and TTS engines to simulate a 0-latency PBX connection.
      </div>
    </div>
  );
}
