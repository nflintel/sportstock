import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import heroImg from "@/assets/hero-sports.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={heroImg}
          alt="Professional athlete in action under bright stadium lights during sports competition"
          priority={true}
          lazy={false}
          width={1920}
          height={1080}
          objectFit="cover"
          className="w-full h-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
      </div>

      {/* Diagonal accent stripe */}
      <div className="absolute top-0 right-0 w-2 h-full gradient-ea opacity-80" />
      
      <div className="container relative z-10 pb-16 sm:pb-20 pt-32 sm:pt-44 lg:pt-48">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-none border-l-4 border-primary bg-primary/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-5 sm:mb-6">MORE THAN A GAME
            <Zap className="h-3 w-3" />
            It's in the game
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[0.9] tracking-tight text-foreground mb-5 sm:mb-6">
            Trade Like a{" "}
            <span className="gradient-text">Champion</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-lg font-medium mb-7 sm:mb-8">
            Buy and sell athlete shares like stocks. Build your ultimate sports portfolio and dominate the market.
          </p>

          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12">
            <Button
              size="lg"
              className="gradient-ea border-0 text-primary-foreground text-sm sm:text-base px-8 sm:px-10 font-bold uppercase tracking-wider hover:opacity-90 glow-pink rounded-none h-12 sm:h-14">
              Start Trading
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-foreground/20 text-foreground hover:bg-foreground/10 text-sm sm:text-base px-6 sm:px-8 font-bold uppercase tracking-wider rounded-none h-12 sm:h-14">
              Watch Demo
            </Button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-0 border-l-4 border-primary overflow-x-auto">
            {[
            { value: "50K+", label: "Active Traders" },
            { value: "$2M+", label: "Traded Daily" },
            { value: "200+", label: "Athletes" }].
            map((stat, i) =>
            <div key={i} className="px-4 sm:px-6 py-3 border-r border-border/30 last:border-r-0 shrink-0">
                <div className="text-xl sm:text-2xl font-extrabold text-foreground">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground font-semibold whitespace-nowrap">{stat.label}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;