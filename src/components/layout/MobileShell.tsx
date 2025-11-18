import { Wine } from "lucide-react";
import MobileNav from "./MobileNav";

interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-screen-sm px-6 py-3 flex items-center gap-3">
          <Wine className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">MenuX</p>
            <h1 className="text-base font-semibold">Premium Bar</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-screen-sm px-4 pb-20 pt-4">
        {children}
      </main>

      {/* Bottom Nav */}
      <MobileNav />
    </div>
  );
}