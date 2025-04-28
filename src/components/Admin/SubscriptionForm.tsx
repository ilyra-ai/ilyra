import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

// Define a type for Subscription based on your database schema
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string; // Store as ISO string
  end_date: string | null; // Store as ISO string or null
  status: string; // e.g., 'active', 'cancelled', 'expired'
  created_at: string; // Store as ISO string
  updated_at: string; // Store as ISO string
}

interface SubscriptionFormProps {
  subscription: Subscription | null; // Null for create, Subscription object for edit
  onClose: () => void;
  onSave: (subscriptionData: Partial<Subscription>) => Promise<void>; // onSave is now async
  isSaving: boolean;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ subscription, onClose, onSave, isSaving }) => {
  const [userId, setUserId] = useState(subscription?.user_id || '');
  const [planId, setPlanId] = useState(subscription?.plan_id || '');
  const [startDate, setStartDate] = useState(subscription?.start_date ? new Date(subscription.start_date).toISOString().split('T')[0] : ''); // Format date for input type="date"
  const [endDate, setEndDate] = useState(subscription?.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : ''); // Format date for input type="date"
  const [status, setStatus] = useState(subscription?.status || 'active');

  // Update form state if the subscription prop changes
  useEffect(() => {
    if (subscription) {
      setUserId(subscription.user_id || '');
      setPlanId(subscription.plan_id || '');
      setStartDate(subscription.start_date ? new Date(subscription.start_date).toISOString().split('T')[0] : '');
      setEndDate(subscription.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : '');
      setStatus(subscription.status || 'active');
    } else {
      // Reset form for create mode
      setUserId('');
      setPlanId('');
      setStartDate('');
      setEndDate('');
      setStatus('active');
    }
  }, [subscription]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!userId || !planId || !startDate || !status) {
        alert('Por favor, preencha os campos obrigatórios (Usuário, Plano, Data Início, Status).');
        return;
    }

    const subscriptionData: Partial<Subscription> = {
        user_id: userId,
        plan_id: planId,
        start_date: new Date(startDate).toISOString(), // Convert back to ISO string
        end_date: endDate ? new Date(endDate).toISOString() : null, // Convert or set null
        status,
    };

    // If editing, include the subscription ID
    if (subscription) {
        subscriptionData.id = subscription.id;
    }

    await onSave(subscriptionData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{subscription ? 'Editar Assinatura' : 'Adicionar Assinatura'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background" disabled={isSaving}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ID Usuário</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={isSaving} />
             {/* TODO: In production, this would be a searchable dropdown/selector for users */}
             <p className="mt-1 text-xs text-text/70">Em produção, seria um seletor de usuário.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ID Plano</label>
            <input type="text" value={planId} onChange={(e) => setPlanId(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={isSaving} />
             {/* TODO: In production, this would be a dropdown/selector for plans */}
             <p className="mt-1 text-xs text-text/70">Em produção, seria um seletor de plano.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Início</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={isSaving} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Fim (Opcional)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" disabled={isSaving} />
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={isSaving}>
              <option value="active">Ativa</option>
              <option value="cancelled">Cancelada</option>
              <option value="expired">Expirada</option>
              {/* Add other relevant statuses */}
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Salvando...
              </span>
            ) : (
              'Salvar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;
