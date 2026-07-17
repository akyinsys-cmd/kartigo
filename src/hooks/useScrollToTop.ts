import { useLayoutEffect } from 'react';

export function useScrollToTop(trigger: any) {
  useLayoutEffect(() => {
    // Force browser to top instantly before paint
    const forceScroll = () => {
      const anchor = document.getElementById('top-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'instant' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    forceScroll();
    
    // Fallback for some browsers or race conditions
    const t1 = setTimeout(forceScroll, 0);
    const t2 = setTimeout(forceScroll, 50);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [trigger]);
}
