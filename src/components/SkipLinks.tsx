import { cn } from "@/lib/utils";

const SkipLinks = () => {
  const skipLinkClass = cn(
    "absolute left-0 top-0 z-[9999]",
    "bg-primary text-primary-foreground",
    "px-4 py-2 font-medium",
    "transform -translate-y-full",
    "focus:translate-y-0",
    "transition-transform duration-200",
    "outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  );

  const handleSkipToMain = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.addEventListener('blur', () => {
        main.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  const handleSkipToNav = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (nav) {
      const firstLink = nav.querySelector('a, button');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  };

  const handleSkipToFooter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const footer = document.querySelector('footer');
    if (footer) {
      footer.setAttribute('tabindex', '-1');
      footer.focus();
      footer.addEventListener('blur', () => {
        footer.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return (
    <>
      <a
        href="#main-content"
        className={skipLinkClass}
        onClick={handleSkipToMain}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className={skipLinkClass}
        onClick={handleSkipToNav}
      >
        Skip to navigation
      </a>
      <a
        href="#footer"
        className={skipLinkClass}
        onClick={handleSkipToFooter}
      >
        Skip to footer
      </a>
    </>
  );
};

export default SkipLinks;
