import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, BarChart3, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-sport-pink/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-sport-cyan/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sport-purple/5 blur-[150px]" />

      <div className="container relative z-10 grid gap-12 lg:grid-cols-2 items-center">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground self-center lg:self-start">
            <Zap className="h-3 w-3 text-sport-cyan" />
            The future of fantasy sports is here
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-foreground">
            The New Way to{" "}
            <span className="gradient-text">Invest in Sports</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
            Trade athlete shares like stocks. Buy low, sell high, and build your
            portfolio with the sports you love.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              className="gradient-pink-purple border-0 text-primary-foreground text-base px-8 hover:opacity-90 glow-pink"
            >
              Start Trading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-secondary text-base px-8"
            >
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center gap-8 justify-center lg:justify-start mt-4">
            <div>
              <div className="text-2xl font-bold text-foreground">50K+</div>
              <div className="text-xs text-muted-foreground">Active Traders</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <div className="text-2xl font-bold text-foreground">$2M+</div>
              <div className="text-xs text-muted-foreground">Traded Daily</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <div className="text-2xl font-bold text-foreground">200+</div>
              <div className="text-xs text-muted-foreground">Athletes</div>
            </div>
          </div>
        </div>

        {/* Decorative illustration */}
        <div className="relative hidden lg:flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* Central glow */}
            <div className="absolute inset-0 rounded-full gradient-pink-purple opacity-20 blur-3xl" />
            
            {/* Floating cards */}
            <div className="absolute top-4 right-0 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 card-glow animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-pink-purple flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">LeBron James</div>
                  <div className="text-xs text-sport-green">+12.4%</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-0 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 card-glow animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-sport-cyan/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-sport-cyan" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Portfolio</div>
                  <div className="text-xs text-sport-green">+$1,240</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 card-glow animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl font-bold gradient-text">$47.82</div>
                <div className="text-xs text-muted-foreground">Current Price</div>
                <div className="flex gap-1 mt-2">
                  {[40, 55, 35, 65, 50, 70, 60, 80, 75, 90].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full bg-sport-green/60"
                      style={{ height: `${h * 0.5}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
