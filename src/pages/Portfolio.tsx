import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

const COLORS = [
  "hsl(var(--sport-pink))",
  "hsl(var(--sport-cyan))",
  "hsl(var(--sport-green))",
  "hsl(var(--sport-purple))",
  "hsl(262 80% 60%)",
  "hsl(30 90% 55%)",
  "hsl(190 80% 50%)",
  "hsl(340 75% 55%)",
];

const Portfolio = () => {
  const { user } = useAuth();

  const { data: holdings = [] } = useQuery({
    queryKey: ["my-holdings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("holdings")
        .select("*, players(id, name, initials, price, team, change_24h)")
        .gt("shares", 0);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: trades = [] } = useQuery({
    queryKey: ["my-trades-full"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*, players(name, initials)")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
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

  const portfolioItems = holdings.map((h: any) => {
    const currentValue = h.shares * (h.players?.price ?? 0);
    const costBasis = h.shares * h.avg_buy_price;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, currentValue, costBasis, pnl, pnlPercent };
  });

  const totalValue = portfolioItems.reduce((s: number, h: any) => s + h.currentValue, 0);
  const totalCost = portfolioItems.reduce((s: number, h: any) => s + h.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const pieData = portfolioItems.map((h: any) => ({
    name: h.players?.name ?? "Unknown",
    value: h.currentValue,
  }));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">Portfolio</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="rounded-xl border bg-card p-3 sm:p-5">
            <div className="text-xs text-muted-foreground mb-1">Portfolio Value</div>
            <div className="text-xl sm:text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border bg-card p-3 sm:p-5">
            <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
            <div className={`text-xl sm:text-2xl font-bold flex items-center gap-1 ${totalPnl >= 0 ? "text-sport-green" : "text-destructive"}`}>
              {totalPnl >= 0 ? <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />}
              ${Math.abs(totalPnl).toFixed(2)}
            </div>
            <div className={`text-xs font-medium ${totalPnl >= 0 ? "text-sport-green" : "text-destructive"}`}>
              {totalPnl >= 0 ? "+" : ""}{totalPnlPercent.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-xl border bg-card p-3 sm:p-5">
            <div className="text-xs text-muted-foreground mb-1">Wallet</div>
            <div className="text-xl sm:text-2xl font-bold">${wallet?.balance?.toFixed(2) ?? "0.00"}</div>
          </div>
          <div className="rounded-xl border bg-card p-3 sm:p-5">
            <div className="text-xs text-muted-foreground mb-1">Positions</div>
            <div className="text-xl sm:text-2xl font-bold">{holdings.length}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-5 sm:space-y-6">
            {/* Holdings table */}
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Holdings</h3>
              {portfolioItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No holdings yet.</p>
                  <Link to="/league" className="text-primary hover:underline text-sm font-medium">Browse players to start trading →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {portfolioItems.map((h: any) => (
                    <Link
                      key={h.id}
                      to={`/player/${h.players?.id}`}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl border hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border shrink-0">
                          <AvatarFallback className="bg-secondary text-xs font-bold">{h.players?.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{h.players?.name}</div>
                          <div className="text-xs text-muted-foreground">{h.shares} sh · avg ${h.avg_buy_price.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="font-bold text-sm">${h.currentValue.toFixed(2)}</div>
                        <div className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${h.pnl >= 0 ? "text-sport-green" : "text-destructive"}`}>
                          {h.pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          <span className="hidden xs:inline">${Math.abs(h.pnl).toFixed(2)} </span>({h.pnl >= 0 ? "+" : ""}{h.pnlPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trade history timeline */}
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Trade History</h3>
              {trades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No trades yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {trades.map((t: any) => (
                      <div key={t.id} className="flex gap-4 relative">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          t.trade_type === "buy" ? "bg-sport-green/20 text-sport-green" : "bg-destructive/20 text-destructive"
                        }`}>
                          {t.trade_type === "buy" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`text-xs font-bold uppercase ${t.trade_type === "buy" ? "text-sport-green" : "text-destructive"}`}>
                                {t.trade_type}
                              </span>
                              <span className="text-sm font-semibold ml-2">{t.players?.name}</span>
                            </div>
                            <span className="font-bold text-sm">${t.total.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{t.shares} shares @ ${t.price_per_share.toFixed(2)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(t.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: pie chart */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0">
            <div className="rounded-xl border bg-card p-4 sm:p-6 lg:sticky lg:top-4">
              <h3 className="font-bold text-lg mb-4">Allocation</h3>
              {pieData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {pieData.map((item: any, i: number) => {
                      const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                      return (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-medium">{pct.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
