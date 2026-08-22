import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref to attach to a section, and whether that section is active.
 * Useful for highlighting nav links as the user scrolls.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    els.forEach((el) => io.observe(el));
    observerRef.current = io;
    return () => io.disconnect();
  }, [ids.join(',')]);

  return active;
}
