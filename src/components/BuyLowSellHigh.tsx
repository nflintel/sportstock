import { TrendingUp, BarChart3, Smartphone, Users } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Players Value",
    description: "Athletes' stock prices reflect their real-world performance.",
  },
  {
    icon: TrendingUp,
    title: "Invest Smart",
    description: "Use data-driven insights to make informed trading decisions.",
  },
  {
    icon: Smartphone,
    title: "Trade from Anywhere",
    description: "Access your portfolio and trade on any device, anytime.",
  },
];

const BuyLowSellHigh = () => {
  return (
    <section id="trade" className="py-24">
      <div className="container grid gap-16 lg:grid-cols-2 items-center">
        {/* Illustration side */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 rounded-3xl gradient-pink-purple opacity-10 blur-2xl" />
            <div className="relative h-full rounded-3xl border border-border bg-card/40 backdrop-blur-sm p-8 flex flex-col justify-center items-center gap-6">
              <div className="text-5xl font-extrabold gradient-text">Buy Low</div>
              <div className="flex gap-1 items-end">
                {[20, 35, 25, 45, 30, 55, 40, 65, 50, 75, 60, 85, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className="w-3 rounded-t-sm transition-all"
                    style={{
                      height: `${h * 1.5}px`,
                      background: `linear-gradient(to top, hsl(var(--sport-pink)), hsl(var(--sport-cyan)))`,
                      opacity: 0.4 + (i / 14) * 0.6,
                    }}
                  />
                ))}
              </div>
              <div className="text-5xl font-extrabold gradient-text">Sell High</div>
              <BarChart3 className="h-16 w-16 text-sport-cyan/40" />
            </div>
          </div>
        </div>

        {/* Features side */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Buy Low, <span className="gradient-text">Sell High</span>
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg">
            Just like the stock market, athlete share prices fluctuate based on performance. 
            Spot the opportunity and maximize your returns.
          </p>

          <div className="flex flex-col gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/40 backdrop-blur-sm transition-all hover:card-glow hover:bg-card/60"
              >
                <div className="h-12 w-12 rounded-xl bg-sport-pink/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6 text-sport-pink" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyLowSellHigh;
