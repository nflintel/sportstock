import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const upcomingGames = [
  { home: "New York Knicks", homeInitials: "NYK", away: "Phoenix Suns", awayInitials: "PHX", date: "Mar 14, 2026", time: "7:30 PM" },
  { home: "Atlanta Hawks", homeInitials: "ATL", away: "Miami Heat", awayInitials: "MIA", date: "Mar 14, 2026", time: "8:00 PM" },
  { home: "Cleveland Browns", homeInitials: "CLE", away: "Baltimore Ravens", awayInitials: "BAL", date: "Mar 15, 2026", time: "1:00 PM" },
  { home: "LA Lakers", homeInitials: "LAL", away: "Boston Celtics", awayInitials: "BOS", date: "Mar 15, 2026", time: "5:30 PM" },
];

type Tab = "best" | "worst" | "recent";

const League = () => {
  const [activeTab, setActiveTab] = useState<Tab>("best");
  const [search, setSearch] = useState("");

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredPlayers = players
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (activeTab === "best") return b.change_24h - a.change_24h;
      if (activeTab === "worst") return a.change_24h - b.change_24h;
      return 0;
    });

  const tabs: { key: Tab; label: string }[] = [
    { key: "best", label: "Best" },
    { key: "worst", label: "Worst" },
    { key: "recent", label: "Recent" },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Trophy className="h-4 w-4" />
            <span>Trading</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">NBA Players</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 sm:mb-6">
              <div className="flex gap-1 bg-muted rounded-lg p-1 self-start sm:self-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading players...</div>
            ) : (
              <div className="space-y-2">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border bg-card hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border shrink-0">
                        <AvatarFallback className="bg-secondary text-xs font-bold">{player.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link to={`/player/${player.id}`} className="font-semibold text-sm hover:text-primary transition-colors block truncate">
                          {player.name}
                        </Link>
                        <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-2">
                      <div className="text-right hidden xs:block">
                        <div className="font-bold text-sm">${player.price.toFixed(2)}</div>
                        <div className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${player.change_24h >= 0 ? "text-sport-green" : "text-destructive"}`}>
                          {player.change_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {player.change_24h >= 0 ? "+" : ""}{player.change_24h.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-right xs:hidden">
                        <div className={`text-xs font-bold flex items-center gap-0.5 ${player.change_24h >= 0 ? "text-sport-green" : "text-destructive"}`}>
                          {player.change_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {player.change_24h >= 0 ? "+" : ""}{player.change_24h.toFixed(1)}%
                        </div>
                        <div className="font-bold text-xs">${player.price.toFixed(0)}</div>
                      </div>
                      <Link to={`/trade/${player.id}`}>
                        <Button size="sm" className="text-xs h-8 px-3 sm:px-4 gradient-pink-purple text-primary-foreground border-0">BUY</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Games sidebar */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Upcoming Games</h3>
              <button className="text-xs text-primary font-semibold hover:underline">VIEW ALL</button>
            </div>
            <div className="space-y-3">
              {upcomingGames.map((game, i) => (
                <div key={i} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{game.homeInitials}</div>
                      <span className="text-xs font-medium">{game.home}</span>
                    </div>
                  </div>
                  <div className="text-center text-xs font-bold text-primary mb-3">VS</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{game.awayInitials}</div>
                    <span className="text-xs font-medium">{game.away}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2">
                    <span>{game.date}</span>
                    <span>{game.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default League;
