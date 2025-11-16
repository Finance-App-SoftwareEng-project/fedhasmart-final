/**
 * useSwipe Hook
 * 
 * Custom React hook for detecting swipe gestures on touch devices.
 * Provides callbacks for swipe directions (left, right, up, down).
 * 
 * Features:
 * - Configurable swipe threshold
 * - Supports all four swipe directions
 * - Automatic cleanup of event listeners
 * - Type-safe with TypeScript generics
 */

import { useEffect, useRef, RefObject } from 'react';

/**
 * Swipe handler callbacks
 * Optional callbacks for each swipe direction
 */
interface SwipeHandlers {
  onSwipeLeft?: () => void; // Called when user swipes left
  onSwipeRight?: () => void; // Called when user swipes right
  onSwipeUp?: () => void; // Called when user swipes up
  onSwipeDown?: () => void; // Called when user swipes down
}

/**
 * Swipe detection options
 */
interface SwipeOptions {
  threshold?: number; // Minimum distance (in pixels) to trigger a swipe (default: 50)
}

/**
 * useSwipe Hook
 * 
 * Returns a ref that should be attached to the element you want to detect swipes on.
 * 
 * @param handlers - Object containing optional swipe direction callbacks
 * @param options - Configuration options (threshold)
 * @returns Ref object to attach to target element
 * 
 * @example
 * const swipeRef = useSwipe({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 * }, { threshold: 100 });
 * 
 * return <div ref={swipeRef}>Swipe me!</div>;
 */
export const useSwipe = <T extends HTMLElement>(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
): RefObject<T> => {
  const { threshold = 50 } = options; // Default threshold: 50 pixels
  const ref = useRef<T>(null);
  const touchStart = useRef({ x: 0, y: 0 }); // Store initial touch position

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    /**
     * Handle touch start event
     * Records the initial touch position for swipe calculation
     */
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX, // Initial X coordinate
        y: e.touches[0].clientY, // Initial Y coordinate
      };
    };

    /**
     * Handle touch end event
     * Calculates swipe direction and distance, then calls appropriate handler
     */
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEnd = {
        x: e.changedTouches[0].clientX, // Final X coordinate
        y: e.changedTouches[0].clientY, // Final Y coordinate
      };

      // Calculate distance moved in X and Y directions
      const deltaX = touchEnd.x - touchStart.current.x;
      const deltaY = touchEnd.y - touchStart.current.y;

      // Determine if swipe is more horizontal or vertical
      // This prevents diagonal swipes from triggering both handlers
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe detected
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            // Swiped right
            handlers.onSwipeRight?.();
          } else {
            // Swiped left
            handlers.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe detected
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            // Swiped down
            handlers.onSwipeDown?.();
          } else {
            // Swiped up
            handlers.onSwipeUp?.();
          }
        }
      }
    };

    // Attach event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    // Cleanup: remove event listeners when component unmounts
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers, threshold]);

  return ref;
};
