import { useEffect, useState } from 'react';

export default function useHashRoute() {
  const [hash, setHash] = useState<string>(() => window.location.hash || '#/setup');
  useEffect(() => {
    const on = () => setHash(window.location.hash || '#/setup');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const nav = (h: string) => { if (!h.startsWith('#')) h = '#' + h; window.location.hash = h; };
  return [hash, nav] as const;
}
