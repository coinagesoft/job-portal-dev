'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WowInit() {
  const pathname = usePathname();

  useEffect(() => {
    let timeoutId;
    let attempts = 0;
    const maxAttempts = 50;

    const initWow = () => {
      if (typeof window !== 'undefined' && window.WOW) {
        try {
          const wow = new window.WOW({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 0,
            mobile: true,
            live: false,
          });
          wow.init();
        } catch (e) {
          console.warn('WOW.js initialization failed:', e);
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        timeoutId = setTimeout(initWow, 100);
      }
    };

    // Wait for the browser to finish any pending paint/hydration
    timeoutId = setTimeout(initWow, 50);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
}

