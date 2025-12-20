import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook để theo dõi khi element xuất hiện trong viewport
 * Optimized for performance with minimal re-renders
 */
const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0,
    rootMargin = "200px 0px",
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const hasTriggered = useRef(false);

  const ref = useCallback(
    (node) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || (triggerOnce && hasTriggered.current)) {
        return;
      }

      elementRef.current = node;

      // Use requestIdleCallback for non-critical observation setup
      const setupObserver = () => {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !hasTriggered.current) {
              setIsIntersecting(true);
              if (triggerOnce) {
                hasTriggered.current = true;
                observerRef.current?.disconnect();
              }
            } else if (!triggerOnce && !entry.isIntersecting) {
              setIsIntersecting(false);
            }
          },
          { threshold, rootMargin }
        );

        if (elementRef.current) {
          observerRef.current.observe(elementRef.current);
        }
      };

      // Schedule observer setup during idle time
      if ("requestIdleCallback" in window) {
        requestIdleCallback(setupObserver, { timeout: 100 });
      } else {
        setupObserver();
      }
    },
    [threshold, rootMargin, triggerOnce]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isIntersecting];
};

export default useIntersectionObserver;
