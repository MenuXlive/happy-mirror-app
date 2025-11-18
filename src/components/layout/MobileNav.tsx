import { Home, Wine, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItemBase = "flex flex-col items-center justify-center gap-1 text-xs";
const activeClass = "text-primary";

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-sm px-6 py-2">
        <div className="grid grid-cols-3 gap-4 text-muted-foreground">
          <NavLink to="/" className={navItemBase} activeClassName={activeClass}>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/menu" className={navItemBase} activeClassName={activeClass}>
            <Wine className="h-5 w-5" />
            <span>Menu</span>
          </NavLink>
          <NavLink to="/auth" className={navItemBase} activeClassName={activeClass}>
            <ShieldCheck className="h-5 w-5" />
            <span>Admin</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}