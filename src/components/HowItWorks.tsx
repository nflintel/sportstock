import { Wallet, Eye, ArrowRightLeft } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Deposit Funds",
    description: "Add funds to your SportStock account using your preferred payment method securely.",
    number: "01",
  },
  {
    icon: Eye,
    title: "Watch the Market",
    description: "Analyze athlete performance, track trends, and identify opportunities to invest.",
    number: "02",
  },
  {
    icon: ArrowRightLeft,
    title: "Make a Trade",
    description: "Buy and sell athlete shares in real-time. Build your dream sports portfolio.",
    number: "03",
  },
];

const HowItWorks = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripe" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block border-b-4 border-primary pb-2 mb-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              How Does It <span className="gradient-text">Work?</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto font-medium">
            Get started in three simple steps and begin trading athlete shares today.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[calc(50%+60px)] w-[calc(100%-120px)] h-1 bg-gradient-to-r from-primary/40 to-primary/10" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {/* Large number background */}
                  <div className="text-8xl font-extrabold text-primary/10 absolute -top-4 -left-4 select-none">
                    {step.number}
                  </div>
                  <div className="relative h-24 w-24 bg-card border-2 border-primary/30 flex items-center justify-center transition-all group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-foreground mb-2 uppercase">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
