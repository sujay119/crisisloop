"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, UploadCloud, FileAudio, Zap, Loader2, PlayCircle } from "lucide-react";

export default function LLMBoostPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSimulateCall = async () => {
    // If no file is provided, we can simulate one to prevent breaking
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      // Create a dummy blob to send
      const blob = new Blob(["trigger"], { type: "text/plain" });
      formData.append("file", blob, "live_call.mp3");
    }

    setIsAnalyzing(true);
    setResults(null);
    try {
      const res = await fetch("" + "/boost/analyze-media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
      alert("Failed to reach API server. Ensure backend is running locally on port 8000");
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" /> Hugging Face Dual Boost
          </h1>
          <p className="text-muted-foreground mt-1 text-sm bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full border border-blue-500/20 inline-block">
            Powered by StepFun & Qwen
          </p>
        </div>
      </div>

      {!results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* File Upload Panel */}
          <Card className="glass-card border-none bg-white/5 border border-white/10 overflow-hidden relative">
            <CardHeader className="text-center z-10 relative">
              <CardTitle className="text-xl">Upload Media Reference</CardTitle>
              <CardDescription>Support for .mp3, .mp4 escalations</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8 z-10 relative gap-6">
              <label htmlFor="media-upload" className="w-full text-center cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 mx-auto flex items-center justify-center hover:bg-white/10 transition-all hover:border-primary">
                  {file ? <FileAudio className="w-10 h-10 text-blue-400" /> : <UploadCloud className="w-10 h-10 text-white/50" />}
                </div>
                <div className="mt-4 font-semibold text-white/80">{file ? file.name : "Drag & Drop or Click"}</div>
                <input id="media-upload" type="file" accept="audio/*,video/*" className="hidden" onChange={handleFileChange} />
              </label>
              <Button onClick={handleSimulateCall} disabled={!file || isAnalyzing} className="w-full bg-primary hover:bg-primary/90">
                {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />} 
                Analyze Upload
              </Button>
            </CardContent>
          </Card>

          {/* Live Call Panel */}
          <Card className="glass-card border-none bg-primary/5 border border-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="text-center z-10 relative">
              <CardTitle className="text-xl text-primary font-bold">Simulate Live Voice Call</CardTitle>
              <CardDescription>Intercept real-time transmission</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8 z-10 relative gap-6">
              <div className="relative">
                <div className={`absolute -inset-4 rounded-full blur-xl bg-primary/20 \${isAnalyzing ? 'animate-pulse bg-primary/50' : ''}`}></div>
                <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center relative">
                  <Mic className={`w-10 h-10 \${isAnalyzing ? 'text-primary animate-bounce' : 'text-primary/70'}`} />
                </div>
              </div>
              <div className="mt-2 text-primary font-medium">{isAnalyzing ? "Intercepting..." : "Ready to hook"}</div>
              <Button onClick={handleSimulateCall} disabled={isAnalyzing} variant="outline" className="w-full bg-white/5 border-primary/30 hover:bg-primary/20 text-white">
                {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />} 
                Trigger Demo Trace
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {isAnalyzing && !results && (
         <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
               <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
               <p className="text-lg font-medium text-white/80 animate-pulse">Running Parallel LLM Pipeline...</p>
               <p className="text-sm text-white/50">Querying Models via Hugging Face...</p>
            </div>
         </div>
      )}

      {results && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dual Detection Results</h2>
            <div className="flex gap-4 items-center">
              <div className="text-sm bg-white/10 px-3 py-1 rounded border border-white/10">Time: {results.process_time_ms}ms</div>
              <Button variant="outline" onClick={() => setResults(null)}>Reset</Button>
            </div>
          </div>
          
          <Card className="bg-black/40 border border-white/5 p-4 rounded-xl">
             <div className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Simulated Transcription Source</div>
             <p className="text-sm text-white/90 italic border-l-2 border-primary/50 pl-3 py-1">"{results.transcript_simulated}"</p>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model 1 Box */}
            <Card className="glass-card border-none bg-blue-500/5 relative overflow-hidden">
               <div className="absolute top-0 w-full h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
               <CardHeader className="pb-2 border-b border-white/5">
                 <CardTitle className="text-lg text-blue-400 font-mono flex items-center gap-2">
                   <Zap className="w-4 h-4" /> StepFun
                 </CardTitle>
                 <CardDescription className="text-xs">{results.model_1_name}</CardDescription>
               </CardHeader>
               <CardContent className="pt-4">
                 <div className="font-mono text-xs text-blue-100 whitespace-pre-wrap bg-black/30 p-4 rounded-xl border border-white/5 min-h-[150px]">
                   {results.model_1_response}
                 </div>
               </CardContent>
            </Card>

            {/* Model 2 Box */}
            <Card className="glass-card border-none bg-orange-500/5 relative overflow-hidden">
               <div className="absolute top-0 w-full h-1 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
               <CardHeader className="pb-2 border-b border-white/5">
                 <CardTitle className="text-lg text-orange-400 font-mono flex items-center gap-2">
                   <Zap className="w-4 h-4" /> Qwen
                 </CardTitle>
                 <CardDescription className="text-xs">{results.model_2_name}</CardDescription>
               </CardHeader>
               <CardContent className="pt-4">
                 <div className="font-mono text-xs text-orange-100 whitespace-pre-wrap bg-black/30 p-4 rounded-xl border border-white/5 min-h-[150px]">
                   {results.model_2_response}
                 </div>
               </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
