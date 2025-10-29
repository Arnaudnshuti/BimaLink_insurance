import { useEffect } from 'react';

/**
 * Blocks browser back navigation on the current page.
 * Optionally clears session caches to discourage bfcache reuse.
 */
export function useNoBackNavigation(options: { clearSession?: boolean } = {}) {
  const { clearSession = true } = options;

  useEffect(() => {
    const push = () => {
      try {
        window.history.pushState(null, document.title, window.location.href);
      } catch (_) {
        // ignore
      }
    };

    // Prime history so back goes to the same URL
    push();

    const onPopState = () => {
      // Immediately push state again, effectively negating back navigation
      push();
    };

    window.addEventListener('popstate', onPopState);

    // Best-effort cache/session clearing for sensitive pages
    if (clearSession) {
      try {
        sessionStorage.clear();
      } catch (_) {}
      if ('caches' in window) {
        try {
          caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
        } catch (_) {}
      }
    }

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [clearSession]);
}