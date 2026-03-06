import { TrendingUp, TrendingDown, Zap } from "lucide-react";

const tickerItems = [
  { name: "LeBron James", sport: "NBA", price: 47.82, change: +2.14, pct: "+4.7%" },
  { name: "Patrick Mahomes", sport: "NFL", price: 52.15, change: +1.83, pct: "+3.6%" },
  { name: "Shohei Ohtani", sport: "MLB", price: 61.30, change: +4.20, pct: "+7.4%" },
  { name: "Stephen Curry", sport: "NBA", price: 39.45, change: -0.85, pct: "-2.1%" },
  { name: "Travis Kelce", sport: "NFL", price: 34.90, change: +1.72, pct: "+5.2%" },
  { name: "Aaron Judge", sport: "MLB", price: 44.20, change: +3.91, pct: "+9.7%" },
  { name: "Jayson Tatum", sport: "NBA", price: 38.75, change: +2.30, pct: "+6.3%" },
  { name: "Josh Allen", sport: "NFL", price: 49.60, change: -1.10, pct: "-2.2%" },
  { name: "Nikola Jokic", sport: "NBA", price: 55.10, change: +3.50, pct: "+6.8%" },
  { name: "Lamar Jackson", sport: "NFL", price: 46.80, change: +2.60, pct: "+5.9%" },
];

const sportBadgeColor: Record<string, string> = {
  NBA: "text-primary",
  NFL: "text-accent",
  MLB: "text-sport-purple",
};

const LiveTicker = () => {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-sport-navy-deep border-b border-border/20 overflow-hidden">
      {/* Live indicator */}
      <div className="absolute left-0 top-0 h-full z-10 flex items-center gap-1.5 px-3 bg-sport-navy-deep border-r border-border/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sport-green opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sport-green" />
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sport-green">Live</span>
      </div>

      <div className="flex items-center h-full animate-ticker-scroll hover:[animation-play-state:paused]">
        {doubled.map((item, i) => {
          const positive = item.change >= 0;
          return (
            <div key={i} className="flex items-center gap-2 px-5 h-full shrink-0 border-r border-border/10">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${sportBadgeColor[item.sport]}`}>
                {item.sport}
              </span>
              <span className="text-xs font-bold text-foreground/90 whitespace-nowrap">{item.name}</span>
              <span className="text-xs font-extrabold text-foreground">${item.price.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 text-[11px] font-extrabold ${positive ? "text-sport-green" : "text-destructive"}`}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {item.pct}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveTicker;
