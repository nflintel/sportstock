import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const players = [
  { name: "LeBron James", team: "Lakers", sport: "NBA", price: "$47.82", change: "+12.4%", initials: "LJ", positive: true },
  { name: "Patrick Mahomes", team: "Chiefs", sport: "NFL", price: "$52.15", change: "+8.7%", initials: "PM", positive: true },
  { name: "Shohei Ohtani", team: "Dodgers", sport: "MLB", price: "$61.30", change: "+15.2%", initials: "SO", positive: true },
  { name: "Stephen Curry", team: "Warriors", sport: "NBA", price: "$39.45", change: "-2.1%", initials: "SC", positive: false },
  { name: "Travis Kelce", team: "Chiefs", sport: "NFL", price: "$34.90", change: "+5.3%", initials: "TK", positive: true },
  { name: "Aaron Judge", team: "Yankees", sport: "MLB", price: "$44.20", change: "+9.8%", initials: "AJ", positive: true },
  { name: "Jayson Tatum", team: "Celtics", sport: "NBA", price: "$38.75", change: "+6.1%", initials: "JT", positive: true },
  { name: "Josh Allen", team: "Bills", sport: "NFL", price: "$49.60", change: "+11.5%", initials: "JA", positive: true },
];

const sportColors: Record<string, string> = {
  NBA: "bg-sport-pink/20 text-sport-pink",
  NFL: "bg-sport-cyan/20 text-sport-cyan",
  MLB: "bg-sport-purple/20 text-sport-purple",
};

const PlayerCardsCarousel = () => {
  const doubled = [...players, ...players];

  return (
    <section id="market" className="py-20 overflow-hidden">
      <div className="container mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Trending <span className="gradient-text">Athletes</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Explore top-performing athlete stocks and start building your portfolio today.
        </p>
      </div>

      <div className="relative">
        <div className="flex gap-5 animate-scroll-left hover:[animation-play-state:paused]">
          {doubled.map((player, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-56 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 transition-all hover:card-glow hover:scale-105 hover:bg-card/80"
            >
              <div className="flex items-center justify-between mb-4">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarFallback className="bg-secondary text-foreground font-bold text-sm">
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sportColors[player.sport]}`}>
                  {player.sport}
                </span>
              </div>
              <div className="text-sm font-semibold text-foreground">{player.name}</div>
              <div className="text-xs text-muted-foreground mb-3">{player.team}</div>
              <div className="flex items-end justify-between">
                <div className="text-lg font-bold text-foreground">{player.price}</div>
                <div className={`text-xs font-semibold ${player.positive ? "text-sport-green" : "text-destructive"}`}>
                  {player.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlayerCardsCarousel;
