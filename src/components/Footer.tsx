import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Twitter, Github, Instagram } from "lucide-react";
import heroImg from "@/assets/hero-sports.jpg";

const Footer = () => {
  return (
    <footer>
      {/* Footer CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Sports action" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <div className="container relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-foreground mb-6 uppercase">
              Experience the Future of{" "}
              <span className="gradient-text">Fantasy Sports</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg font-medium">
              Join 50,000+ traders already winning on SportStock. Sign up today and get your first trade free.
            </p>
            <Button
              size="lg"
              className="gradient-ea border-0 text-primary-foreground text-base px-12 hover:opacity-90 glow-pink font-extrabold uppercase tracking-wider rounded-none h-14"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer links */}
      <div className="border-t border-border bg-card/30">
        <div className="container py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center gradient-ea">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-extrabold uppercase tracking-wider text-foreground">
                  Sport<span className="text-primary">Stock</span>
                </span>
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                The premier platform for trading athlete shares. Invest in sports like never before.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-foreground mb-4 uppercase text-sm tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Trade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Market</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Portfolio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Leaderboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-foreground mb-4 uppercase text-sm tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-foreground mb-4 uppercase text-sm tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              © 2026 SportStock. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-9 w-9 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
