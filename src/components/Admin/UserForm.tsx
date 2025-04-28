import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { User as UserType, PlanType } from '../../types';

interface UserFormProps {
  user: UserType | null; // Null for create, UserType for edit
  onClose: () => void;
  onSave: (userData: Partial<UserType>) => Promise<void>; // onSave is now async
  isSaving: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSave, isSaving }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'user');
  const [plan, setPlan] = useState(user?.plan || 'free');
  const [status, setStatus] = useState(user?.status || 'active');

  // Update form state if the user prop changes (e.g., when opening for edit)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'user');
      setPlan(user.plan || 'free');
      setStatus(user.status || 'active');
    } else {
      // Reset form for create mode
      setName('');
      setEmail('');
      setRole('user');
      setPlan('free');
      setStatus('active');
    }
  }, [user]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!name || !email || !role || !plan || !status) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    // Email format validation (basic)
    if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Por favor, insira um email válido.');
        return;
    }

    const userData: Partial<UserType> = {
        name,
        email,
        role: role as 'user' | 'administrador',
        plan: plan as PlanType,
        status: status as 'active' | 'inactive' | 'banned',
    };

    // If editing, include the user ID
    if (user) {
        userData.id = user.id;
    }

    await onSave(userData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{user ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background" disabled={isSaving}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={isSaving} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={!!user || isSaving} />
             {user && <p className="mt-1 text-xs text-text/70">O e-mail não pode ser alterado aqui.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Papel</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'user' | 'administrador')} className="w-full p-2 border border-border rounded-lg bg-input" required disabled={isSaving}>
              <option value="user">Usuário</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Plano</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as PlanType)} className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" required disabled={isSaving}>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'banned')} className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" required disabled={isSaving}>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="banned">Banido</option>
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

export default UserForm;
