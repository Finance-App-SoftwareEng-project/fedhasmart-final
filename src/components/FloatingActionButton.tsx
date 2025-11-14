import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  className?: string;
}

export const FloatingActionButton = ({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label,
  className = '',
}: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`
        fixed bottom-20 right-4 md:bottom-8 md:right-8
        h-14 w-14 rounded-full shadow-lg
        hover:shadow-xl transition-all duration-200
        hover:scale-110 active:scale-95
        z-40 touch-target
        ${className}
      `}
      size="icon"
      aria-label={label || 'Action button'}
    >
      {icon}
    </Button>
  );
};
