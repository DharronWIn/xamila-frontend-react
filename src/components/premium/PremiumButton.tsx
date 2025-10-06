import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremiumModalContext } from './PremiumModalProvider';

interface PremiumButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const PremiumButton = ({ 
  variant = 'default', 
  size = 'default', 
  className = '',
  children = 'Passer au Premium'
}: PremiumButtonProps) => {
  const { showPremiumModal } = usePremiumModalContext();

  return (
    <Button
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold ${className}`}
      onClick={showPremiumModal}
    >
      <Star className="h-4 w-4 mr-2" />
      {children}
    </Button>
  );
};

export default PremiumButton;
