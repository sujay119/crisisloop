"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ShieldCheck, Mail, MessageSquare, Hash, Zap } from "lucide-react";

export default function SettingsPage() {
  const [connections, setConnections] = useState({
    email: { connected: true, label: "IMAP/SMTP Server" },
    sms: { connected: false, label: "Twilio SMS API" },
    slack: { connected: false, label: "Slack Webhook" },
    discord: { connected: false, label: "Discord Bot Token" }
  });

  const toggleConnection = (key: keyof typeof connections) => {
    setConnections(prev => ({
      ...prev,
      [key]: { ...prev[key], connected: !prev[key].connected }
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" /> Application Integrations
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure Omnichannel Python Agent credentials and connections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        
        {/* Email */}
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
               <div className="flex items-center gap-2"><Mail className="text-blue-400 w-5 h-5"/> {connections.email.label}</div>
               {connections.email.connected ? <Badge className="bg-green-500/20 text-green-400">Connected</Badge> : <Badge className="bg-white/10 text-white/50">Disconnected</Badge>}
            </CardTitle>
            <CardDescription>Python MailAgent IMAP listener</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col gap-3">
                <input type="text" placeholder="imap.server.com" className="bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-primary w-full" defaultValue={connections.email.connected ? "imap.crisisloop.enterprise" : ""} />
                <input type="password" placeholder="App Password" className="bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-primary w-full" defaultValue={connections.email.connected ? "*********" : ""} />
                <Button variant={connections.email.connected ? "destructive" : "default"} className="mt-2" onClick={() => toggleConnection("email")}>
                  {connections.email.connected ? "Disconnect" : "Authorize Connect"}
                </Button>
             </div>
          </CardContent>
        </Card>

        {/* SMS / Twilio */}
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
               <div className="flex items-center gap-2"><MessageSquare className="text-green-400 w-5 h-5"/> {connections.sms.label}</div>
               {connections.sms.connected ? <Badge className="bg-green-500/20 text-green-400">Connected</Badge> : <Badge className="bg-white/10 text-white/50">Disconnected</Badge>}
            </CardTitle>
            <CardDescription>Python Twilio PythonAgent bounds</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col gap-3">
                <input type="text" placeholder="Twilio Account SID" className="bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-primary w-full" defaultValue={connections.sms.connected ? "ACfc5..." : ""} />
                <input type="password" placeholder="Auth Token" className="bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-primary w-full" defaultValue={connections.sms.connected ? "*********" : ""} />
                <Button variant={connections.sms.connected ? "destructive" : "default"} className="mt-2" onClick={() => toggleConnection("sms")}>
                  {connections.sms.connected ? "Disconnect" : "Authorize Connect"}
                </Button>
             </div>
          </CardContent>
        </Card>

        {/* Slack */}
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
               <div className="flex items-center gap-2"><Hash className="text-orange-400 w-5 h-5"/> {connections.slack.label}</div>
               {connections.slack.connected ? <Badge className="bg-green-500/20 text-green-400">Connected</Badge> : <Badge className="bg-white/10 text-white/50">Disconnected</Badge>}
            </CardTitle>
            <CardDescription>Python SlackAgent Webhook Pipeline</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col gap-3">
                <input type="password" placeholder="https://hooks.slack.com/services/..." className="bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-primary w-full" defaultValue="" />
                <Button variant={connections.slack.connected ? "destructive" : "default"} className="mt-2" onClick={() => toggleConnection("slack")}>
                  {connections.slack.connected ? "Disconnect" : "Authorize Connect"}
                </Button>
             </div>
          </CardContent>
        </Card>

        {/* Discord */}
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
               <div className="flex items-center gap-2"><Zap className="text-purple-400 w-5 h-5"/> {connections.discord.label}</div>
               {connections.discord.connected ? <Badge className="bg-green-500/20 text-green-400">Connected</Badge> : <Badge className="bg-white/10 text-white/50">Disconnected</Badge>}
            </CardTitle>
            <CardDescription>Python Discord Bot Application</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col gap-3">
                <input type="password" placeholder="Bot Token" className="bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-primary w-full" defaultValue="" />
                <Button variant={connections.discord.connected ? "destructive" : "default"} className="mt-2" onClick={() => toggleConnection("discord")}>
                  {connections.discord.connected ? "Disconnect" : "Authorize Connect"}
                </Button>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
