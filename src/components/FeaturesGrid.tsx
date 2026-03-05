import { Shield, Eye, Trophy, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Bank-level encryption protects every transaction you make on the platform.",
    color: "text-sport-pink",
    bg: "bg-sport-pink/10",
  },
  {
    icon: Eye,
    title: "Transparent",
    description: "Real-time data and open pricing. No hidden fees, no surprises.",
    color: "text-sport-cyan",
    bg: "bg-sport-cyan/10",
  },
  {
    icon: Trophy,
    title: "Multi-Sports",
    description: "Trade across NBA, NFL, MLB, and more — all from one unified platform.",
    color: "text-sport-purple",
    bg: "bg-sport-purple/10",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated team is available around the clock to help you succeed.",
    color: "text-sport-green",
    bg: "bg-sport-green/10",
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sport-purple/5 blur-[150px]" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Play All Sports in <span className="gradient-text">One Place</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to trade athlete stocks, all under one roof.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 text-center transition-all hover:card-glow hover:bg-card/60 hover:scale-105"
            >
              <div className={`mx-auto mb-5 h-14 w-14 rounded-xl ${feature.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
