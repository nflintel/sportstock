import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Trade", href: "#trade" },
  { label: "Market", href: "#market" },
  { label: "Madden Leagues", href: "/madden" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  return (
    <>
      <header className={`fixed top-0 sm:top-8 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled ? "border-border/50 bg-background/95 backdrop-blur-xl shadow-sm" : "border-border/30 bg-background/80 backdrop-blur-xl"}`}>
        <div className="container px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
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
              className="text-foreground p-1.5 rounded-sm hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-background border-l border-border/50 shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <span className="font-extrabold uppercase tracking-wider text-foreground">
            Sport<span className="text-primary">Stock</span>
          </span>
          <button
            onClick={close}
            className="text-muted-foreground hover:text-foreground p-1 rounded-sm transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-5 py-4 gap-1 flex-1 overflow-y-auto">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold uppercase tracking-widest text-muted-foreground py-3 px-3 hover:text-primary hover:bg-muted/50 rounded-sm transition-colors"
                onClick={close}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-bold uppercase tracking-widest text-muted-foreground py-3 px-3 hover:text-primary hover:bg-muted/50 rounded-sm transition-colors"
                onClick={close}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-border/30 flex flex-col gap-3">
          <Link to="/auth" onClick={close}>
            <Button variant="outline" className="w-full font-bold uppercase rounded-none">
              Log In
            </Button>
          </Link>
          <Link to="/auth" onClick={close}>
            <Button className="gradient-ea border-0 text-primary-foreground rounded-none font-bold uppercase w-full">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
