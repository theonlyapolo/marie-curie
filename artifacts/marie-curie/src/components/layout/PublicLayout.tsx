import { ReactNode } from "react";

export function PublicLayout({ children, hideNav = false }: { children: ReactNode, hideNav?: boolean }) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background overflow-x-hidden text-foreground selection:bg-primary selection:text-primary-foreground relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-4xl px-4 py-8 flex-grow flex flex-col z-10">
        {children}
      </div>
    </div>
  );
}
