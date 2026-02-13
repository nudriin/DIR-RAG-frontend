import { NavLink, Outlet } from 'react-router-dom';
import { BarChart, Upload, Database, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { to: '/admin/evaluate', icon: BarChart, label: 'Evaluate' },
  { to: '/admin/ingest', icon: Upload, label: 'Ingest' },
  { to: '/admin/vectors/sources', icon: Database, label: 'Sources' },
  { to: '/admin/vectors/reset', icon: RotateCcw, label: 'Reset Vectors' },
  { to: '/admin/vectors/delete-by-source', icon: Trash2, label: 'Delete Source' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      <aside className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
        <ScrollArea className="h-full py-6 pr-6 pl-4">
          <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Admin Panel
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
