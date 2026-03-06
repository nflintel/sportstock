import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Trade", href: "#trade" },
  { label: "Market", href: "#market" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-8 left-0 right-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center gradient-ea">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold uppercase tracking-wider text-foreground">
            Sport<span className="text-primary">Stock</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/auth">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider text-sm rounded-none">
              Log In
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="gradient-ea border-0 text-primary-foreground hover:opacity-90 font-bold uppercase tracking-wider text-sm rounded-none">
              Sign Up
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold uppercase tracking-widest text-muted-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link to="/auth">
              <Button className="gradient-ea border-0 text-primary-foreground mt-2 rounded-none font-bold uppercase w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
