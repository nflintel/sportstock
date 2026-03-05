import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const upcomingGames = [
  { home: "New York Knicks", homeInitials: "NYK", away: "Phoenix Suns", awayInitials: "PHX", date: "Mar 14, 2026", time: "7:30 PM" },
  { home: "Atlanta Hawks", homeInitials: "ATL", away: "Miami Heat", awayInitials: "MIA", date: "Mar 14, 2026", time: "8:00 PM" },
  { home: "Cleveland Browns", homeInitials: "CLE", away: "Baltimore Ravens", awayInitials: "BAL", date: "Mar 15, 2026", time: "1:00 PM" },
];

const Trade = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState(10);
  const pricePerShare = 1.85;
  const subtotal = shares * pricePerShare;
  const fee = subtotal * 0.025;
  const total = subtotal + fee;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main trading area */}
          <div className="flex-1">
            {/* Player header */}
            <div className="rounded-xl border bg-card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <Link to="/player/stephen-curry">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarFallback className="bg-secondary text-lg font-bold">SC</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to="/player/stephen-curry" className="text-xl font-bold hover:text-primary transition-colors">
                    Stephen Curry
                  </Link>
                  <p className="text-sm text-muted-foreground">Golden State Warriors</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className="text-lg font-bold">0.00</div>
                  <div className="text-[11px] text-muted-foreground">Total Value (0 Shares)</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className="text-lg font-bold">$1.06</div>
                  <div className="text-[11px] text-muted-foreground">Current Price</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className="text-lg font-bold text-sport-green">+0.21 (11%)</div>
                  <div className="text-[11px] text-muted-foreground">24H Change</div>
                </div>
              </div>
            </div>

            {/* Buy/Sell form */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
                <button
                  onClick={() => setActiveTab("buy")}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    activeTab === "buy"
                      ? "gradient-pink-purple text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  BUY SHARES
                </button>
                <button
                  onClick={() => setActiveTab("sell")}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    activeTab === "sell"
                      ? "bg-destructive text-destructive-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  SELL SHARES
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Amount of Shares to {activeTab === "buy" ? "Buy" : "Sell"}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={shares}
                    onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-lg font-semibold"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {shares} Shares × ${pricePerShare.toFixed(2)}:
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">2.5% Fee:</span>
                    <span className="font-medium">${fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className={`w-full h-12 text-sm font-bold ${
                    activeTab === "buy"
                      ? "gradient-pink-purple border-0 text-primary-foreground"
                      : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {activeTab === "buy" ? "BUY SHARES NOW" : "SELL SHARES NOW"}
                </Button>
              </div>
            </div>
          </div>

          {/* Upcoming Games sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Upcoming Games</h3>
              <Link to="/league" className="text-xs text-primary font-semibold hover:underline">
                VIEW ALL
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingGames.map((game, i) => (
                <div key={i} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                      {game.homeInitials}
                    </div>
                    <span className="text-xs font-medium">{game.home}</span>
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

export default Trade;
