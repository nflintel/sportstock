import { Wallet, Eye, ArrowRightLeft } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Deposit Funds",
    description: "Add funds to your SportStock account using your preferred payment method securely.",
    color: "text-sport-pink",
    bg: "bg-sport-pink/10",
    border: "border-sport-pink/20",
  },
  {
    icon: Eye,
    title: "Watch the Market",
    description: "Analyze athlete performance, track trends, and identify opportunities to invest.",
    color: "text-sport-cyan",
    bg: "bg-sport-cyan/10",
    border: "border-sport-cyan/20",
  },
  {
    icon: ArrowRightLeft,
    title: "Make a Trade",
    description: "Buy and sell athlete shares in real-time. Build your dream sports portfolio.",
    color: "text-sport-purple",
    bg: "bg-sport-purple/10",
    border: "border-sport-purple/20",
  },
];

const HowItWorks = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How Does It <span className="gradient-text">Work?</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get started in three simple steps and begin trading athlete shares today.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px border-t-2 border-dashed border-border" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className={`relative mb-6 h-24 w-24 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <step.icon className={`h-10 w-10 ${step.color}`} />
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full gradient-pink-purple flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
