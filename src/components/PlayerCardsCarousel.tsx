import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import basketballImg from "@/assets/basketball-action.jpg";
import footballImg from "@/assets/football-action.jpg";
import baseballImg from "@/assets/baseball-action.jpg";

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
  NBA: "bg-primary/20 text-primary",
  NFL: "bg-accent/20 text-accent",
  MLB: "bg-sport-purple/20 text-sport-purple",
};

const sportImages: Record<string, string> = {
  NBA: basketballImg,
  NFL: footballImg,
  MLB: baseballImg,
};

const PlayerCardsCarousel = () => {
  const doubled = [...players, ...players];

  return (
    <section id="market" className="py-20 overflow-hidden relative">
      <div className="absolute inset-0 diagonal-stripe" />
      <div className="container mb-12 text-center relative z-10">
        <div className="inline-block border-b-4 border-primary pb-2 mb-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Trending <span className="gradient-text">Athletes</span>
          </h2>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto font-medium">
          Explore top-performing athlete stocks and start building your portfolio today.
        </p>
      </div>

      <div className="relative">
        <div className="flex gap-5 animate-scroll-left hover:[animation-play-state:paused]">
          {doubled.map((player, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-60 rounded-none border border-border bg-card/80 backdrop-blur-sm overflow-hidden transition-all hover:card-glow hover:scale-105 hover:border-primary/50 group"
            >
              {/* Sport image header */}
              <div className="h-24 relative overflow-hidden">
                <img
                  src={sportImages[player.sport]}
                  alt={player.sport}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <span className={`absolute top-2 right-2 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 ${sportColors[player.sport]}`}>
                  {player.sport}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/30 rounded-none">
                    <AvatarFallback className="bg-secondary text-foreground font-extrabold text-sm rounded-none">
                      {player.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-bold text-foreground uppercase">{player.name}</div>
                    <div className="text-xs text-muted-foreground font-semibold">{player.team}</div>
                  </div>
                </div>
                <div className="flex items-end justify-between border-t border-border pt-3">
                  <div className="text-xl font-extrabold text-foreground">{player.price}</div>
                  <div className={`text-xs font-extrabold ${player.positive ? "text-sport-green" : "text-destructive"}`}>
                    {player.change}
                  </div>
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
