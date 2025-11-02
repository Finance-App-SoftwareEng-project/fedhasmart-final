import { useState, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
}

export const PullToRefresh = ({ onRefresh, children, disabled = false }: PullToRefreshProps) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStart = useRef(0);
  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    touchStart.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || window.scrollY > 0 || refreshing) return;
    
    const currentTouch = e.touches[0].clientY;
    const distance = currentTouch - touchStart.current;

    if (distance > 0) {
      setPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || refreshing) return;

    if (pullDistance > threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    setPulling(false);
    setPullDistance(0);
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {(pulling || refreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-center transition-all duration-200 z-50"
          style={{
            height: `${pullDistance}px`,
            opacity: progress / 100,
          }}
        >
          <div className="flex flex-col items-center gap-1 text-primary">
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${progress * 3.6}deg)`,
              }}
            />
            <span className="text-xs font-medium">
              {refreshing ? 'Refreshing...' : pullDistance > threshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      <div
        style={{
          transform: `translateY(${pulling ? pullDistance * 0.5 : 0}px)`,
          transition: pulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
