import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const revenueData = [
  { month: "Jan", value: 4200 }, { month: "Feb", value: 3800 }, { month: "Mar", value: 5100 },
  { month: "Apr", value: 4600 }, { month: "May", value: 6200 }, { month: "Jun", value: 5800 },
  { month: "Jul", value: 7100 }, { month: "Aug", value: 6500 }, { month: "Sep", value: 5400 },
  { month: "Oct", value: 7800 }, { month: "Nov", value: 8200 }, { month: "Dec", value: 9100 },
];

const friendSuggestions = [
  { name: "Kurt Shaw", initials: "KS", followers: "2,239", following: "5,339" },
  { name: "Dennis Meyer", initials: "DM", followers: "2,239", following: "5,339" },
  { name: "Lyle Reed", initials: "LR", followers: "2,239", following: "5,339" },
  { name: "Larry Chavez", initials: "LC", followers: "2,239", following: "5,339" },
];

type Tab = "about" | "holdings" | "stats";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await supabase.from("wallets").select("balance").single();
      return data;
    },
    enabled: !!user,
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ["my-holdings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("holdings")
        .select("*, players(name, initials, price, team)")
        .gt("shares", 0);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: trades = [] } = useQuery({
    queryKey: ["my-trades"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!user,
  });

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const totalPortfolioValue = holdings.reduce((sum: number, h: any) => sum + h.shares * (h.players?.price ?? 0), 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "about", label: "About" },
    { key: "holdings", label: "Holdings" },
    { key: "stats", label: "Stats" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Profile header */}
        <div className="rounded-xl border bg-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarFallback className="bg-secondary text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full gradient-pink-purple flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                {profile?.level ?? 1}
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold">{profile?.display_name ?? "User"}</h1>
                <div className="h-5 w-5 rounded-full gradient-pink-purple flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground">✓</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground justify-center sm:justify-start">
                <MapPin className="h-3 w-3" />
                <span>{user?.email ?? ""}</span>
              </div>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <div className="text-xl font-bold">{profile?.followers_count ?? 0}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Followers</div>
              </div>
              <div>
                <div className="text-xl font-bold">{profile?.following_count ?? 0}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {activeTab === "about" && (
              <>
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-bold mb-3">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile?.bio ?? "Passionate sports investor and fantasy enthusiast. Building a diversified portfolio of athlete stocks across NBA, NFL, and MLB."}
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Revenue Statistics</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" fill="hsl(var(--sport-cyan))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold">${wallet?.balance?.toFixed(2) ?? "0.00"}</div>
                      <div className="text-xs text-muted-foreground">Wallet Balance</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold text-sport-green">${totalPortfolioValue.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Portfolio Value</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "holdings" && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">Your Holdings</h3>
                {holdings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No holdings yet. Start trading!</p>
                ) : (
                  <div className="space-y-3">
                    {holdings.map((h: any) => (
                      <div key={h.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarFallback className="bg-secondary text-xs font-bold">{h.players?.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold">{h.players?.name}</div>
                            <div className="text-xs text-muted-foreground">{h.shares} shares @ ${h.avg_buy_price.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">${(h.shares * (h.players?.price ?? 0)).toFixed(2)}</div>
                          <div className={`text-xs ${(h.players?.price ?? 0) > h.avg_buy_price ? "text-sport-green" : "text-destructive"}`}>
                            {((((h.players?.price ?? 0) - h.avg_buy_price) / h.avg_buy_price) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">Trading Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Trades", value: trades.length.toString() },
                    { label: "Active Positions", value: holdings.length.toString() },
                    { label: "Portfolio Value", value: `$${totalPortfolioValue.toFixed(0)}` },
                    { label: "Wallet Balance", value: `$${wallet?.balance?.toFixed(0) ?? "0"}` },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Find Friends sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <h3 className="font-bold text-lg mb-4">Find Friends</h3>
            <div className="space-y-3">
              {friendSuggestions.map((friend, i) => (
                <div key={i} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-secondary text-xs font-bold">{friend.initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-bold uppercase">{friend.name}</div>
                  </div>
                  <div className="flex gap-4 text-center mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-bold">{friend.followers}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Followers</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{friend.following}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Following</div>
                    </div>
                  </div>
                  <Button size="sm" className="w-full gradient-pink-purple border-0 text-primary-foreground text-xs">FOLLOW</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
