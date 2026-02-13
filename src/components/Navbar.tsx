import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <NavLink to="/" className="flex items-center gap-2 font-bold transition-colors hover:text-primary/80">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="hidden text-xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent sm:inline-block">
            Huma Betang
          </span>
        </NavLink>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-1 md:gap-2">
            <NavLink
              to="/conversation"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Conversation
            </NavLink>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Debug Chat
            </NavLink>
            <NavLink
              to="/admin"
              className={() =>
                `px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                  location.pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Admin
            </NavLink>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
