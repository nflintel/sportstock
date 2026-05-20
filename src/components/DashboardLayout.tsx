import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await supabase.from("wallets").select("balance").single();
      return data;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("display_name, level").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b px-3 sm:px-4 bg-card shrink-0">
            <SidebarTrigger className="ml-1 shrink-0" />
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-1.5 text-sm bg-muted/50 rounded-md px-2 sm:px-3 py-1.5">
                    <Wallet className="h-3.5 w-3.5 text-sport-green shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm">${wallet?.balance?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <ThemeToggle />
                  <Link to="/profile">
                    <Avatar className="h-8 w-8 border border-border hover:border-primary transition-colors">
                      <AvatarFallback className="bg-secondary text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-sm transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link to="/auth">
                    <Button size="sm" className="gradient-pink-purple border-0 text-primary-foreground text-xs">
                      LOG IN
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
