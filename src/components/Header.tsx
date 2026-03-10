import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Trade", href: "#trade" },
  { label: "Market", href: "#market" },
  { label: "Madden Leagues", href: "/madden" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 sm:top-8 left-0 right-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
      <div className="container px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center gradient-ea">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>
          <span className="text-base sm:text-xl font-extrabold uppercase tracking-wider text-foreground">
            Sport<span className="text-primary">Stock</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 lg:gap-8 md:flex">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-xs lg:text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-xs lg:text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <ThemeToggle />
          <Link to="/auth">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider text-xs lg:text-sm rounded-none px-3 lg:px-4">
              Log In
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="gradient-ea border-0 text-primary-foreground hover:opacity-90 font-bold uppercase tracking-wider text-xs lg:text-sm rounded-none px-3 lg:px-4">
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            className="text-foreground p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl">
          <div className="container px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-bold uppercase tracking-widest text-muted-foreground py-2 hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-bold uppercase tracking-widest text-muted-foreground py-2 hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full font-bold uppercase rounded-none">
                  Log In
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button className="gradient-ea border-0 text-primary-foreground rounded-none font-bold uppercase w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
