import React, { useState, useEffect } from 'react'; // Import useEffect
import { ChevronDown, Zap, Loader2 } from 'lucide-react'; // Import Loader2
import { useApp } from '../../context/AppContext';
import { AIModel } from '../../types';
import { api } from '../../utils/api'; // Import api utility
import { FrontendModelInfo } from '../../types/model'; // Import FrontendModelInfo

const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel, user } = useApp(); // Get user from context
  const [isOpen, setIsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<FrontendModelInfo[]>([]); // State for models available to the user
  const [isLoadingModels, setIsLoadingModels] = useState(true); // Loading state for models

  // Fetch models available to the current user's plan AND selected by the admin
  useEffect(() => {
    const fetchAvailableModels = async () => {
      if (!user?.id) {
        setAvailableModels([]);
        setIsLoadingModels(false);
        return;
      }
      setIsLoadingModels(true);
      try {
        // Fetch models available to the user's plan via simulated API
        // This API call now filters based on the admin's selection and the user's plan
        const models = await api.user.getAvailableModels(user.id);
        setAvailableModels(models);
        console.log("[ModelSelector] Modelos disponíveis para o usuário (filtrados pela seleção do admin e plano):", models);

        // Set a default selected model if the current one is not available
        // Find the first model that is currently selected AND available to the user
        const firstAvailableSelectedModel = models.find(m => m.enabled); // Assuming models returned by getAvailableModels are enabled

        if (!selectedModel || !models.some(m => m.name === selectedModel)) {
            // If no model is selected, or the current selected model is no longer available,
            // select the first available model from the fetched list.
            const defaultFallbackModel = firstAvailableSelectedModel ? firstAvailableSelectedModel.name : 'gpt-3.5'; // Fallback
            setSelectedModel(defaultFallbackModel);
             console.log("[ModelSelector] Definindo modelo padrão:", defaultFallbackModel);
        } else {
             console.log("[ModelSelector] Modelo atual ainda disponível:", selectedModel);
        }

      } catch (error) {
        console.error("Erro ao carregar modelos disponíveis via API simulada:", error);
        setAvailableModels([]); // Set empty on error
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchAvailableModels();
  }, [user?.id, selectedModel, setSelectedModel]); // Re-fetch when user changes or selectedModel changes (to validate)


  const selectedModelData = availableModels.find((model) => model.name === selectedModel);

  const handleSelectModel = (modelName: string) => {
    setSelectedModel(modelName);
    setIsOpen(false);
  };

  // Disable selector if no models are available or loading
  const isDisabled = isLoadingModels || availableModels.length === 0;

  return (
    <div className="relative">
      <button
        className={`w-full p-3 border border-border rounded-lg flex items-center justify-between ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-card'}`}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
      >
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-primary" />
          <div className="text-left">
            {isLoadingModels ? (
                <span className="text-sm font-medium text-text/70 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Carregando modelos...
                </span>
            ) : selectedModelData ? (
              <>
                <p className="text-sm font-medium">{selectedModelData.label}</p> {/* Use label */}
                <p className="text-xs text-text/70 truncate">{selectedModelData.provider}</p> {/* Show provider */}
              </>
            ) : (
               <p className="text-sm font-medium text-text/70">Nenhum modelo disponível</p>
            )}
          </div>
        </div>
        {!isLoadingModels && !isDisabled && <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto animate-fadeIn">
          {availableModels.map((model) => (
            <button
              key={model.id} // Use model.id as key
              className={`w-full p-3 flex items-start gap-2 hover:bg-background/50 ${
                selectedModel === model.name ? 'bg-background/30' : ''
              }`}
              onClick={() => handleSelectModel(model.name)} // Use model.name for selection
            >
              <Zap size={18} className={model.isPremium ? 'text-secondary' : 'text-primary'} />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{model.label}</p> {/* Use label */}
                  {model.isPremium && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-secondary/10 text-secondary rounded">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-text/70">{model.provider}</p> {/* Show provider */}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
