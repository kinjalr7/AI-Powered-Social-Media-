'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  PieChart, 
  Share2, 
  Settings, 
  LogOut,
  User,
  Bell,
  Search,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Charts", href: "/charts", icon: PieChart },
  { name: "Social Data", href: "/social-data", icon: Share2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === '/login') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground hidden lg:block">
            AI Social Intel
          </span>
        </Link>

        {/* Navigation Tabs (Pills) */}
        <div className="hidden md:flex items-center bg-muted/50 border border-border rounded-full p-1 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden xl:flex items-center bg-muted border border-border rounded-lg px-3 py-1.5 gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-xs text-foreground w-24 focus:w-40 transition-all"
            />
          </div>

          <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          </button>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                {mounted && (
                  <>
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : 
                     theme === 'light' ? <Sun className="w-5 h-5" /> : 
                     <Monitor className="w-5 h-5" />}
                  </>
                )}
                {!mounted && <div className="w-5 h-5" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground p-1 min-w-[120px]">
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md px-2 py-1.5 text-sm"
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md px-2 py-1.5 text-sm"
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("system")}
                className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md px-2 py-1.5 text-sm"
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 pl-1 pr-2 rounded-full hover:bg-muted transition-all border border-transparent hover:border-border">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                    {session?.user?.name?.[0] || 'K'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-foreground leading-none">{session?.user?.name || 'Kinjal Patel'}</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-1">Admin Account</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground p-2">
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-bold truncate text-foreground">{session?.user?.email || 'kinjal@example.com'}</p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-lg px-2 py-2 text-sm font-medium">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-lg px-2 py-2 text-sm font-medium">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                className="hover:bg-destructive/10 cursor-pointer text-destructive focus:text-destructive rounded-lg px-2 py-2 text-sm font-medium"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
