import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  CalendarDays,
  FileQuestion,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  LineChart,
  ListChecks,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  Target,
  LogOut,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/subjects", label: "My Subjects", icon: BookOpen },
  { to: "/syllabus", label: "Syllabus", icon: ListChecks },
  { to: "/notes", label: "Notes & Documents", icon: FileText },
  { to: "/papers", label: "Previous Papers", icon: Library },
  { to: "/tutor", label: "AI Tutor", icon: MessageSquare },
  { to: "/questions", label: "Question Generator", icon: FileQuestion },
  { to: "/test", label: "Mock Test", icon: GraduationCap },
  { to: "/mistakes", label: "Mistake Explainer", icon: Brain },
  { to: "/planner", label: "Study Planner", icon: CalendarDays },
  { to: "/analytics", label: "Progress", icon: LineChart },
  { to: "/weak-topics", label: "Weak Topics", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/tutor", label: "Tutor", icon: MessageSquare },
  { to: "/planner", label: "Planner", icon: CalendarDays },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = path === item.to || path.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <Link to="/dashboard" className="flex items-center gap-2 px-5 py-5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold">ExamSense</span>
        </Link>
        <ScrollArea className="flex-1">
          <NavLinks />
        </ScrollArea>
        <div className="border-t p-3">
          <p className="truncate px-2 pb-2 text-xs text-muted-foreground">{user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="px-5 py-5 font-display text-lg font-semibold">ExamSense</div>
              <ScrollArea className="h-[calc(100vh-9rem)]">
                <NavLinks onNavigate={() => setOpen(false)} />
              </ScrollArea>
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="size-4" /> Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-display text-base font-semibold">ExamSense</span>
        </header>

        <main className="flex-1 pb-24 lg:pb-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-background/95 backdrop-blur lg:hidden">
          {MOBILE_NAV.map((item) => {
            const active = path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
