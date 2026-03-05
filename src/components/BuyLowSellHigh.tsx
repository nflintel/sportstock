import { TrendingUp, BarChart3, Smartphone, Users } from "lucide-react";
import basketballImg from "@/assets/basketball-action.jpg";

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
    <section id="trade" className="py-24 relative overflow-hidden">
      <div className="container grid gap-16 lg:grid-cols-2 items-center">
        {/* Image side */}
        <div className="relative">
          <div className="relative overflow-hidden ea-clip">
            <img
              src={basketballImg}
              alt="Basketball player in action"
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="text-6xl font-extrabold gradient-text text-shadow-heavy">
                Buy Low
              </div>
              <div className="text-6xl font-extrabold gradient-text text-shadow-heavy">
                Sell High
              </div>
            </div>
          </div>
          {/* Accent bar */}
          <div className="h-2 gradient-ea w-3/4" />
        </div>

        {/* Features side */}
        <div>
          <div className="border-l-4 border-primary pl-6 mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Maximize Your <span className="gradient-text">Returns</span>
            </h2>
            <p className="text-muted-foreground max-w-lg font-medium">
              Just like the stock market, athlete share prices fluctuate based on performance. 
              Spot the opportunity and dominate.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 border-l-2 border-transparent bg-card/40 backdrop-blur-sm transition-all hover:border-primary hover:bg-card/70 group"
              >
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground mb-1 uppercase">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{feature.description}</p>
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
