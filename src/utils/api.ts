import { AIModel, UserPreferences, Conversation, Message, User, PlanType } from "../types";
import { generateUniqueId } from "./helpers";
import { IProviderSetting, FrontendProviderInfo, FrontendModelInfo } from '../types/model';
import { knownProviders } from '../lib/modules/llm/registry';

// URL base hipotética do seu backend
const API_BASE_URL = '/api';

// --- Simulated Backend Data (replace with MySQL in production backend) ---
// This data structure simulates the data that would be stored in a MySQL database
// and managed by your backend API.
let simulatedDatabase = {
  profiles: [
    // Initial admin user with 'enterprise' plan
    { id: '00000000-0000-0000-0000-000000000000', email: 'douglas@ilyra.com.br', name: 'Douglas Administrador', role: 'administrador', plan: 'enterprise' as PlanType, createdAt: new Date(), status: 'active' },
  ],
  user_preferences: [
     { user_id: '00000000-0000-0000-0000-000000000000', theme: 'light', fontSize: 'medium', responseStyle: 'formal', enableHistory: true },
  ],
  conversations: [] as Conversation[],
  messages: [] as Message[],
  // Updated plans to only include free, pro, enterprise, and add limits
  plans: [
    { id: 'free', name: 'Free', description: 'Para uso pessoal', price: 0, features: ['Acesso GPT-3.5', 'Histórico limitado', 'Limite de mensagens em horários de pico', 'Acesso apenas a um modelo de AI'], is_active: true, status: 'active', message_limit: 5, rate_limit_per_minute: 60 },
    { id: 'pro', name: 'Pro', description: 'Para uso avançado', price: 49, features: ['Acesso a todos os modelos de IA', 'Velocidade prioritária', 'Até 5x mais mensagens por hora', 'Integração com outros modelos de AI', 'Suporte técnico prioritário', 'Treinamentos personalizados'], is_active: true, status: 'active', message_limit: 500, rate_limit_per_minute: 300 },
    { id: 'enterprise', name: 'Enterprise', description: 'Para empresas', price: null, features: ['Personalização de modelos', 'Integração em sistemas internos', 'Segurança reforçada', 'Garantia de isolamento de dados', 'SLAs (Acordos de Nível de Serviço)'], is_active: true, status: 'active', message_limit: null, rate_limit_per_minute: null }, // null for unlimited
  ],
  // Updated ai_models to reflect plan access (simplified simulation)
  // These are the *potential* models, not necessarily the ones enabled for chat
  ai_models: [
    { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', provider: 'OpenAI', status: 'enabled', plans: ['free', 'pro', 'enterprise'] },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', status: 'enabled', plans: ['pro', 'enterprise'] },
    { id: 'claude-3', name: 'Claude 3 Sonnet', provider: 'Anthropic', status: 'enabled', plans: ['pro', 'enterprise'] },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', status: 'disabled', plans: ['pro', 'enterprise'] },
    { id: 'llama-3', name: 'Llama 3 8B', provider: 'HuggingFace/Meta', status: 'enabled', plans: ['pro', 'enterprise'] },
    { id: 'claude-3-5-sonnet-20241022-v2:0', name: 'Claude 3.5 Sonnet v2 (Bedrock)', provider: 'AmazonBedrock', status: 'enabled', plans: ['pro', 'enterprise'] },
    { id: 'amazon.titan-text-express-v1', name: 'Amazon Titan Text Express (Bedrock)', provider: 'AmazonBedrock', status: 'enabled', plans: ['pro', 'enterprise'] },
    // Add more simulated models for other providers if needed for testing dynamic lists
    { id: 'command-r-plus', name: 'Command R+', provider: 'Cohere', status: 'enabled', plans: ['pro', 'enterprise'] },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Groq)', provider: 'Groq', status: 'enabled', plans: ['pro', 'enterprise'] },
    { id: 'mixtral-8x7b-instruct-v0.1', name: 'Mixtral 8x7B Instruct (Mistral)', provider: 'Mistral', status: 'enabled', plans: ['pro', 'enterprise'] },
    { id: 'llama2', name: 'Llama 2 (Ollama)', provider: 'Ollama', status: 'enabled', plans: ['free', 'pro', 'enterprise'] }, // Ollama models are typically local
  ],
  user_subscriptions: [] as any[], // Simulate subscriptions
  // New: Simulated LLM Provider Settings
  llm_provider_settings: knownProviders.map(p => ({
      providerName: p.name,
      enabled: p.name === 'OpenAI' || p.name === 'Anthropic' || p.name === 'Google' || p.name === 'HuggingFace' || p.name === 'Ollama' || p.name === 'AmazonBedrock' || p.name === 'Cohere' || p.name === 'Deepseek' || p.name === 'Groq' || p.name === 'Hyperbolic' || p.name === 'Github' || p.name === 'LMStudio' || p.name === 'Mistral' || p.name === 'OpenAILike' || p.name === 'OpenRouter' || p.name === 'Perplexity' || p.name === 'Together' || p.name === 'XAI', // Simulate some enabled by default
      apiKey: '', // Simulate empty keys initially
      baseUrl: '', // Simulate empty base URLs initially
  })) as IProviderSetting[],
  // New: Simulated list of models selected by the admin for chat use, including plan access
  selected_chat_models: [] as { modelId: string, plans: PlanType[] }[], // Stores IDs (e.g., 'OpenAI-gpt-3.5') and allowed plans
  // Simulated Platform Settings data structure
  platform_settings: {
    id: 1,
    // Removed specific API keys from here
    stripe_secret_key: '',
    allow_registration: true,
    require_email_verification: false,
    enable_google_auth: true,
    enable_apple_auth: false,
    default_from_email: 'noreply@ilyra.com.br',
    default_from_name: 'iLyra Plataforma',
    terms_url: 'https://ilyra.com.br/termos',
    privacy_url: 'https://ilyra.com.br/privacidade',
    // Removed default_ai_model, free_message_limit, rate_limit_per_minute from here
    updated_at: new Date(),
    primary_color: '#3366FF',
    secondary_color: '#7B61FF',
    logo_url: null,
    // New layout settings
    show_sidebar: true,
    show_history_in_sidebar: true,
    show_model_selector_in_sidebar: true,
    show_plans_link_in_sidebar: true,
    show_admin_dashboard_link_in_sidebar: true,
    custom_header_text: 'iLyra',
    show_theme_toggle_in_header: true,
    show_user_dropdown_in_header: true,
    // New plan-based visibility settings for sidebar items
    sidebar_item_visibility: {
      show_history: ['free', 'pro', 'enterprise', 'administrador'], // Default: all plans see history (admin included for testing)
      show_model_selector: ['pro', 'enterprise'], // Default: Pro and Enterprise see model selector
      show_plans_link: ['free', 'pro', 'administrador'], // Default: Free, Pro, and Admin see plans link
      show_admin_dashboard_link: ['administrador'], // Default: Only admin sees admin dashboard link
    },
    // New plan-based visibility settings for admin sidebar sub-items
    admin_sidebar_item_visibility: {
      admin_dashboard: ['administrador'],
      admin_users: ['administrador'],
      admin_plans: ['administrador'],
      admin_models: ['administrador'],
      admin_branding: ['administrador'],
      admin_settings: ['administrador'],
      admin_tailwind: ['administrador'],
      admin_subscriptions: ['administrador'],
      admin_llm: ['administrador'],
    },
    // Placeholder for other layout sections (header, footer, etc.)
    header_item_visibility: {
      show_theme_toggle: ['free', 'pro', 'enterprise', 'administrador'],
      show_user_dropdown: ['free', 'pro', 'enterprise', 'administrador'],
      // Add other header items here
    },
    footer_visibility: ['free', 'pro', 'enterprise', 'administrador'], // Example: boolean or array of plans
    // Add other sections like 'main_content_blocks', 'footer_links', etc.
  }
};
// --- End Simulated Backend Data ---


// Function to simulate backend API calls
async function simulatedApiCall<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<T> {
  // --- START DEBUG LOGGING ---
  console.log(`[API Simulado - DEBUG] Recebida chamada: Method='${method}', Endpoint='${endpoint}'`);
  console.log(`[API Simulado - DEBUG] Data:`, data);
  // --- END DEBUG LOGGING ---

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // --- Production Backend Logic (replace with actual HTTP calls and MySQL logic) ---
  /* ... (omitted for brevity, same as before) ... */
  // --- End Production Backend Logic ---


  // --- Simulated Backend Logic (using in-memory data) ---
  // This section simulates the backend's interaction with a database (MySQL in production).
  // It directly manipulates the `simulatedDatabase` object.

  // --- START AUTH ENDPOINTS ---
  if (endpoint === '/auth/login' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /auth/login POST");
      console.log("[API Simulado] Tentativa de login recebida:", data.email);
      // Simulate login logic
      const user = simulatedDatabase.profiles.find(p => p.email === data.email);
      if (user && data.password === '12345678') { // Simple password check
          console.log("[API Simulado] Login bem-sucedido:", user.email);
          return user as T; // Return user object
      } else {
          console.warn("[API Simulado] Login falhou para:", data.email);
          throw new Error('Credenciais inválidas (simulado)'); // Portuguese error
      }
  } else if (endpoint === '/auth/register' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /auth/register POST");
      // Simulate registration logic
      console.warn("[API Simulado] Registro simulado falhou. Apenas douglas@ilyra.com.br está ativo.");
      throw new Error('Registro simulado falhou. Apenas douglas@ilyra.com.br está ativo.'); // Portuguese error
  } else if (endpoint === '/auth/logout' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /auth/logout POST");
      // Simulate logout
      console.log("[API Simulado] Logout simulado.");
      return { success: true } as T;
  } else if (endpoint === '/auth/oauth' && method === 'POST') {
       console.log("[API Simulado] >>> Matched /auth/oauth POST");
       console.warn(`[API Simulado] Social login (${data.provider}) simulado falhou.`);
       throw new Error(`Login social simulado (${data.provider}) falhou.`); // Portuguese error
  } else if (endpoint === '/auth/me' && method === 'GET') {
       console.log("[API Simulado] >>> Matched /auth/me GET");
       const currentUser = simulatedDatabase.profiles.find(p => p.id === '00000000-0000-0000-0000-000000000000');
       console.log("[API Simulado] Get current user simulado:", currentUser?.email || 'Nenhum usuário');
       return currentUser as T;
  }
  // --- END AUTH ENDPOINTS ---


  // --- START ADMIN ENDPOINTS ---
  else if (endpoint === '/admin/settings' && method === 'GET') {
      console.log("[API Simulado] >>> Matched /admin/settings GET");
      console.log("[API Simulado] Carregando configurações da plataforma.");
      return simulatedDatabase.platform_settings as T;
  } else if (endpoint === '/admin/settings' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/settings POST");
      console.log("[API Simulado] Salvando configurações da plataforma.");
      simulatedDatabase.platform_settings = { ...simulatedDatabase.platform_settings, ...data, updated_at: new Date() };
      return { success: true } as T;
  } else if (endpoint === '/admin/users' && method === 'GET') {
      console.log("[API Simulado] >>> Matched /admin/users GET");
      console.log("[API Simulado] Carregando usuários.");
      return simulatedDatabase.profiles as T;
  } else if (endpoint === '/admin/users/create' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/users/create POST");
      console.log("[API Simulado] Criando novo usuário.");
      const newUser = { id: generateUniqueId(), ...data, createdAt: new Date(), status: data.status || 'active' };
      simulatedDatabase.profiles.push(newUser as User);
      return newUser as T;
  } else if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/update') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/users/:id/update POST");
      const userId = data.userId; // Assuming userId is passed in data
      console.log(`[API Simulado] Atualizando usuário ${userId}.`);
      simulatedDatabase.profiles = simulatedDatabase.profiles.map(p => p.id === userId ? { ...p, ...data } : p);
      return { success: true } as T;
  } else if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/delete') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/users/:id/delete POST");
      const userId = data.userId; // Assuming userId is passed in data
      console.log(`[API Simulado] Excluindo usuário ${userId}.`);
      simulatedDatabase.profiles = simulatedDatabase.profiles.filter(p => p.id !== userId);
      return { success: true } as T;
  } else if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/updateRole') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/users/:id/updateRole POST");
       const userId = data.userId;
       const role = data.role;
       console.log(`[API Simulado] Atualizando papel do usuário ${userId} para ${role}.`);
       simulatedDatabase.profiles = simulatedDatabase.profiles.map(p => p.id === userId ? { ...p, role: role } : p);
       return { success: true } as T;
  } else if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/updatePlan') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/users/:id/updatePlan POST");
       const userId = data.userId;
       const plan = data.plan;
       console.log(`[API Simulado] Atualizando plano do usuário ${userId} para ${plan}.`);
       simulatedDatabase.profiles = simulatedDatabase.profiles.map(p => p.id === userId ? { ...p, plan: plan } : p);
       return { success: true } as T;
  } else if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/updateStatus') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/users/:id/updateStatus POST");
       const userId = data.userId;
       const status = data.status;
       console.log(`[API Simulado] Atualizando status do usuário ${userId} para ${status}.`);
       simulatedDatabase.profiles = simulatedDatabase.profiles.map(p => p.id === userId ? { ...p, status: status } : p);
       return { success: true } as T;
  } else if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/resetPassword') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/users/:id/resetPassword POST");
       const userId = data.userId;
       console.log(`[API Simulado] Resetando senha do usuário ${userId}.`);
       console.log(`[API Simulado] Email de reset de senha simulado enviado para o usuário ${userId}.`);
       return { success: true } as T;
  } else if (endpoint === '/admin/plans' && method === 'GET') {
      console.log("[API Simulado] >>> Matched /admin/plans GET");
      console.log("[API Simulado] Carregando planos.");
      return simulatedDatabase.plans as T;
  } else if (endpoint === '/admin/plans/create' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/plans/create POST");
      console.log("[API Simulado] Criando novo plano.");
      const newPlan = { id: generateUniqueId(), ...data, created_at: new Date(), is_active: data.is_active ? true : false, features: data.features || [] };
      simulatedDatabase.plans.push(newPlan);
      return newPlan as T;
  } else if (endpoint.startsWith('/admin/plans/') && endpoint.endsWith('/update') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/plans/:id/update POST");
      const planId = data.planId; // Assuming planId is passed in data
      console.log(`[API Simulado] Atualizando plano ${planId}.`);
      simulatedDatabase.plans = simulatedDatabase.plans.map(p => p.id === planId ? { ...p, ...data, is_active: data.is_active ? true : false, features: data.features || [] } : p);
      return { success: true } as T;
  } else if (endpoint.startsWith('/admin/plans/') && endpoint.endsWith('/delete') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/plans/:id/delete POST");
      const planId = data.planId; // Assuming planId is passed in data
      console.log(`[API Simulado] Excluindo plano ${planId}.`);
      const subscriptionCheck = simulatedDatabase.user_subscriptions.filter(sub => sub.plan_id === planId).length;
      if (subscriptionCheck > 0) {
         throw new Error("Não é possível excluir o plano: Existem assinaturas ativas vinculadas a ele.");
      }
      simulatedDatabase.plans = simulatedDatabase.plans.filter(p => p.id !== planId);
      return { success: true } as T;
  } else if (endpoint.startsWith('/admin/plans/') && endpoint.endsWith('/toggleStatus') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/plans/:id/toggleStatus POST");
       const planId = data.planId;
       const isActive = data.isActive;
       console.log(`[API Simulado] Alterando status do plano ${planId} para ${isActive ? 'ativo' : 'inativo'}.`);
       simulatedDatabase.plans = simulatedDatabase.plans.map(p => p.id === planId ? { ...p, is_active: isActive } : p);
       return { success: true } as T;
  } else if (endpoint.startsWith('/admin/plans/') && endpoint.endsWith('/updateLimits') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/plans/:id/updateLimits POST");
       const planId = data.planId;
       const { message_limit, rate_limit_per_minute } = data;
       console.log(`[API Simulado] Atualizando limites para o plano ${planId}.`);
       simulatedDatabase.plans = simulatedDatabase.plans.map(p => p.id === planId ? { ...p, message_limit, rate_limit_per_minute } : p);
       return { success: true } as T;
  } else if (endpoint.startsWith('/admin/plans/') && endpoint.endsWith('/limits') && method === 'GET') {
       console.log("[API Simulado] >>> Matched /admin/plans/:id/limits GET");
       const planId = endpoint.split('/')[4];
       console.log(`[API Simulado] Carregando limites para o plano ${planId}.`);
       const plan = simulatedDatabase.plans.find(p => p.id === planId);
       if (!plan) throw new Error("Plano não encontrado.");
       return { message_limit: plan.message_limit, rate_limit_per_minute: plan.rate_limit_per_minute } as T;
  }
  else if (endpoint === '/admin/models' && method === 'GET') {
      console.log("[API Simulado] >>> Matched /admin/models GET");
      console.log("[API Simulado] Carregando modelos de IA.");
      return simulatedDatabase.ai_models as T;
  } else if (endpoint === '/admin/models/create' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/models/create POST");
      console.log("[API Simulado] Criando novo modelo de IA.");
      const newModel = { id: generateUniqueId(), ...data, created_at: new Date(), plans: data.plans || [] };
      simulatedDatabase.ai_models.push(newModel);
      return newModel as T;
  } else if (endpoint.startsWith('/admin/models/') && endpoint.endsWith('/update') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/models/:id/update POST");
      const modelId = data.modelId; // Assuming modelId is passed in data
      console.log(`[API Simulado] Atualizando modelo de IA ${modelId}.`);
      simulatedDatabase.ai_models = simulatedDatabase.ai_models.map(m => m.id === modelId ? { ...m, ...data, plans: data.plans || [] } : m);
      return { success: true } as T;
  } else if (endpoint.startsWith('/admin/models/') && endpoint.endsWith('/delete') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/models/:id/delete POST");
      const modelId = data.modelId; // Assuming modelId is passed in data
      console.log(`[API Simulado] Excluindo modelo de IA ${modelId}.`);
      simulatedDatabase.ai_models = simulatedDatabase.ai_models.filter(m => m.id !== modelId);
      return { success: true } as T;
  } else if (endpoint.startsWith('/admin/models/') && endpoint.endsWith('/toggleStatus') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/models/:id/toggleStatus POST");
       const modelId = data.modelId;
       const status = data.status;
       console.log(`[API Simulado] Alterando status do modelo ${modelId} para ${status}.`);
       simulatedDatabase.ai_models = simulatedDatabase.ai_models.map(m => m.id === modelId ? { ...m, status: status } : m);
       return { success: true } as T;
  } else if (endpoint === '/admin/subscriptions' && method === 'GET') {
       console.log("[API Simulado] >>> Matched /admin/subscriptions GET");
       console.log("[API Simulado] Carregando assinaturas.");
       return simulatedDatabase.user_subscriptions as T;
  } else if (endpoint === '/admin/subscriptions/create' && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/subscriptions/create POST");
       console.log("[API Simulado] Criando nova assinatura.");
       const newSubscription = {
          id: generateUniqueId(),
          user_id: data.user_id,
          plan_id: data.plan_id,
          start_date: data.start_date || new Date().toISOString(),
          end_date: data.end_date || null,
          status: data.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
       };
       simulatedDatabase.user_subscriptions.push(newSubscription);
       return newSubscription as T;
  } else if (endpoint.startsWith('/admin/subscriptions/') && endpoint.endsWith('/update') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/subscriptions/:id/update POST");
       const subscriptionId = data.id; // Assuming id is passed in data
       console.log(`[API Simulado] Atualizando assinatura ${subscriptionId}.`);
       simulatedDatabase.user_subscriptions = simulatedDatabase.user_subscriptions.map(sub => sub.id === subscriptionId ? { ...sub, ...data, updated_at: new Date().toISOString() } : sub);
       return { success: true } as T;
  } else if (endpoint.startsWith('/admin/subscriptions/') && endpoint.endsWith('/delete') && method === 'POST') {
       console.log("[API Simulado] >>> Matched /admin/subscriptions/:id/delete POST");
       const subscriptionId = data.id; // Assuming id is passed in data
       console.log(`[API Simulado] Exclindo assinatura ${subscriptionId}.`);
       simulatedDatabase.user_subscriptions = simulatedDatabase.user_subscriptions.filter(sub => sub.id !== subscriptionId);
       return { success: true } as T;
  } else if (endpoint === '/admin/llm/providers' && method === 'GET') {
      console.log("[API Simulado] >>> Matched /admin/llm/providers GET");
      console.log("[API Simulado] Carregando configurações de provedores LLM.");
      const providerSettings = simulatedDatabase.llm_provider_settings;
      // When fetching providers, we don't fetch the full model list for each provider initially
      // The full list will be fetched dynamically when the provider settings are expanded
      const providersWithSettings: FrontendProviderInfo[] = knownProviders.map(known => {
          const settings = providerSettings.find(s => s.providerName === known.name);
          // Return an empty models array initially
          return {
              name: known.name,
              label: known.label,
              icon: known.icon,
              enabled: settings?.enabled ?? false,
              apiKeyConfigured: !!settings?.apiKey,
              getApiKeyLink: known.getApiKeyLink,
              labelForGetApiKey: known.labelForGetApiKey,
              models: [], // Models are fetched dynamically in ProviderSettingsForm
              baseUrl: settings?.baseUrl || '', // Include baseUrl
          };
      });
      return providersWithSettings as T;
  } else if (endpoint === '/admin/llm/providers/settings' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/llm/providers/settings POST");
      console.log("[API Simulado] Salvando configurações de provedor LLM.");
      const { providerName, enabled, apiKey, baseUrl } = data;
      const existingIndex = simulatedDatabase.llm_provider_settings.findIndex(s => s.providerName === providerName);

      if (existingIndex > -1) {
          simulatedDatabase.llm_provider_settings[existingIndex] = {
              ...simulatedDatabase.llm_provider_settings[existingIndex],
              enabled: enabled,
              // Only update apiKey if a new value is provided (not '********')
              apiKey: apiKey !== undefined ? apiKey : simulatedDatabase.llm_provider_settings[existingIndex].apiKey,
              baseUrl: baseUrl,
          };
      } else {
          simulatedDatabase.llm_provider_settings.push({ providerName, enabled, apiKey: apiKey || '', baseUrl: baseUrl || '' });
      }
      console.log(`[API Simulado] Configurações para ${providerName} salvas.`);
      return { success: true } as T;
  } else if (endpoint.startsWith('/admin/llm/providers/') && endpoint.endsWith('/models') && method === 'GET') {
       console.log("[API Simulado] >>> Matched /admin/llm/providers/:providerName/models GET");
       const providerName = endpoint.split('/')[4]; // Extract provider name
       const { apiKey, baseUrl } = data || {}; // Get apiKey and baseUrl from data (sent in GET for simulation)
       console.log(`[API Simulado] Buscando modelos para o provedor ${providerName} com API Key: ${apiKey ? 'Configurada' : 'Não Configurada'}, Base URL: ${baseUrl || 'Padrão'}`);

       // Simulate fetching models ONLY if an API key is provided (and not the masked one)
       // Or if it's Ollama, which might work without a key if baseUrl is set
       const isOllama = providerName === 'Ollama';
       const hasApiKey = apiKey && apiKey !== '********';
       const hasBaseUrl = !!baseUrl;

       let simulatedModels: FrontendModelInfo[] = [];

       if (hasApiKey || (isOllama && hasBaseUrl)) {
           // Simulate fetching a dynamic list based on the provider name
           // In a real backend, this would call the actual provider's API
           simulatedModels = simulatedDatabase.ai_models
               .filter(model => model.provider === providerName && model.status === 'enabled') // Filter by provider and status
               .map(model => {
                   // Find the current selected plans for this model
                   const selected = simulatedDatabase.selected_chat_models.find(s => s.modelId === `${model.provider}-${model.id}`);
                   return {
                       id: `${model.provider}-${model.id}`,
                       name: model.id,
                       label: model.name,
                       provider: model.provider,
                       enabled: true, // Assume models returned by API are enabled
                       isPremium: !model.plans.includes('free'),
                       maxTokenAllowed: 8000, // Placeholder
                       capabilities: [], // Placeholder
                       selectedPlans: selected ? selected.plans : [], // Include selected plans
                   };
               });

           console.log(`[API Simulado] Modelos simulados encontrados para ${providerName} (com chave/URL):`, simulatedModels.length);

       } else {
           console.log(`[API Simulado] Nenhuma API Key ou Base URL válida para ${providerName}, retornando lista vazia.`);
           simulatedModels = []; // Return empty list if no key/URL
       }

       // Simulate a delay for fetching models
       await new Promise(resolve => setTimeout(resolve, 500));

       return simulatedModels as T;
  } else if (endpoint === '/admin/llm/models/update-plans' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /admin/llm/models/update-plans POST");
      const { modelsWithPlans } = data; // Expecting an array of { modelId: string, plans: PlanType[] }
      console.log("[API Simulado] Salvando planos selecionados para modelos:", modelsWithPlans);

      // Update the simulated list of selected chat models with their plans
      // This replaces the old selected_chat_models structure
      simulatedDatabase.selected_chat_models = modelsWithPlans || [];

      console.log("[API Simulado] Planos selecionados para modelos salvos (simulado).");
      return { success: true } as T;
  }
  // --- END ADMIN ENDPOINTS ---


  // --- START USER ENDPOINTS ---
  else if (endpoint.startsWith('/user/') && endpoint.endsWith('/profile') && method === 'GET') {
      console.log("[API Simulado] >>> Matched /user/:id/profile GET");
      const userId = endpoint.split('/')[2];
      console.log(`[API Simulado] Carregando perfil do usuário ${userId}.`);
      const userProfile = simulatedDatabase.profiles.find(p => p.id === userId);
      return userProfile as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/profile') && method === 'PUT') {
      console.log("[API Simulado] >>> Matched /user/:id/profile PUT");
      const userId = endpoint.split('/')[2];
      console.log(`[API Simulado] Atualizando perfil do usuário ${userId}.`);
      simulatedDatabase.profiles = simulatedDatabase.profiles.map(p => p.id === userId ? { ...p, ...data } : p);
      return { success: true } as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/preferences') && method === 'GET') {
      console.log("[API Simulado] >>> Matched /user/:id/preferences GET");
      const userId = endpoint.split('/')[2];
      console.log(`[API Simulado] Carregando preferências do usuário ${userId}.`);
      const userPrefs = simulatedDatabase.user_preferences.find(p => p.user_id === userId);
      if (userPrefs) {
         (userPrefs as any).enableHistory = (userPrefs as any).enableHistory === 1 || (userPrefs as any).enableHistory === true; // Handle both 1/0 and true/false
      }
      return userPrefs as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/preferences') && method === 'PUT') {
      console.log("[API Simulado] >>> Matched /user/:id/preferences PUT");
      const userId = endpoint.split('/')[2];
      console.log(`[API Simulado] Atualizando preferências do usuário ${userId}.`);
      const existingIndex = simulatedDatabase.user_preferences.findIndex(p => p.user_id === userId);
      const prefsToSave = { ...data, user_id: userId };
      prefsToSave.enableHistory = prefsToSave.enableHistory ? 1 : 0; // Convert boolean to 1/0 for storage simulation

      if (existingIndex > -1) {
         simulatedDatabase.user_preferences[existingIndex] = { ...simulatedDatabase.user_preferences[existingIndex], ...prefsToSave };
      } else {
         simulatedDatabase.user_preferences.push(prefsToSave as any);
      }
      return { success: true } as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/conversations') && method === 'GET') {
      console.log("[API Simulado] >>> Matched /user/:id/conversations GET");
      const userId = endpoint.split('/')[2];
      console.log(`[API Simulado] Carregando conversas do usuário ${userId}.`);
      const userConversations = simulatedDatabase.conversations
         .filter(conv => conv.user_id === userId)
         .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
         .slice(0, 20);
      return userConversations as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/conversations') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /user/:id/conversations POST");
      const userId = endpoint.split('/')[2];
      console.log(`[API Simulado] Criando nova conversa para o usuário ${userId}.`);
      const newConversation = { id: generateUniqueId(), user_id: userId, ...data, createdAt: new Date(), updatedAt: new Date(), messages: [] };
      simulatedDatabase.conversations.push(newConversation);
      return newConversation as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/conversations/clear') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /user/:id/conversations/clear POST");
      const userId = endpoint.split('/')[2];
      console.log(`[API Simulado] Limpando conversas do usuário ${userId}.`);
      simulatedDatabase.conversations = simulatedDatabase.conversations.filter(conv => conv.user_id !== userId);
      simulatedDatabase.messages = simulatedDatabase.messages.filter(msg => !simulatedDatabase.conversations.some(conv => conv.id === msg.conversation_id));
      return { success: true } as T;
  } else if (endpoint.startsWith('/user/') && endpoint.includes('/conversations/') && endpoint.endsWith('/delete') && method === 'POST') {
      console.log("[API Simulado] >>> Matched /user/:userId/conversations/:conversationId/delete POST");
      const parts = endpoint.split('/');
      const userId = parts[2];
      const conversationId = parts[4]; // Correct index for conversationId
      console.log(`[API Simulado] Excluindo conversa ${conversationId} para o usuário ${userId}.`);
      simulatedDatabase.conversations = simulatedDatabase.conversations.filter(conv => !(conv.id === conversationId && conv.user_id === userId));
      simulatedDatabase.messages = simulatedDatabase.messages.filter(msg => msg.conversation_id !== conversationId);
      return { success: true } as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/messages') && method === 'GET') {
      console.log("[API Simulado] >>> Matched /user/:conversationId/messages GET");
      const conversationId = endpoint.split('/')[2];
      console.log(`[API Simulado] Carregando mensagens da conversa ${conversationId}.`);
      const conversationMessages = simulatedDatabase.messages
         .filter(msg => msg.conversation_id === conversationId)
         .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return conversationMessages as T;
  } else if (endpoint.startsWith('/user/') && endpoint.endsWith('/available-models') && method === 'GET') {
       console.log("[API Simulado] >>> Matched /user/:id/available-models GET");
       const userId = endpoint.split('/')[2];
       console.log(`[API Simulado] Carregando modelos disponíveis para o usuário ${userId}.`);
       const userProfile = simulatedDatabase.profiles.find(p => p.id === userId);
       if (!userProfile) {
           console.warn(`[API Simulado] Usuário ${userId} não encontrado.`);
           return [] as T;
       }

       const userPlan = userProfile.plan;
       const enabledProviders = simulatedDatabase.llm_provider_settings
           .filter(setting => setting.enabled)
           .map(setting => setting.providerName);

       // Filter models based on:
       // 1. They must be in the list of models selected by the admin (`selected_chat_models`)
       // 2. The user's plan must be included in the plans configured for that model by the admin
       // 3. They must be enabled in the simulated ai_models list
       // 4. Their provider must be enabled
       const availableModels: FrontendModelInfo[] = simulatedDatabase.ai_models
           .filter(model => {
               const adminSelectedModel = simulatedDatabase.selected_chat_models.find(s => s.modelId === `${model.provider}-${model.id}`);
               return (
                   adminSelectedModel && // Must be selected by admin
                   adminSelectedModel.plans.includes(userPlan) && // User's plan must be allowed by admin selection
                   model.status === 'enabled' && // Model must be enabled
                   enabledProviders.includes(model.provider) // Model's provider must be enabled
               );
           })
           .map(model => ({
               id: `${model.provider}-${model.id}`,
               name: model.id,
               label: model.name,
               provider: model.provider,
               enabled: true, // Already filtered by enabled status
               isPremium: !model.plans.includes('free'),
               maxTokenAllowed: 8000, // Placeholder
               capabilities: [], // Placeholder
           }));

       console.log(`[API Simulado] Modelos disponíveis para o plano ${userPlan} (filtrados por seleção do admin):`, availableModels);
       return availableModels as T;
  }
  // --- END USER ENDPOINTS ---


  // --- START CHAT ENDPOINTS ---
  else if (endpoint === '/chat/send' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /chat/send POST");
      console.log("[API Simulado] Recebendo mensagem para processamento de IA.");
      const { content, conversationId, model } = data;
      const userId = simulatedDatabase.profiles.find(p => p.id === '00000000-0000-0000-0000-000000000000')?.id; // Assume admin user for simulation

      if (!userId) throw new Error("Usuário simulado não encontrado."); // Portuguese error

      const userMessage: Message = {
         id: generateUniqueId(),
         conversation_id: conversationId,
         role: 'user',
         content: content,
         timestamp: new Date(),
      };

      simulatedDatabase.messages.push(userMessage);
      simulatedDatabase.conversations = simulatedDatabase.conversations.map(conv =>
         conv.id === conversationId ? { ...conv, updatedAt: new Date() } : conv
      );

      console.log("[API Simulado] Mensagem do usuário salva e conversa atualizada (simulado).");
      return { success: true } as T;
  }
  // --- END CHAT ENDPOINTS ---


  // --- START PAYMENTS ENDPOINTS ---
  else if (endpoint === '/payments/create-checkout-session' && method === 'POST') {
      console.log("[API Simulado] >>> Matched /payments/create-checkout-session POST");
      const { planId } = data;
      console.log(`[API Simulado] Recebida requisição para criar sessão de checkout para o plano ${planId}.`);
      console.log(`[API Simulado] Simulando criação de sessão de checkout para o plano ${planId}.`);
      // In a real app, this would interact with a payment gateway API
      return { redirectUrl: '#' } as T; // Simulate returning a redirect URL
  } else if (endpoint === '/payments/manage-subscription' && method === 'POST') {
       console.log("[API Simulado] >>> Matched /payments/manage-subscription POST");
       console.log("[API Simulado] Recebida requisição para criar portal de gerenciamento de assinatura.");
       console.log("[API Simulado] Simulando criação de portal de gerenciamento de assinatura.");
       // In a real app, this would interact with a payment gateway API
       return { redirectUrl: '#' } as T; // Simulate returning a redirect URL
  }
  // --- END PAYMENTS ENDPOINTS ---


  // --- START FALLBACK ---
  else {
      console.warn(`[API Simulado] Endpoint NÃO IMPLEMENTADO: ${method} ${endpoint}`);
      throw new Error(`Endpoint não implementado na simulação: ${method} ${endpoint}`);
  }
  // --- END FALLBACK ---
}


// Funções específicas para interagir com o backend (simulado)
export const api = {
  admin: {
    settings: {
      get: () => simulatedApiCall<any>('GET', '/admin/settings'),
      save: (settings: any) => simulatedApiCall<any>('POST', '/admin/settings', settings),
    },
    users: {
       get: () => simulatedApiCall<UserType[]>('GET', '/admin/users'),
       create: (userData: any) => simulatedApiCall<UserType>('POST', '/admin/users/create', userData),
       // Pass userId in data for update/delete/etc.
       update: (userId: string, userData: any) => simulatedApiCall<any>('POST', `/admin/users/${userId}/update`, { userId, ...userData }),
       delete: (userId: string) => simulatedApiCall<any>('POST', `/admin/users/${userId}/delete`, { userId }),
       updateRole: (userId: string, role: 'user' | 'administrador') => simulatedApiCall<any>('POST', `/admin/users/${userId}/updateRole`, { userId, role }),
       updatePlan: (userId: string, plan: PlanType) => simulatedApiCall<any>('POST', `/admin/users/${userId}/updatePlan`, { userId, plan }),
       updateStatus: (userId: string, status: string) => simulatedApiCall<any>('POST', `/admin/users/${userId}/updateStatus`, { userId, status }),
       resetPassword: (userId: string) => simulatedApiCall<any>('POST', `/admin/users/${userId}/resetPassword`, { userId }),
    },
    plans: {
       get: () => simulatedApiCall<any[]>('GET', '/admin/plans'),
       create: (planData: any) => simulatedApiCall<any>('POST', '/admin/plans/create', planData),
       // Pass planId in data for update/delete/etc.
       update: (planId: string, planData: any) => simulatedApiCall<any>('POST', `/admin/plans/${planId}/update`, { planId, ...planData }),
       delete: (planId: string) => simulatedApiCall(`/admin/plans/${planId}/delete`, 'POST', { planId }),
       toggleStatus: (planId: string, isActive: boolean) => simulatedApiCall<any>('POST', `/admin/plans/${planId}/toggleStatus`, { planId, isActive }),
       updateLimits: (planId: string, limits: { message_limit: number | null, rate_limit_per_minute: number | null }) => simulatedApiCall<any>('POST', `/admin/plans/${planId}/updateLimits`, { planId, ...limits }),
       getLimits: (planId: string) => simulatedApiCall<{ message_limit: number | null, rate_limit_per_minute: number | null }>('GET', `/admin/plans/${planId}/limits`),
    },
     models: {
       get: () => simulatedApiCall<any[]>('GET', '/admin/models'),
       create: (modelData: any) => simulatedApiCall<any>('POST', '/admin/models/create', modelData),
       // Pass modelId in data for update/delete/etc.
       update: (modelId: string, modelData: any) => simulatedApiCall<any>('POST', `/admin/models/${modelId}/update`, { modelId, ...modelData }),
       delete: (modelId: string) => simulatedApiCall(`/admin/models/${modelId}/delete`, 'POST', { modelId }),
       toggleStatus: (modelId: string, status: string) => simulatedApiCall<any>('POST', '/admin/models/${modelId}/toggleStatus', 'POST', { modelId, status }),
    },
    subscriptions: {
       get: () => simulatedApiCall<any[]>('GET', '/admin/subscriptions'),
       create: (subscriptionData: any) => simulatedApiCall<any>('POST', '/admin/subscriptions/create', subscriptionData),
       update: (subscriptionId: string, subscriptionData: any) => simulatedApiCall<any>('POST', `/admin/subscriptions/${subscriptionId}/update`, { id: subscriptionId, ...subscriptionData }),
       delete: (subscriptionId: string) => simulatedApiCall(`/admin/subscriptions/${subscriptionId}/delete`, 'POST', { id: subscriptionId }),
    },
    llm: { // New API endpoints for LLM management
       getProviders: () => simulatedApiCall<FrontendProviderInfo[]>('GET', '/admin/llm/providers'),
       saveProviderSettings: (settings: IProviderSetting) => simulatedApiCall<any>('POST', '/admin/llm/providers/settings', settings),
       getProviderModels: (providerName: string, apiKey?: string, baseUrl?: string) => simulatedApiCall<FrontendModelInfo[]>('GET', `/admin/llm/providers/${providerName}/models`, { apiKey, baseUrl }), // New endpoint
       // selectChatModels: (selectedModelIds: string[]) => simulatedApiCall<any>('POST', '/admin/llm/models/select-for-chat', { selectedModelIds }), // Removed
       // getSelectedChatModels: () => simulatedApiCall<string[]>('GET', '/admin/llm/models/selected-for-chat'), // Removed
       updateModelPlans: (modelsWithPlans: { modelId: string, plans: PlanType[] }[]) => simulatedApiCall<any>('POST', '/admin/llm/models/update-plans', { modelsWithPlans }), // New endpoint
    }
  },
  chat: {
     send: (messageContent: string, conversationId?: string, model?: AIModel) => simulatedApiCall<any>('POST', '/chat/send', { content: messageContent, conversationId, model }),
     // Add functions for loading history, etc. that call simulatedApiCall
  },
  auth: {
     login: (email: string, password: string) => simulatedApiCall<User>('POST', '/auth/login', { email, password }),
     register: (email: string, password: string, name: string) => simulatedApiCall<User>('POST', '/auth/register', { email, password, name }),
     logout: () => simulatedApiCall<any>('POST', '/auth/logout'),
     signInWithOAuth: (provider: 'google' | 'apple') => simulatedApiCall<any>('POST', '/auth/oauth', { provider }),
     getCurrentUser: () => simulatedApiCall<User | null>('GET', '/auth/me'), // Simulated endpoint to get current user
  },
  user: {
     getProfile: (userId: string) => simulatedApiCall<User | null>('GET', `/user/${userId}/profile`),
     updateProfile: (userId: string, userData: Partial<User>) => simulatedApiCall<any>('PUT', `/user/${userId}/profile`, userData),
     getPreferences: (userId: string) => simulatedApiCall<UserPreferences | null>('GET', `/user/${userId}/preferences`),
     updatePreferences: (userId: string, preferences: Partial<UserPreferences>) => simulatedApiCall<any>('PUT', `/user/${userId}/preferences`, preferences),
     getConversations: (userId: string) => simulatedApiCall<Conversation[]>('GET', `/user/${userId}/conversations`),
     createConversation: (userId: string, conversationData: Partial<Conversation>) => simulatedApiCall<Conversation>('POST', `/user/${userId}/conversations`, conversationData),
     clearConversations: (userId: string) => simulatedApiCall<any>('POST', `/user/${userId}/conversations/clear`),
     deleteConversation: (conversationId: string, userId: string) => simulatedApiCall<any>('POST', `/user/${userId}/conversations/${conversationId}/delete`),
     getMessages: (conversationId: string) => simulatedApiCall<Message[]>('GET', `/user/${conversationId}/messages`),
     getAvailableModels: (userId: string) => simulatedApiCall<FrontendModelInfo[]>('GET', `/user/${userId}/available-models`),
  },
  payments: {
     createCheckoutSession: (planId: string) => simulatedApiCall<any>('POST', '/payments/create-checkout-session', { planId }),
     manageSubscription: () => simulatedApiCall<any>('POST', '/payments/manage-subscription'),
  }
};
