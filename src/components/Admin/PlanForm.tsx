import React, { useState, useEffect } from 'react';
import { X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { PlanType } from '../../types';

interface PlanFormProps {
  plan: any | null; // Null for create, Plan object for edit
  onClose: () => void;
  onSave: (planData: any) => Promise<void>; // onSave is now async
  isSaving: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ plan, onClose, onSave, isSaving }) => {
  const [name, setName] = useState(plan?.name || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [price, setPrice] = useState(plan?.price || 0);
  const [features, setFeatures] = useState(plan?.features?.join('\n') || ''); // Features as multiline string
  const [isActive, setIsActive] = useState(plan?.status === 'active');

  // Update form state if the plan prop changes (e.g., when opening for edit)
  useEffect(() => {
    if (plan) {
      setName(plan.name || '');
      setDescription(plan.description || '');
      setPrice(plan.price || 0);
      setFeatures(plan.features?.join('\n') || '');
      setIsActive(plan.status === 'active');
    } else {
      // Reset form for create mode
      setName('');
      setDescription('');
      setPrice(0);
      setFeatures('');
      setIsActive(true);
    }
  }, [plan]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!name || price === undefined || price === null) {
        alert('Por favor, preencha o nome e o preço.');
        return;
    }

    // Convert features string back to array
    const featuresArray = features.split('\n').map((f: string) => f.trim()).filter((f: string) => f !== '');

    const planData = {
      name,
      description,
      price: parseFloat(price), // Ensure price is a number
      features: featuresArray,
      is_active: isActive,
      status: isActive ? 'active' : 'inactive', // Keep status consistent
    };

    // If editing, include the plan ID
    if (plan) {
        (planData as any).planId = plan.id; // Add planId for update API call
    }

    await onSave(planData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{plan ? 'Editar Plano' : 'Criar Novo Plano'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background" disabled={isSaving}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={!!plan || isSaving} />
             {plan && <p className="mt-1 text-xs text-text/70">O nome do plano não pode ser alterado aqui.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" rows={3} disabled={isSaving} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preço (R$)</label>
            <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="w-full p-2 border border-border rounded-lg bg-input" step="0.01" required disabled={isSaving} />
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Recursos (um por linha)</label>
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" rows={5} placeholder="Recurso 1\nRecurso 2\n..." disabled={isSaving} />
          </div>
           <div className="flex items-center justify-between">
             <label className="block text-sm font-medium">Ativo</label>
             <button
               type="button"
               className={`p-1 rounded-full transition-colors ${isActive ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
               onClick={() => setIsActive(!isActive)}
               disabled={isSaving}
             >
               {isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
             </button>
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

export default PlanForm;
