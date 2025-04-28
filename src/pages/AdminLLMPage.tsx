import React, { useState, useEffect } from 'react';
import { Bot, Settings, ToggleLeft, ToggleRight, Key, Link as LinkIcon, Loader2, ArrowLeft, RefreshCw, Save, Upload } from 'lucide-react'; // Added Upload
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { FrontendProviderInfo, IProviderSetting, FrontendModelInfo } from '../types/model'; // Import types
import { PlanType } from '../types'; // Import PlanType

const AdminLLMPage: React.FC = () => {
  const [providers, setProviders] = useState<FrontendProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null); // State to manage expanded provider settings

  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      try {
        // Fetch LLM provider configurations from the simulated backend API
        const fetchedProviders = await api.admin.llm.getProviders();
        setProviders(fetchedProviders);
      } catch (error) {
        console.error("Erro ao carregar provedores LLM via API simulada:", error);
        alert("Falha ao carregar provedores LLM.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, []);

  const handleToggleProvider = async (providerName: string, currentStatus: boolean) => {
    setIsSaving(true);
    try {
      const newSettings: IProviderSetting = {
        providerName,
        enabled: !currentStatus,
        // Keep existing API key and baseUrl when toggling status
        apiKey: providers.find(p => p.name === providerName)?.apiKeyConfigured ? 'configured' : '', // Simulate keeping configured key
        baseUrl: providers.find(p => p.name === providerName)?.baseUrl || '', // Simulate keeping configured base URL
      };
      await api.admin.llm.saveProviderSettings(newSettings);
      // Update local state
      setProviders(prevProviders => prevProviders.map(p => p.name === providerName ? { ...p, enabled: !currentStatus } : p));
      alert(`Provedor ${providerName} ${!currentStatus ? 'habilitado' : 'desabilitado'}! (Simulado)`);
    } catch (error) {
      console.error("Falha ao alterar status do provedor via API simulada:", error);
      alert("Falha ao alterar status do provedor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveApiKey = async (providerName: string, apiKey: string, baseUrl: string) => {
     setIsSaving(true);
     try {
       const newSettings: IProviderSetting = {
         providerName,
         enabled: providers.find(p => p.name === providerName)?.enabled ?? false, // Keep existing enabled status
         apiKey: apiKey,
         baseUrl: baseUrl,
       };
       await api.admin.llm.saveProviderSettings(newSettings);
       // Update local state (only apiKeyConfigured and baseUrl)
       setProviders(prevProviders => prevProviders.map(p => p.name === providerName ? { ...p, apiKeyConfigured: !!apiKey, baseUrl: baseUrl } : p));
       alert(`Configurações de API para ${providerName} salvas! (Simulado)`);
       // setExpandedProvider(null); // Keep settings section open after saving
     } catch (error) {
       console.error("Falha ao salvar API Key via API simulada:", error);
       alert("Falha ao salvar API Key.");
     } finally {
       setIsSaving(false);
     }
  };

  const toggleExpandedProvider = (providerName: string) => {
    setExpandedProvider(expandedProvider === providerName ? null : providerName);
  };


  return (
    <div className="p-6">
       <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot size={24} className="text-info" /> {/* Using info color */}
          Provedores LLM
        </h1>
         <Link to="/admin/users" className="btn btn-outline"> {/* Link to Admin Users */}
          Voltar ao Admin
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-info" />
          <span className="ml-2 text-text/70">Carregando provedores LLM...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {providers.map((provider) => (
            <div key={provider.name} className="bg-card rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* You might need a component to render icons based on provider.icon */}
                  {provider.icon ? (
                     <span className={`text-xl ${provider.icon}`}></span> // Placeholder for icon class
                  ) : (
                     <Bot size={20} className="text-primary" /> // Default icon
                  )}
                  <h2 className="text-lg font-semibold">{provider.label}</h2>
                </div>
                <div className="flex items-center gap-2">
                   <button
                     onClick={() => handleToggleProvider(provider.name, provider.enabled)}
                     className={`p-1 rounded-full transition-colors ${provider.enabled ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                     title={provider.enabled ? 'Desabilitar Provedor' : 'Habilitar Provedor'}
                     disabled={isSaving}
                   >
                     {provider.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                   </button>
                   <button
                     onClick={() => toggleExpandedProvider(provider.name)}
                     className={`p-1 rounded-full hover:bg-background ${expandedProvider === provider.name ? 'bg-background' : ''}`}
                     title="Configurações de API"
                     disabled={isSaving}
                   >
                     <Settings size={20} />
                   </button>
                </div>
              </div>

              {expandedProvider === provider.name && (
                 <ProviderSettingsForm
                   provider={provider}
                   onSave={handleSaveApiKey}
                   isSaving={isSaving}
                 />
              )}

              {/* Removed static model display here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for Provider Settings Form (API Key, Base URL)
interface ProviderSettingsFormProps {
  provider: FrontendProviderInfo;
  onSave: (providerName: string, apiKey: string, baseUrl: string) => Promise<void>;
  isSaving: boolean;
}

const ProviderSettingsForm: React.FC<ProviderSettingsFormProps> = ({ provider, onSave, isSaving }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [providerModels, setProviderModels] = useState<FrontendModelInfo[]>([]); // State for models from this provider
  const [isLoadingModels, setIsLoadingModels] = useState(false); // Loading state for fetching models
  const [modelsWithSelectedPlans, setModelsWithSelectedPlans] = useState<{ modelId: string, plans: PlanType[] }[]>([]); // State for models with selected plans

  // State for Fine-tuning simulation
  const [fineTuneDatasetUrl, setFineTuneDatasetUrl] = useState('');
  const [fineTuneFile, setFineTuneFile] = useState<File | null>(null);
  const [isFineTuning, setIsFineTuning] = useState(false);
  const [fineTuneStatus, setFineTuneStatus] = useState<'idle' | 'uploading' | 'training' | 'completed' | 'error'>('idle');
  const [fineTuneMessage, setFineTuneMessage] = useState('');

  // Available plans for selection
  const availablePlans: PlanType[] = ['free', 'pro', 'enterprise', 'administrador'];


  // Load initial settings and selected models when the form mounts or provider changes
  useEffect(() => {
      const loadInitialSettingsAndSelectedModels = async () => {
          setIsLoadingSettings(true);
          // setIsLoadingModels(true); // Don't load models automatically on mount

          try {
              // Fetch the specific provider settings again for the form
              const providers = await api.admin.llm.getProviders();
              const settings = providers.find(p => p.name === provider.name);
              if (settings) {
                  setApiKey(settings.apiKeyConfigured ? '********' : ''); // Simulate masked key if configured
                  setBaseUrl(settings.baseUrl || '');
              } else {
                 setApiKey('');
                 setBaseUrl('');
              }

              // Fetch the list of models currently selected for chat use with their plans
              // This is now part of the getProviderModels response in the simulation
              // const currentlySelected = await api.admin.llm.getSelectedChatModels(); // Removed
              // setSelectedModels(currentlySelected); // Removed
              // console.log(`[AdminLLMPage] Modelos atualmente selecionados para chat:`, currentlySelected); // Removed

          } catch (error) {
              console.error("Erro ao carregar configurações iniciais ou modelos selecionados para o formulário:", provider.name, error);
              alert("Falha ao carregar configurações ou modelos selecionados.");
          } finally {
              setIsLoadingSettings(false);
              // setIsLoadingModels(false); // Stop loading models state
          }
      };
      loadInitialSettingsAndSelectedModels();
  }, [provider.name]); // Reload settings and selected models if provider changes


  const handleFetchModels = async () => {
      setIsLoadingModels(true);
      setProviderModels([]); // Clear previous list
      setModelsWithSelectedPlans([]); // Clear previous selected plans state
      try {
          // Send the current apiKey and baseUrl from the form state to the simulated API
          const fetchedModels = await api.admin.llm.getProviderModels(provider.name, apiKey === '********' ? undefined : apiKey, baseUrl);
          setProviderModels(fetchedModels);

          // Initialize modelsWithSelectedPlans state from fetched models (which now include selectedPlans)
          setModelsWithSelectedPlans(fetchedModels.map(model => ({
              modelId: model.id,
              plans: model.selectedPlans || [] // Use selectedPlans from fetched data
          })));

          console.log(`[AdminLLMPage] Modelos buscados para ${provider.name}:`, fetchedModels.length);
          alert(`Modelos para ${provider.name} buscados! (Simulado)`);
      } catch (error) {
          console.error("Erro ao buscar modelos via API simulada:", provider.name, error);
          alert("Falha ao buscar modelos do provedor.");
          setProviderModels([]); // Clear models on error
          setModelsWithSelectedPlans([]); // Clear selected plans on error
      } finally {
          setIsLoadingModels(false);
      }
  };

  const handlePlanSelect = (modelId: string, plan: PlanType, isSelected: boolean) => {
      setModelsWithSelectedPlans(prevModels =>
          prevModels.map(model =>
              model.modelId === modelId
                  ? {
                      ...model,
                      plans: isSelected
                          ? [...model.plans, plan]
                          : model.plans.filter(p => p !== plan)
                    }
                  : model
          )
      );
  };

  const handleSaveModelPlans = async () => {
      setIsSaving(true); // Use the main saving state
      try {
          // Send the updated modelsWithSelectedPlans to the API
          await api.admin.llm.updateModelPlans(modelsWithSelectedPlans);
          alert("Planos selecionados para modelos salvos! (Simulado)");
      } catch (error) {
          console.error("Falha ao salvar planos selecionados para modelos via API simulada:", error);
          alert("Falha ao salvar planos selecionados para modelos.");
      } finally {
          setIsSaving(false);
      }
  };

  // Fine-tuning Simulation Handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          setFineTuneFile(file);
          setFineTuneDatasetUrl(''); // Clear URL if file is selected
      }
  };

  const handleStartFineTuning = async () => {
      if (!fineTuneDatasetUrl && !fineTuneFile) {
          alert("Por favor, insira a URL do dataset ou selecione um arquivo.");
          return;
      }

      setIsFineTuning(true);
      setFineTuneStatus('uploading');
      setFineTuneMessage('Iniciando treinamento...');

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFineTuneStatus('training');
      setFineTuneMessage('Processando dataset e treinando modelo...');

      // Simulate training delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate success or error randomly
      const success = Math.random() > 0.2; // 80% chance of success

      if (success) {
          setFineTuneStatus('completed');
          setFineTuneMessage('Treinamento concluído com sucesso! As melhorias foram aplicadas globalmente (simulado).');
          // Simulate saving training state locally (e.g., timestamp of last training)
          localStorage.setItem(`fineTune_${provider.name}_lastTraining`, new Date().toISOString());
      } else {
          setFineTuneStatus('error');
          setFineTuneMessage('Erro durante o treinamento. Verifique o dataset e tente novamente (simulado).');
      }

      setIsFineTuning(false);
      setFineTuneDatasetUrl('');
      setFineTuneFile(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send the actual API key input value
    // For simulation, if the input is '********', don't send it, assume it's unchanged
    const apiKeyToSave = apiKey === '********' ? undefined : apiKey; // Send undefined if masked
    await onSave(provider.name, apiKeyToSave as string, baseUrl); // Cast to string for simulation
    // After saving API key, manually trigger fetching models
    handleFetchModels();
  };

  return (
    <div className="p-4 border-t border-border bg-background/50">
      {isLoadingSettings ? (
         <div className="flex items-center gap-2 text-text/70">
           <Loader2 size={20} className="animate-spin text-primary" />
           <span>Carregando configurações...</span>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Insira a chave de API"
              className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
              disabled={isSaving || isFineTuning}
            />
             {provider.getApiKeyLink && (
               <p className="mt-1 text-xs text-text/70">
                 Obtenha sua chave aqui:{' '}
                 <a href={provider.getApiKeyLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                   {provider.labelForGetApiKey || provider.getApiKeyLink} <LinkIcon size={12} />
                 </a>
               </p>
             )}
          </div>
           {/* Optional Base URL field for providers like Ollama */}
           {provider.name === 'Ollama' && (
             <div>
               <label className="block text-sm font-medium mb-1">Base URL (Opcional)</label>
               <input
                 type="text"
                 value={baseUrl}
                 onChange={(e) => setBaseUrl(e.target.value)}
                 placeholder="Ex: http://localhost:11434"
                 className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                 disabled={isSaving || isFineTuning}
               />
                <p className="mt-1 text-xs text-text/70">URL para a instância local do Ollama.</p>
             </div>
           )}

          <div className="flex items-center gap-2">
             <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={isSaving || isFineTuning}>
               {isSaving ? (
                 <>
                   <Loader2 size={18} className="animate-spin" /> Salvando...
                 </>
               ) : (
                 'Salvar Configurações'
               )}
             </button>
              {/* Button to manually fetch models */}
             <button type="button" className="btn btn-outline flex items-center gap-2" onClick={handleFetchModels} disabled={isSaving || isLoadingModels || isFineTuning}>
                {isLoadingModels ? (
                   <>
                     <Loader2 size={18} className="animate-spin" /> Buscando Modelos...
                   </>
                ) : (
                   <>
                     <RefreshCw size={18} /> Buscar Modelos
                   </>
                )}
             </button>
          </div>

           {/* Display Models List and Selection */}
           {isLoadingModels ? (
              <div className="flex items-center gap-2 text-text/70 mt-4">
                <Loader2 size={20} className="animate-spin text-primary" />
                <span>Buscando modelos...</span>
              </div>
           ) : providerModels && providerModels.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Modelos Disponíveis para Chat:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2"> {/* Added max-height and overflow */}
                  {providerModels.map(model => (
                    <div key={model.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm cursor-pointer hover:bg-background/50 p-1 rounded">
                      <div className="flex items-center gap-2">
                         <span>{model.label} ({model.name})</span>
                          {model.isPremium && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-secondary/10 text-secondary rounded">
                              PRO
                            </span>
                          )}
                      </div>
                       <div className="flex flex-wrap gap-2">
                         {availablePlans.map(plan => (
                           <label key={plan} className="flex items-center text-xs cursor-pointer">
                             <input
                               type="checkbox"
                               className="form-checkbox mr-1" // Tailwind form plugin style
                               checked={modelsWithSelectedPlans.find(m => m.modelId === model.id)?.plans.includes(plan) || false}
                               onChange={(e) => handlePlanSelect(model.id, plan, e.target.checked)}
                               disabled={isSaving || isFineTuning}
                             />
                             {plan.charAt(0).toUpperCase() + plan.slice(1)}
                           </label>
                         ))}
                       </div>
                    </div>
                  ))}
                </div>
                 <div className="mt-4 flex justify-end">
                    <button
                       type="button"
                       className="btn btn-primary flex items-center gap-2"
                       onClick={handleSaveModelPlans}
                       disabled={isSaving || isFineTuning}
                    >
                       {isSaving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> Salvando Seleção...
                          </>
                       ) : (
                          <>
                            <Save size={18} /> Salvar Modelos Selecionados
                          </>
                       )}
                    </button>
                 </div>
              </div>
           ) : (
              <div className="mt-4 text-text/70 text-sm">
                Nenhum modelo disponível para este provedor (verifique a API Key e o status, ou clique em "Buscar Modelos").
              </div>
           )}

           {/* Fine-tuning Simulation Section */}
           <div className="mt-6 border-t border-border pt-4">
              <h3 className="text-md font-semibold mb-2 flex items-center gap-2"><Bot size={18} /> Treinamento Supervisionado (Fine-tuning - Simulado)</h3>
              <p className="text-sm text-text/70 mb-4">
                 Esta funcionalidade é uma simulação. Em um ambiente de produção real, o fine-tuning de modelos LLM é um processo complexo que requer infraestrutura de backend e integração com APIs de provedores.
              </p>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">URL do Dataset (Opcional)</label>
                    <input
                       type="url"
                       value={fineTuneDatasetUrl}
                       onChange={(e) => { setFineTuneDatasetUrl(e.target.value); setFineTuneFile(null); }}
                       className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                       placeholder="https://exemplo.com/dataset.jsonl"
                       disabled={isSaving || isFineTuning}
                    />
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-sm text-text/70">Ou</span>
                    <label className="btn btn-outline cursor-pointer flex items-center gap-2" disabled={isSaving || isFineTuning}>
                       <Upload size={16} />
                       <span>Selecionar Arquivo Local</span>
                       <input type="file" className="hidden" onChange={handleFileChange} disabled={isSaving || isFineTuning} />
                    </label>
                    {fineTuneFile && <span className="text-sm text-text/70">{fineTuneFile.name}</span>}
                 </div>
                 <button
                    type="button"
                    className="btn btn-primary flex items-center gap-2"
                    onClick={handleStartFineTuning}
                    disabled={isSaving || isFineTuning || (!fineTuneDatasetUrl && !fineTuneFile)}
                 >
                    {isFineTuning ? (
                       <>
                         <Loader2 size={18} className="animate-spin" /> {fineTuneStatus === 'uploading' ? 'Iniciando...' : 'Treinando...'}
                       </>
                    ) : (
                       <>
                         <Bot size={18} /> Iniciar Treinamento
                       </>
                    )}
                 </button>
                 {fineTuneMessage && (
                    <p className={`text-sm mt-2 ${fineTuneStatus === 'error' ? 'text-error' : fineTuneStatus === 'completed' ? 'text-success' : 'text-text/70'}`}>
                       Status: {fineTuneMessage}
                    </p>
                 )}
              </div>
           </div>
        </form>
      )}
    </div>
  );
};


export default AdminLLMPage;
