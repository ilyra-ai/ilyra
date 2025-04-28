import React, { useState, useEffect } from 'react';
import { X, Loader2, MessageSquare, Clock } from 'lucide-react';

interface PlanLimitsModalProps {
  plan: any; // The plan object
  onClose: () => void;
  onSave: (planId: string, limits: { message_limit: number | null, rate_limit_per_minute: number | null }) => Promise<void>;
  isSaving: boolean;
}

const PlanLimitsModal: React.FC<PlanLimitsModalProps> = ({ plan, onClose, onSave, isSaving }) => {
  const [messageLimit, setMessageLimit] = useState<number | null>(plan?.message_limit ?? null);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState<number | null>(plan?.rate_limit_per_minute ?? null);

  // Update state if the plan prop changes
  useEffect(() => {
    if (plan) {
      setMessageLimit(plan.message_limit ?? null);
      setRateLimitPerMinute(plan.rate_limit_per_minute ?? null);
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation (optional, backend should also validate)
    if (messageLimit !== null && (isNaN(messageLimit) || messageLimit < 0)) {
        alert('Limite de mensagens deve ser um número positivo ou vazio.');
        return;
    }
     if (rateLimitPerMinute !== null && (isNaN(rateLimitPerMinute) || rateLimitPerMinute < 0)) {
        alert('Limite de requisições deve ser um número positivo ou vazio.');
        return;
    }

    await onSave(plan.id, { message_limit: messageLimit, rate_limit_per_minute: rateLimitPerMinute });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Configurar Limites para "{plan.name}"</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background" disabled={isSaving}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MessageSquare size={18} /> Limite de Mensagens (por usuário)
            </label>
            <input
              type="number"
              value={messageLimit === null ? '' : messageLimit}
              onChange={(e) => setMessageLimit(e.target.value === '' ? null : parseInt(e.target.value, 10))}
              className="w-full p-2 border border-border rounded-lg bg-input"
              placeholder="Ilimitado (deixe vazio)"
              min="0"
              disabled={isSaving}
            />
             <p className="mt-1 text-xs text-text/70">Número máximo de mensagens por usuário neste plano. Deixe vazio para ilimitado.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Clock size={18} /> Limite de Requisições (por minuto/usuário)
            </label>
            <input
              type="number"
              value={rateLimitPerMinute === null ? '' : rateLimitPerMinute}
              onChange={(e) => setRateLimitPerMinute(e.target.value === '' ? null : parseInt(e.target.value, 10))}
              className="w-full p-2 border border-border rounded-lg bg-input"
              placeholder="Ilimitado (deixe vazio)"
              min="0"
              disabled={isSaving}
            />
             <p className="mt-1 text-xs text-text/70">Número máximo de requisições de API por usuário por minuto neste plano. Deixe vazio para ilimitado.</p>
          </div>
           {/* Add other limit fields here if needed */}
          <button type="submit" className="btn btn-primary w-full" disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Salvando...
              </span>
            ) : (
              'Salvar Limites'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlanLimitsModal;
