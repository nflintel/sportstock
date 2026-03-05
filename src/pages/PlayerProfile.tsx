import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const fantasyData = [
  { month: "Jan", value: 14 }, { month: "Feb", value: 21 }, { month: "Mar", value: 28 },
  { month: "Apr", value: 35 }, { month: "May", value: 25 }, { month: "Jun", value: 42 },
  { month: "Jul", value: 30 },
];

const priceData = [
  { month: "Jan", value: 7 }, { month: "Feb", value: 14 }, { month: "Mar", value: 21 },
  { month: "Apr", value: 35 }, { month: "May", value: 28 }, { month: "Jun", value: 42 },
  { month: "Jul", value: 38 },
];

const stats = [
  { label: "Games", value: "1.0" },
  { label: "Points", value: "15.6" },
  { label: "Assists", value: "2.9" },
  { label: "Rebounds", value: "3.6" },
  { label: "Steals", value: "1.4" },
  { label: "Minutes", value: "28.6" },
  { label: "Ftps", value: "25.6" },
];

const projections = {
  date: "2/4, 7:30 PM",
  opponent: "New York Knicks",
  opponentInitials: "NYK",
  stats: [
    { label: "Points", value: "27.96" },
    { label: "Assists", value: "5.98" },
    { label: "Rebounds", value: "5.61" },
    { label: "Blocks", value: "0.12" },
    { label: "Steals", value: "1.32" },
    { label: "Minutes", value: "32" },
  ],
};

const gameHistory = [
  { opponent: "DET", opponentInitials: "DET", date: "2/2/2021", points: 38, assists: 8, rebounds: 11, blocks: 0, steals: 3, minutes: 38, fpts: 66.2, projPts: 44.42 },
  { opponent: "MIN", opponentInitials: "MIN", date: "2/2/2021", points: 38, assists: 8, rebounds: 11, blocks: 0, steals: 3, minutes: 38, fpts: 66.2, projPts: 44.42 },
  { opponent: "TOR", opponentInitials: "TOR", date: "2/2/2021", points: 38, assists: 8, rebounds: 11, blocks: 0, steals: 3, minutes: 38, fpts: 66.2, projPts: 44.42 },
  { opponent: "POR", opponentInitials: "POR", date: "2/2/2021", points: 38, assists: 8, rebounds: 11, blocks: 0, steals: 3, minutes: 38, fpts: 66.2, projPts: 44.42 },
  { opponent: "SAC", opponentInitials: "SAC", date: "2/2/2021", points: 38, assists: 8, rebounds: 11, blocks: 0, steals: 3, minutes: 38, fpts: 66.2, projPts: 44.42 },
];

const upcomingGames = [
  { home: "New York Knicks", homeInitials: "NYK", away: "Phoenix Suns", awayInitials: "PHX", date: "Mar 14, 2026", time: "7:30 PM" },
  { home: "Atlanta Hawks", homeInitials: "ATL", away: "Miami Heat", awayInitials: "MIA", date: "Mar 14, 2026", time: "8:00 PM" },
  { home: "Cleveland Browns", homeInitials: "CLE", away: "Baltimore Ravens", awayInitials: "BAL", date: "Mar 15, 2026", time: "1:00 PM" },
];

const PlayerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: player } = useQuery({
    queryKey: ["player", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: holding } = useQuery({
    queryKey: ["holding", id],
    queryFn: async () => {
      const { data } = await supabase.from("holdings").select("*").eq("player_id", id!).single();
      return data;
    },
    enabled: !!id && !!user,
  });

  const userShares = holding?.shares ?? 0;
  const totalValue = userShares * (player?.price ?? 0);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Player header */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarFallback className="bg-secondary text-xl font-bold">{player?.initials ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link to="/league" className="text-xs text-muted-foreground hover:text-primary">← Back to League</Link>
                  <h1 className="text-2xl font-bold">{player?.name ?? "Loading..."}</h1>
                  <p className="text-sm text-muted-foreground">{player?.team}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-destructive/50 text-destructive">Sell</Button>
                  <Link to={`/trade/${id}`}>
                    <Button size="sm" className="gradient-pink-purple border-0 text-primary-foreground">Buy</Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <div className="text-lg font-bold">${totalValue.toFixed(2)}</div>
                  <div className="text-[11px] text-muted-foreground">Total Value ({userShares} Shares)</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <div className="text-lg font-bold">${(player?.price ?? 0).toFixed(2)}</div>
                  <div className="text-[11px] text-muted-foreground">Current Price</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <div className={`text-lg font-bold ${(player?.change_24h ?? 0) >= 0 ? "text-sport-green" : "text-destructive"}`}>
                    {(player?.change_24h ?? 0) >= 0 ? "+" : ""}{(player?.change_24h ?? 0).toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">24H Change</div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center rounded-lg bg-muted/30 p-2">
                    <div className="text-base font-bold">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-semibold mb-4">Fantasy Trends</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={fantasyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--sport-cyan))" strokeWidth={2} dot={{ fill: "hsl(var(--sport-cyan))", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-semibold mb-4">Price Trends</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--sport-pink))" strokeWidth={2} dot={{ fill: "hsl(var(--sport-pink))", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Projections */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-1">Next Game Projections</h3>
              <p className="text-xs text-muted-foreground mb-4">{projections.date}</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{projections.opponentInitials}</div>
                <span className="font-medium text-sm">{projections.opponent}</span>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {projections.stats.map((s) => (
                  <div key={s.label} className="text-center rounded-lg bg-muted/30 p-2">
                    <div className="text-base font-bold">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game History */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Game History</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Opponent</TableHead>
                      <TableHead className="text-xs text-center">Points</TableHead>
                      <TableHead className="text-xs text-center">Assists</TableHead>
                      <TableHead className="text-xs text-center">Rebounds</TableHead>
                      <TableHead className="text-xs text-center">Blocks</TableHead>
                      <TableHead className="text-xs text-center">Steals</TableHead>
                      <TableHead className="text-xs text-center">Minutes</TableHead>
                      <TableHead className="text-xs text-center">Fpts</TableHead>
                      <TableHead className="text-xs text-center">Proj Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameHistory.map((game, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold">{game.opponentInitials}</div>
                            <div>
                              <div className="font-medium">{game.opponent}</div>
                              <div className="text-muted-foreground text-[10px]">{game.date}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-center">{game.points}</TableCell>
                        <TableCell className="text-xs text-center">{game.assists}</TableCell>
                        <TableCell className="text-xs text-center">{game.rebounds}</TableCell>
                        <TableCell className="text-xs text-center">{game.blocks}</TableCell>
                        <TableCell className="text-xs text-center">{game.steals}</TableCell>
                        <TableCell className="text-xs text-center">{game.minutes}</TableCell>
                        <TableCell className="text-xs text-center font-semibold text-sport-green">{game.fpts}</TableCell>
                        <TableCell className="text-xs text-center">{game.projPts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">View More</Button>
              </div>
            </div>
          </div>

          {/* Upcoming Games sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Upcoming Games</h3>
              <Link to="/league" className="text-xs text-primary font-semibold hover:underline">VIEW ALL</Link>
            </div>
            <div className="space-y-3">
              {upcomingGames.map((game, i) => (
                <div key={i} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{game.homeInitials}</div>
                    <span className="text-xs font-medium">{game.home}</span>
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

export default PlayerProfile;
