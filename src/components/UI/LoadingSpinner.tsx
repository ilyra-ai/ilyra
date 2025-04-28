import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  size = 32 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 size={size} className="animate-spin text-primary" />
      {message && <p className="text-text/70">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
