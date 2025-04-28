import React, { useState, useEffect } from 'react';
import { Settings, Key, Mail, ToggleLeft, ToggleRight, ShieldCheck, FileText, Save, Bot, DollarSign, Clock, Loader2, CreditCard } from 'lucide-react'; // Added CreditCard icon
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const AdminSettingsPage: React.FC = () => {
  // Removed specific API key states
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [enableGoogleAuth, setEnableGoogleAuth] = useState(true);
  const [enableAppleAuth, setEnableAppleAuth] = useState(false);
  const [defaultFromEmail, setDefaultFromEmail] = useState('noreply@ilyra.com.br');
  const [defaultFromName, setDefaultFromName] = useState('iLyra Plataforma');
  const [termsUrl, setTermsUrl] = useState('https://ilyra.com.br/termos');
  const [privacyUrl, setPrivacyUrl] = useState('https://ilyra.com.br/privacidade');
  // Removed defaultAIModel, freeMessageLimit, rateLimitPerMinute states

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Load settings using the API utility
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await api.admin.settings.get();
        // Removed loading specific API keys
        setStripeSecretKey(settings.stripe_secret_key || '');
        setAllowRegistration(settings.allow_registration);
        setRequireEmailVerification(settings.require_email_verification);
        setEnableGoogleAuth(settings.enable_google_auth);
        setEnableAppleAuth(settings.enable_apple_auth);
        setDefaultFromEmail(settings.default_from_email || 'noreply@ilyra.com.br');
        setDefaultFromName(settings.default_from_name || 'iLyra Plataforma');
        setTermsUrl(settings.terms_url || 'https://ilyra.com.br/termos');
        setPrivacyUrl(settings.privacy_url || 'https://ilyra.com.br/privacidade');
        // Removed loading defaultAIModel, freeMessageLimit, rateLimitPerMinute
        console.log("Configurações gerais carregadas via API simulada.");
      } catch (error) {
        console.error("Erro ao carregar configurações via API simulada:", error);
        alert("Falha ao carregar configurações gerais.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);


  const handleSaveChanges = async () => {
     setIsSaving(true);
     console.log('Attempting to save general settings via API simulada:', {
        // Removed specific API keys from save data
        stripeSecretKey,
        allowRegistration, requireEmailVerification, enableGoogleAuth, enableAppleAuth,
        defaultFromEmail, defaultFromName, termsUrl, privacyUrl,
        // Removed defaultAIModel, freeMessageLimit, rateLimitPerMinute from save data
     });
     try {
        // Save settings using the API utility
        await api.admin.settings.save({
           // Removed specific API keys from save payload
           stripe_secret_key: stripeSecretKey,
           allow_registration: allowRegistration,
           require_email_verification: requireEmailVerification,
           enable_google_auth: enableGoogleAuth,
           enable_apple_auth: enableAppleAuth,
           default_from_email: defaultFromEmail,
           default_from_name: defaultFromName,
           terms_url: termsUrl,
           privacy_url: privacyUrl,
           // Removed default_ai_model, free_message_limit, rate_limit_per_minute from save payload
           // primary_color, secondary_color, logo_url seriam salvos na página de Branding
        });
        console.log("Configurações gerais salvas via API simulada.");
        alert('Configurações gerais salvas!');
     } catch (error) {
        console.error("Erro ao salvar configurações via API simulada:", error);
        alert("Falha ao salvar configurações gerais.");
     } finally {
       setIsSaving(false);
     }
  };

  return (
    <div className="p-6">
       <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={24} className="text-error" />
          Configurações Gerais
        </h1>
         <Link to="/admin/users" className="btn btn-outline"> {/* Link to Admin Users */}
          Voltar ao Admin
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-error" />
          <span className="ml-2 text-text/70">Carregando configurações gerais...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* API Keys Section (Only Payment Gateways remain) */}
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Key size={18} /> Chaves de API (Gateways de Pagamento)</h3> {/* Updated title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Payment Gateway Keys */}
               <div className="md:col-span-2"> {/* Span across two columns */}
                 <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><CreditCard size={16} /> Chaves de Gateways de Pagamento</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1">Chave Secreta Stripe</label>
                     <input type="password" placeholder="••••••••••••••••" className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" value={stripeSecretKey} onChange={(e) => setStripeSecretKey(e.target.value)} disabled={isSaving} />
                     <p className="text-xs text-text/70 mt-1">Chave secreta para integração com Stripe (Backend).</p>
                   </div>
                    {/* Placeholder for other payment gateway keys */}
                   <div>
                     <label className="block text-sm font-medium mb-1">Chave API PagSeguro</label>
                     <input type="password" placeholder="••••••••••••••••" className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" disabled={isSaving} />
                     <p className="text-xs text-text/70 mt-1">Chave API para integração com PagSeguro (Backend).</p>
                   </div>
                    {/* Add more fields for other gateways as needed */}
                 </div>
               </div>
               <p className="md:col-span-2 text-sm text-error mt-4">
                 <strong>Aviso:</strong> Chaves de API são sensíveis. A inserção aqui é apenas para demonstração visual. Elas devem ser gerenciadas e usadas com segurança no backend.
               </p>
            </div>
          </div>

          {/* Removed General Application Settings Section */}
          {/*
          <div className="bg-card rounded-lg p-6">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings size={18} /> Configurações da Aplicação</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Modelo de IA Padrão</label>
                 <select
                   value={defaultAIModel}
                   onChange={(e) => setDefaultAIModel(e.target.value)}
                   className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                   disabled={isSaving}
                 >
                   <option value="gpt-3.5">GPT-3.5</option>
                   <option value="gpt-4">GPT-4</option>
                   <option value="claude-3">Claude-3</option>
                   <option value="llama-3">Llama-3</option>
                   <option value="gemini-pro">Gemini Pro</option>
                 </select>
                 <p className="text-xs text-text/70 mt-1">Modelo de IA selecionado por padrão para novas conversas.</p>
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Limite de Mensagens Grátis (por usuário)</label>
                 <input
                   type="number"
                   value={freeMessageLimit}
                   onChange={(e) => setFreeMessageLimit(parseInt(e.target.value, 10))}
                   className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                   min="0"
                   disabled={isSaving}
                 />
                 <p className="text-xs text-text/70 mt-1">Número máximo de mensagens que usuários do plano Free podem enviar.</p>
               </div>
                <div>
                 <label className="block text-sm font-medium mb-1">Limite de Requisições (por minuto/usuário)</label>
                 <input
                   type="number"
                   value={rateLimitPerMinute}
                   onChange={(e) => setRateLimitPerMinute(parseInt(e.target.value, 10))}
                   className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                   min="1"
                   disabled={isSaving}
                 />
                 <p className="text-xs text-text/70 mt-1">Número máximo de requisições de API permitidas por usuário por minuto.</p>
               </div>
             </div>
          </div>
          */}


          {/* Authentication Settings */}
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Autenticação</h3>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">Permitir Registro de Novos Usuários</p>
                   <p className="text-sm text-text/70">Controla se novos usuários podem se cadastrar.</p>
                 </div>
                 <button
                   className={`p-1 rounded-full transition-colors ${allowRegistration ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                   onClick={() => setAllowRegistration(!allowRegistration)}
                   disabled={isSaving}
                 >
                   {allowRegistration ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                 </button>
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">Exigir Verificação de Email</p>
                   <p className="text-sm text-text/70">Novos usuários precisam confirmar o email.</p>
                 </div>
                  <button
                   className={`p-1 rounded-full transition-colors ${requireEmailVerification ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                   onClick={() => setRequireEmailVerification(!requireEmailVerification)}
                   disabled={isSaving}
                 >
                   {requireEmailVerification ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                 </button>
               </div>
                <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">Habilitar Login com Google</p>
                 </div>
                  <button
                   className={`p-1 rounded-full transition-colors ${enableGoogleAuth ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                   onClick={() => setEnableGoogleAuth(!enableGoogleAuth)}
                   disabled={isSaving}
                 >
                   {enableGoogleAuth ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                 </button>
               </div>
                <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">Habilitar Login com Apple</p>
                 </div>
                  <button
                   className={`p-1 rounded-full transition-colors ${enableAppleAuth ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                   onClick={() => setEnableAppleAuth(!enableAppleAuth)}
                   disabled={isSaving}
                 >
                   {enableAppleAuth ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                 </button>
               </div>
             </div>
          </div>

           {/* Email Settings */}
           <div className="bg-card rounded-lg p-6">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Mail size={18} /> Configurações de Email</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Endereço "De"</label>
                 <input type="email" placeholder="noreply@ilyra.com.br" className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" value={defaultFromEmail} onChange={(e) => setDefaultFromEmail(e.target.value)} disabled={isSaving} />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Nome "De"</label>
                 <input type="text" placeholder="iLyra Plataforma" className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" value={defaultFromName} onChange={(e) => setDefaultFromName(e.target.value)} disabled={isSaving} />
               </div>
               {/* Add API Key for transactional email service if different from main API keys */}
             </div>
           </div>

           {/* Legal Settings */}
           <div className="bg-card rounded-lg p-6">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText size={18} /> Legal</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">URL Termos de Serviço</label>
                 <input type="url" placeholder="https://ilyra.com.br/termos" className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" value={termsUrl} onChange={(e) => setTermsUrl(e.target.value)} disabled={isSaving} />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">URL Política de Privacidade</label>
                 <input type="url" placeholder="https://ilyra.com.br/privacidade" className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary" value={privacyUrl} onChange={(e) => setPrivacyUrl(e.target.value)} disabled={isSaving} />
               </div>
             </div>
          </div>

        </div>
      )}


       {/* Save Button */}
       <div className="mt-6 flex justify-end">
         <button onClick={handleSaveChanges} className="btn btn-primary flex items-center gap-2" disabled={isSaving || isLoading}>
           {isSaving ? (
             <span className="flex items-center justify-center gap-2">
               <Loader2 size={18} className="animate-spin" /> Salvando...
             </span>
           ) : (
             <>
               <Save size={18} />
               <span>Salvar Configurações</span>
             </>
           )}
         </button>
       </div>
    </div>
  );
};

export default AdminSettingsPage;
