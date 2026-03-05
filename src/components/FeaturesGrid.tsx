import { Shield, Eye, Trophy, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Bank-level encryption protects every transaction you make on the platform.",
  },
  {
    icon: Eye,
    title: "Transparent",
    description: "Real-time data and open pricing. No hidden fees, no surprises.",
  },
  {
    icon: Trophy,
    title: "Multi-Sports",
    description: "Trade across NBA, NFL, MLB, and more — all from one unified platform.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated team is available around the clock to help you succeed.",
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripe" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block border-b-4 border-primary pb-2 mb-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Play All Sports in <span className="gradient-text">One Place</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto font-medium">
            Everything you need to trade athlete stocks, all under one roof.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group border border-border bg-card/60 backdrop-blur-sm p-6 text-center transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden"
            >
              {/* Number accent */}
              <div className="absolute top-2 right-3 text-6xl font-extrabold text-primary/5 select-none">
                0{i + 1}
              </div>
              
              <div className="mx-auto mb-5 h-14 w-14 bg-primary/10 flex items-center justify-center transition-all group-hover:bg-primary/20">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-extrabold text-foreground mb-2 uppercase">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
