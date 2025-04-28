import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  itemType: string;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  itemType, 
  itemName, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-sm animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle size={20} className="text-error" />
            Confirmar Exclusão
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-background"
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-4">
          Tem certeza que deseja excluir este {itemType}
          {itemName && <strong> "{itemName}"</strong>}?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="btn btn-outline" 
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="btn bg-error text-white hover:bg-error/80 flex items-center gap-2" 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              'Excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
