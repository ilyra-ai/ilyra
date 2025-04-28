import React, { useState, useEffect } from 'react'; // Import useEffect
import { useApp } from '../context/AppContext';
import { User, Mail, Camera, Save } from 'lucide-react'; // Ensure Save is imported
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const EditProfilePage: React.FC = () => {
  const { user, updateProfile } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  // Update state if user context changes (e.g., after simulated login)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // updateProfile for simulated admin only updates local state
      await updateProfile({ name, email });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      console.log('Profile updated locally (simulated).');
      // Optionally navigate back after successful save
      // navigate('/profile');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil (simulado).');
    }
  };

  // Redirect if user is not logged in (should not happen with temporary admin)
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);


  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Editar Perfil</h1>
        <p className="text-text/70">Atualize suas informações pessoais</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success">
          Perfil atualizado com sucesso! (Simulado)
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary-light"
              aria-label="Alterar foto"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome completo</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                placeholder="Seu nome"
                required
              />
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                placeholder="seu@email.com"
                required
                disabled={true} // Email is often not editable via profile page
              />
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
            </div>
             <p className="mt-1 text-xs text-text/70">O e-mail não pode ser alterado aqui.</p> {/* Add helper text */}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
          <Save size={18} />
          <span>Salvar alterações</span>
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
