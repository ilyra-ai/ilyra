import React from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isConfirming = false,
  variant = 'info'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle size={20} className="text-error" />,
          button: 'bg-error text-white hover:bg-error/80'
        };
      case 'warning':
        return {
          icon: <AlertCircle size={20} className="text-warning" />,
          button: 'bg-warning text-white hover:bg-warning/80'
        };
      default:
        return {
          icon: <AlertCircle size={20} className="text-primary" />,
          button: 'btn-primary'
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-sm animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {variantStyles.icon}
            {title}
          </h2>
          <button 
            onClick={onCancel} 
            className="p-1 rounded-full hover:bg-background"
            disabled={isConfirming}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel} 
            className="btn btn-outline" 
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm} 
            className={`btn ${variantStyles.button}`} 
            disabled={isConfirming}
          >
            {isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Processando...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
