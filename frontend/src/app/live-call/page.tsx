"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, PhoneOff, PhoneForwarded, Loader2, Volume2, ShieldAlert } from "lucide-react";

export default function LiveCall() {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "speaking" | "escalated">("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Keep screen awake and initialize audio context strictly on mobile tap
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) setAudioChunks((chunks) => [...chunks, e.data]);
        };

        recorder.onstop = async () => {
          setStatus("processing");
          // MediaRecorder chunks state won't be fully updated inside this synchronous callback,
          // so we rely on a ref or we process in a separate effect. 
          // For simplicity in React 18, we can just grab from State setter trick or use an accumulator.
        };

        setMediaRecorder(recorder);
      } catch (err) {
        console.error("Microphone access denied", err);
        alert("We need microphone access to do a live call!");
      }
    };
    initAudio();
  }, []);

  const startCall = () => {
    if (mediaRecorder) {
      setAudioChunks([]);
      mediaRecorder.start();
      setStatus("recording");
    }
  };

  const endCall = () => {
    if (mediaRecorder && status === "recording") {
      mediaRecorder.stop();
      // To ensure we get latest chunks, we handle upload after state merges
      setTimeout(() => uploadAndAnalyze(), 500); 
    }
  };

  const uploadAndAnalyze = async () => {
    setStatus("processing");
    // Get the chunks directly from the MediaRecorder instead of dealing with React state racing
    setAudioChunks((currentChunks) => {
       (async () => {
          const blob = new Blob(currentChunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", blob, "mobile_voice.webm");

          try {
            const res = await fetch("/boost/analyze-media", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            
            setTranscript(data.transcript_simulated || "Couldn't transcribe");
            const aiText = data.model_1_response || "I didn't catch that.";
            setAiResponse(aiText);
            
            // Speak response
            setStatus("speaking");
            
            // Escalation Check
            if (aiText.toLowerCase().includes("escalate") || aiText.toLowerCase().includes("human") || aiText.toLowerCase().includes("transfer")) {
               setStatus("escalated");
               return; // Skip speaking if escalated, route directly
            }

            const utterance = new SpeechSynthesisUtterance(aiText);
            utterance.onend = () => setStatus("idle");
            window.speechSynthesis.speak(utterance);

          } catch (e) {
             console.error(e);
             setStatus("idle");
          }
       })();
       return currentChunks; // no-op update
    });
  };

  const forceEscalate = () => {
    setStatus("escalated");
  };

  if (status === "escalated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-red-950 p-6 text-center shadow-inner relative">
         <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse"></div>
         <ShieldAlert className="w-24 h-24 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
         <h1 className="text-3xl font-black text-white mb-2 z-10">ESCALATION TRIGGERED</h1>
         <p className="text-red-200 z-10 mb-12">The AI has requested immediate Human Intervention. Routing to physical device...</p>
         <a href="tel:+1234567890" className="z-10 w-full max-w-sm rounded-[3rem] py-6 text-xl font-bold bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.6)] flex items-center justify-center gap-3 active:scale-95 transition-transform">
           <PhoneForwarded className="w-6 h-6" /> Complete Routing
         </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] p-8 pb-16 bg-black relative">
       {/* Background Glows */}
       <div className={`absolute top-[20%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] transition-all duration-1000 \${status === 'recording' ? 'bg-red-500/30 scale-150' : status === 'processing' ? 'bg-blue-500/30 animate-spin' : status === 'speaking' ? 'bg-green-500/30 scale-125 pulse' : 'bg-white/10'}`}></div>

       {/* Top Status */}
       <div className="text-center z-10 mt-12">
         <h1 className="text-2xl font-semibold text-white/90">CrisisLoop Ext. 921</h1>
         <p className="text-sm text-white/50 font-mono mt-2 uppercase tracking-widest">
           {status === "idle" ? "Connected" : status === "recording" ? "00:00:LIVE" : status === "processing" ? "Transcribing..." : "AI Speaking"}
         </p>
       </div>

       {/* Middle Avatar/Indicator */}
       <div className="flex-1 flex flex-col items-center justify-center w-full z-10 gap-8">
          <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-2xl \${status === 'recording' ? 'bg-red-500/20 border-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : status === 'processing' ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : status === 'speaking' ? 'bg-green-500/20 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)]' : 'bg-white/5 border-white/20'}`}>
            {status === "idle" ? <Mic className="w-16 h-16 text-white/50" /> : 
             status === "recording" ? <Volume2 className="w-16 h-16 text-red-500 animate-pulse" /> : 
             status === "processing" ? <Loader2 className="w-16 h-16 text-blue-500 animate-spin" /> :
             <Volume2 className="w-16 h-16 text-green-500 animate-bounce" />}
          </div>
          
          {/* Transcript Preview */}
          <div className="w-full max-w-sm h-32 flex flex-col items-center justify-center text-center">
             <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-mono">{status === 'speaking' ? 'Agent says:' : transcript ? 'You said:' : ''}</p>
             <p className="text-white/90 font-medium text-lg leading-snug line-clamp-3">
               {status === 'speaking' ? aiResponse : transcript}
             </p>
          </div>
       </div>

       {/* Bottom Controls */}
       <div className="w-full z-10 flex flex-col items-center gap-6">
         {status === "idle" ? (
           <button 
             onPointerDown={startCall} 
             onPointerUp={endCall}
             onPointerLeave={endCall}
             className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 transition-transform"
           >
             <Mic className="w-10 h-10 text-white" />
           </button>
         ) : status === "recording" ? (
           <button 
             onPointerUp={endCall}
             className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.8)] scale-110 active:scale-95 transition-transform"
           >
             <div className="w-8 h-8 bg-white rounded-sm animate-pulse"></div>
           </button>
         ) : null}

         <p className="text-white/40 text-sm font-medium">{status === "idle" ? "Hold to Speak" : status === "recording" ? "Release to Send" : ""}</p>
         
         <div className="absolute top-8 right-8">
            <button onClick={forceEscalate} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 text-white/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500">
               <PhoneOff className="w-5 h-5" />
            </button>
         </div>
       </div>
    </div>
  );
}
