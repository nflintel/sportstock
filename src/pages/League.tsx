import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, TrendingUp, TrendingDown, Trophy } from "lucide-react";

const players = [
  { id: 1, name: "Luguentz Dort", team: "Oklahoma City Thunder", sport: "NBA", price: 3.91, change: 8.12, initials: "LD" },
  { id: 2, name: "Naji Marshall", team: "New Orleans Pelicans", sport: "NBA", price: 5.24, change: 6.45, initials: "NM" },
  { id: 3, name: "Adam Thielen", team: "Minnesota Vikings", sport: "NFL", price: 7.80, change: -2.10, initials: "AT" },
  { id: 4, name: "Noah Fant", team: "Denver Broncos", sport: "NFL", price: 4.55, change: 3.30, initials: "NF" },
  { id: 5, name: "Russell Cage", team: "Atlanta Falcons", sport: "NFL", price: 2.90, change: 12.50, initials: "RC" },
  { id: 6, name: "Don Doyle", team: "Los Angeles Lakers", sport: "NBA", price: 6.15, change: -1.85, initials: "DD" },
  { id: 7, name: "Marcus Smart", team: "Memphis Grizzlies", sport: "NBA", price: 8.40, change: 4.70, initials: "MS" },
  { id: 8, name: "Tyler Herro", team: "Miami Heat", sport: "NBA", price: 9.25, change: 7.90, initials: "TH" },
  { id: 9, name: "Dak Prescott", team: "Dallas Cowboys", sport: "NFL", price: 11.60, change: -3.40, initials: "DP" },
  { id: 10, name: "Mookie Betts", team: "Los Angeles Dodgers", sport: "MLB", price: 14.20, change: 5.60, initials: "MB" },
];

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

  const filteredPlayers = players
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (activeTab === "best") return b.change - a.change;
      if (activeTab === "worst") return a.change - b.change;
      return b.id - a.id;
    });

  const tabs: { key: Tab; label: string }[] = [
    { key: "best", label: "Best" },
    { key: "worst", label: "Worst" },
    { key: "recent", label: "Recent" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Trophy className="h-4 w-4" />
            <span>Trading</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">NBA Players</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main player table */}
          <div className="flex-1">
            {/* Tabs + search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
                <Input
                  placeholder="Search players..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Player list */}
            <div className="space-y-2">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-secondary text-xs font-bold">
                        {player.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{player.name}</div>
                      <div className="text-xs text-muted-foreground">{player.team}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <div className="font-bold text-sm">${player.price.toFixed(2)}</div>
                      <div className={`text-xs font-semibold flex items-center gap-1 ${player.change >= 0 ? "text-sport-green" : "text-destructive"}`}>
                        {player.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {player.change >= 0 ? "+" : ""}{player.change.toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-8 border-destructive/50 text-destructive hover:bg-destructive/10">
                        SELL
                      </Button>
                      <Button size="sm" className="text-xs h-8 gradient-pink-purple text-primary-foreground border-0">
                        BUY
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" className="px-8">
                View More
              </Button>
            </div>
          </div>

          {/* Upcoming Games sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Upcoming Games</h3>
              <button className="text-xs text-primary font-semibold hover:underline">VIEW ALL</button>
            </div>
            <div className="space-y-3">
              {upcomingGames.map((game, i) => (
                <div key={i} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {game.homeInitials}
                      </div>
                      <span className="text-xs font-medium">{game.home}</span>
                    </div>
                  </div>
                  <div className="text-center text-xs font-bold text-primary mb-3">VS</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                      {game.awayInitials}
                    </div>
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
