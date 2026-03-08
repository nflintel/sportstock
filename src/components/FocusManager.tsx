import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FocusManager = () => {
  const location = useLocation();

  useEffect(() => {
    const announcer = document.getElementById('route-announcer');
    if (announcer) {
      const pageName = getPageName(location.pathname);
      announcer.textContent = `Navigated to ${pageName}`;
    }

    const timer = setTimeout(() => {
      const main = document.querySelector('main');
      if (main) {
        const h1 = main.querySelector('h1');
        const focusTarget = h1 || main;

        if (focusTarget instanceof HTMLElement) {
          focusTarget.setAttribute('tabindex', '-1');
          focusTarget.focus();

          focusTarget.addEventListener('blur', () => {
            focusTarget.removeAttribute('tabindex');
          }, { once: true });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};

const getPageName = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/': 'Home',
    '/auth': 'Authentication',
    '/trade': 'Trade',
    '/portfolio': 'Portfolio',
    '/league': 'League',
    '/profile': 'User Profile'
  };

  const match = Object.entries(routes).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  );

  if (match) {
    return match[1];
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    return segments[segments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return 'Page';
};

export default FocusManager;
