import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, Shield, CreditCard, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { PlanType } from '../types';

// Define a type for Subscription based on your database schema (simplified for display)
interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  plan_name?: string; // Optional: to display plan name
}

const ProfilePage: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Fetch user's subscription when user data is available
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) {
        setIsLoadingSubscription(false);
        setUserSubscription(null);
        return;
      }
      setIsLoadingSubscription(true);
      try {
        // In a real app, you'd fetch the user's *active* subscription from your backend
        // For simulation, we'll fetch all and just show the first one found
        const subscriptions = await api.admin.subscriptions.get(); // Using admin endpoint for simulation ease
        const userSubs = subscriptions.filter(sub => sub.user_id === user.id);

        if (userSubs.length > 0) {
            // Find the most recent active subscription, or just the first one
            const activeSub = userSubs.find(sub => sub.status === 'active') || userSubs[0];
            // Fetch plan details to get the name (simulated)
            const plans = await api.admin.plans.get();
            const planDetails = plans.find(p => p.id === activeSub.plan_id);

            setUserSubscription({
                ...activeSub,
                plan_name: planDetails?.name || activeSub.plan_id, // Use plan name if found
            });
        } else {
            setUserSubscription(null);
        }
      } catch (error) {
        console.error("Erro ao carregar assinatura do usuário:", error);
        setUserSubscription(null);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user]);


  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleChangePassword = () => {
    console.log('Alterar senha clicked');
    // TODO: Implement change password functionality via backend API
    alert('Funcionalidade de alterar senha não implementada.');
  };

  const handleTwoFactorAuth = () => {
    console.log('Ativar autenticação em dois fatores clicked');
    // TODO: Implement 2FA functionality via backend API
    alert('Funcionalidade de autenticação em dois fatores não implementada.');
  };

  const handleDeleteAccount = () => {
    console.log('Excluir conta clicked');
    // TODO: Implement delete account functionality via backend API
    alert('Funcionalidade de excluir conta não implementada.');
  };

  const handleUpgradePlan = async () => {
     console.log('Atualizar para Pro clicked'); // Updated plan name
     try {
        // Call the simulated API to create a checkout session for the 'pro' plan
        const response = await api.payments.createCheckoutSession('pro'); // Updated plan ID
        console.log("[Simulação Pagamento] Sessão de checkout criada para o plano Pro:", response); // Updated log
        // In a real app, you would redirect the user to response.redirectUrl
        alert("Simulado: Redirecionaria para o checkout do gateway de pagamento para o plano Pro."); // Updated alert
        // window.location.href = response.redirectUrl; // Real redirect
     } catch (error) {
        console.error("[Simulação Pagamento] Erro ao iniciar checkout para o plano Pro:", error); // Updated log
        alert("Falha ao iniciar o processo de atualização de plano.");
     }
  };

  const handleManageSubscription = async () => {
     console.log('Gerenciar Assinatura clicked');
     try {
        // Call the simulated API to get the manage subscription portal URL
        const response = await api.payments.manageSubscription();
        console.log("[Simulação Pagamento] Portal de gerenciamento criado:", response);
        // In a real app, you would redirect the user to response.redirectUrl
        alert("Simulado: Redirecionaria para o portal de gerenciamento de assinatura do gateway de pagamento.");
        // window.location.href = response.redirectUrl; // Real redirect
     } catch (error) {
        console.error("[Simulação Pagamento] Erro ao abrir portal de gerenciamento:", error);
        alert("Falha ao abrir o portal de gerenciamento de assinatura.");
     }
  };


  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h1 className="text-2xl font-bold">{user?.name || 'Usuário da iLyra'}</h1>
        <p className="text-text/70">{user?.email || 'usuario@email.com'}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium">Nome completo</p>
                <p className="text-text/70">{user?.name || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium">E-mail</p>
                <p className="text-text/70">{user?.email || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium">Papel</p>
                <p className="text-text/70">{user?.role === 'administrador' ? 'Administrador' : 'Usuário'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium">Membro desde</p>
                <p className="text-text/70">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Não informado'}</p>
              </div>
            </div>
          </div>
           <button className="btn btn-outline w-full mt-6" onClick={handleEditProfile}>
              Editar Perfil
            </button>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Plano Atual</h2>
          {isLoadingSubscription ? (
             <div className="flex items-center gap-3 text-text/70">
               <Loader2 size={20} className="animate-spin text-primary" />
               <span>Carregando assinatura...</span>
             </div>
          ) : userSubscription ? (
             <div className="flex items-start gap-3">
               <Shield size={20} className="text-primary" />
               <div>
                 <p className="font-medium">iLyra {userSubscription.plan_name || userSubscription.plan_id}</p>
                 <p className="text-sm text-text/70 mb-2">
                   Status: <span className={`font-semibold ${userSubscription.status === 'active' ? 'text-success' : 'text-warning'}`}>{userSubscription.status}</span>
                 </p>
                 <p className="text-sm text-text/70 mb-4">
                   Início: {new Date(userSubscription.start_date).toLocaleDateString()}
                   {userSubscription.end_date && ` | Fim: ${new Date(userSubscription.end_date).toLocaleDateString()}`}
                 </p>
                 {/* Button to manage subscription via payment gateway portal */}
                 <button className="btn btn-outline flex items-center gap-2" onClick={handleManageSubscription}>
                    <CreditCard size={18} />
                    <span>Gerenciar Assinatura</span>
                 </button>
               </div>
             </div>
          ) : (
             <div className="flex items-start gap-3">
               <Shield size={20} className="text-primary" />
               <div>
                 {/* Display user's plan from context if no active subscription found */}
                 <p className="font-medium">iLyra {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Grátis'}</p>
                 <p className="text-sm text-text/70 mb-4">Plano {user?.plan ? user.plan : 'gratuito'} com recursos {user?.plan === 'free' ? 'básicos' : 'avançados'}</p>
                 {/* Show upgrade button only if user is on 'free' plan */}
                 {user?.plan === 'free' && (
                    <button className="btn btn-primary" onClick={handleUpgradePlan}>
                       Atualizar para Pro
                    </button>
                 )}
               </div>
             </div>
          )}
        </div>

        <div className="bg-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Segurança</h2>
          <div className="space-y-4">
            <button className="btn btn-outline w-full text-left" onClick={handleChangePassword}>
              Alterar senha
            </button>
            <button className="btn btn-outline w-full text-left" onClick={handleTwoFactorAuth}>
              Ativar autenticação em dois fatores
            </button>
            <button className="btn btn-outline w-full text-left text-error" onClick={handleDeleteAccount}>
              Excluir conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
