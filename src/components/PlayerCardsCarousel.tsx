import OptimizedImage from "@/components/OptimizedImage";
import basketballImg from "@/assets/basketball-action.jpg";
import footballImg from "@/assets/football-action.jpg";
import baseballImg from "@/assets/baseball-action.jpg";

import lebronImg from "@/assets/players/lebron-james.png";
import mahomesImg from "@/assets/players/patrick-mahomes.png";
import ohtaniImg from "@/assets/players/shohei-ohtani.png";
import curryImg from "@/assets/players/stephen-curry.png";
import kelceImg from "@/assets/players/travis-kelce.png";
import judgeImg from "@/assets/players/aaron-judge.png";
import tatumImg from "@/assets/players/jayson-tatum.png";
import allenImg from "@/assets/players/josh-allen.png";
import jokicImg from "@/assets/players/nikola-jokic.png";
import jacksonImg from "@/assets/players/lamar-jackson.png";

const players = [
  { name: "LeBron James", team: "Lakers", sport: "NBA", price: "$47.82", change: "+12.4%", positive: true, avatar: lebronImg, stats: { ppg: "25.4", rpg: "7.2", apg: "8.1" } },
  { name: "Patrick Mahomes", team: "Chiefs", sport: "NFL", price: "$52.15", change: "+8.7%", positive: true, avatar: mahomesImg, stats: { pass: "4,183", td: "26", qbr: "78.9" } },
  { name: "Shohei Ohtani", team: "Dodgers", sport: "MLB", price: "$61.30", change: "+15.2%", positive: true, avatar: ohtaniImg, stats: { avg: ".304", hr: "54", rbi: "130" } },
  { name: "Stephen Curry", team: "Warriors", sport: "NBA", price: "$39.45", change: "-2.1%", positive: false, avatar: curryImg, stats: { ppg: "26.8", rpg: "4.5", apg: "5.1" } },
  { name: "Travis Kelce", team: "Chiefs", sport: "NFL", price: "$34.90", change: "+5.3%", positive: true, avatar: kelceImg, stats: { rec: "93", yds: "1,084", td: "5" } },
  { name: "Aaron Judge", team: "Yankees", sport: "MLB", price: "$44.20", change: "+9.8%", positive: true, avatar: judgeImg, stats: { avg: ".322", hr: "58", rbi: "144" } },
  { name: "Jayson Tatum", team: "Celtics", sport: "NBA", price: "$38.75", change: "+6.1%", positive: true, avatar: tatumImg, stats: { ppg: "27.0", rpg: "8.1", apg: "4.6" } },
  { name: "Josh Allen", team: "Bills", sport: "NFL", price: "$49.60", change: "+11.5%", positive: true, avatar: allenImg, stats: { pass: "4,306", td: "28", qbr: "82.4" } },
  { name: "Nikola Jokić", team: "Nuggets", sport: "NBA", price: "$55.40", change: "+14.3%", positive: true, avatar: jokicImg, stats: { ppg: "26.4", rpg: "12.4", apg: "9.0" } },
  { name: "Lamar Jackson", team: "Ravens", sport: "NFL", price: "$46.85", change: "+10.2%", positive: true, avatar: jacksonImg, stats: { pass: "3,678", td: "24", qbr: "84.1" } },
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
    <section id="market" className="py-20 overflow-hidden relative" aria-label="Trending athlete stocks">
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
            <article
              key={i}
              className="flex-shrink-0 w-60 rounded-none border border-border bg-card/80 backdrop-blur-sm overflow-hidden transition-all hover:card-glow hover:scale-105 hover:border-primary/50 group"
            >
              {/* Sport image header with player portrait */}
              <div className="h-32 relative overflow-hidden">
                <OptimizedImage
                  src={sportImages[player.sport]}
                  alt={`${player.sport} basketball court action scene`}
                  lazy={true}
                  width={240}
                  height={128}
                  objectFit="cover"
                  className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

                {/* Player portrait overlay */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 overflow-hidden rounded-none border-2 border-primary/40">
                  <OptimizedImage
                    src={player.avatar}
                    alt={`${player.name} professional headshot photo for stock trading card`}
                    lazy={true}
                    width={80}
                    height={80}
                    objectFit="cover"
                    className="w-full h-full object-top"
                  />
                </div>

                <span className={`absolute top-2 right-2 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 ${sportColors[player.sport]}`}>
                  {player.sport}
                </span>

                {/* Stat overlay on hover */}
                <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {Object.entries(player.stats).map(([key, val], si) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 opacity-0 group-hover:animate-stat-slide-up"
                      style={{ animationDelay: `${si * 80}ms` }}
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{key}</span>
                      <span className="text-sm font-extrabold text-primary">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="text-center mb-3">
                  <div className="text-sm font-bold text-foreground uppercase">{player.name}</div>
                  <div className="text-xs text-muted-foreground font-semibold">{player.team}</div>
                </div>
                <div className="flex items-end justify-between border-t border-border pt-3">
                  <div className="text-xl font-extrabold text-foreground">{player.price}</div>
                  <div className={`text-xs font-extrabold ${player.positive ? "text-sport-green" : "text-destructive"}`}>
                    {player.change}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlayerCardsCarousel;
