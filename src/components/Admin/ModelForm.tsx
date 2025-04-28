import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ModelFormProps {
  model: any | null; // Null for create, Model object for edit
  onClose: () => void;
  onSave: (modelData: any) => Promise<void>; // onSave is now async
  isSaving: boolean;
}

const ModelForm: React.FC<ModelFormProps> = ({ model, onClose, onSave, isSaving }) => {
  const [name, setName] = useState(model?.name || '');
  const [provider, setProvider] = useState(model?.provider || '');
  const [status, setStatus] = useState(model?.status || 'enabled');
  const [plans, setPlans] = useState(model?.plans?.join('\n') || ''); // Plans as multiline string

  // Update form state if the model prop changes (e.g., when opening for edit)
  useEffect(() => {
    if (model) {
      setName(model.name || '');
      setProvider(model.provider || '');
      setStatus(model.status || 'enabled');
      setPlans(model.plans?.join('\n') || '');
    } else {
      // Reset form for create mode
      setName('');
      setProvider('');
      setStatus('enabled');
      setPlans('');
    }
  }, [model]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!name || !provider || !status) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Convert plans string back to array
    const plansArray = plans.split('\n').map((p: string) => p.trim()).filter((p: string) => p !== '');

    const modelData = {
      name,
      provider,
      status,
      plans: plansArray,
    };

    // If editing, include the model ID
    if (model) {
        (modelData as any).modelId = model.id; // Add modelId for update API call
    }

    await onSave(modelData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{model ? 'Editar Modelo de IA' : 'Adicionar Novo Modelo de IA'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background" disabled={isSaving}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={!!model || isSaving} /> {/* Disable name edit for existing models */}
             {model && <p className="mt-1 text-xs text-text/70">O nome do modelo não pode ser alterado aqui.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Provedor</label>
            <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={isSaving} />
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" disabled={isSaving}>
              <option value="enabled">Habilitado</option>
              <option value="disabled">Desabilitado</option>
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Planos com Acesso (um por linha)</label>
            <textarea value={plans} onChange={(e) => setPlans(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" rows={3} placeholder="free\nplus\npro..." disabled={isSaving} />
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

export default ModelForm;
