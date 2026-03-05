import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Twitter, Github, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer>
      {/* Footer CTA */}
      <section className="py-24">
        <div className="container text-center">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 rounded-full bg-sport-pink/10 blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-6">
                Experience the Future of{" "}
                <span className="gradient-text">Fantasy Sports</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
                Join 50,000+ traders already winning on SportStock. Sign up today and get your first trade free.
              </p>
              <Button
                size="lg"
                className="gradient-pink-purple border-0 text-primary-foreground text-base px-10 hover:opacity-90 glow-pink"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer links */}
      <div className="border-t border-border">
        <div className="container py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-pink-purple">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  Sport<span className="text-primary">Stock</span>
                </span>
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The premier platform for trading athlete shares. Invest in sports like never before.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Trade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Market</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Portfolio</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Leaderboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 SportStock. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
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
