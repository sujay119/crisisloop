export default function MobileLayout({ children }: { children: React.ReactNode }) {
  // Mobile isolated view wrapper
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-primary/30 m-0 p-0 overflow-hidden">
      {children}
    </div>
  );
}
