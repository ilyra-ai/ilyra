// This file defines types related to LLM models and providers,
// used by both frontend and conceptual backend code.

import type { AIModel, PlanType } from '.'; // Assuming AIModel and PlanType are defined in index.ts

// Represents settings for a specific provider stored in the database
// This type is used in the frontend to manage provider settings via the Admin UI
export interface IProviderSetting {
  providerName: string; // Name of the provider (e.g., 'OpenAI', 'Anthropic')
  enabled: boolean; // Whether the provider is enabled
  apiKey?: string; // The API key for this provider (sensitive, handled securely in backend)
  baseUrl?: string; // Custom base URL for this provider (optional)
  // Add other provider-specific settings here (e.g., model-specific configs)
}

// Represents a simplified model info for frontend display
export interface FrontendModelInfo {
  id: string; // Unique ID (e.g., providerName-modelName)
  name: string; // Model name (e.g., 'gpt-4', 'gemini-1.5-flash-latest')
  label: string; // Human-readable label (e.g., 'GPT-4', 'Gemini 1.5 Flash')
  provider: string; // Provider name (e.g., 'OpenAI', 'Google')
  enabled: boolean; // Whether the model is enabled (based on provider status and plan access)
  isPremium?: boolean; // Indicates if it's a premium model (requires paid plan)
  maxTokenAllowed?: number; // Optional max tokens
  capabilities?: string[]; // Optional capabilities (e.g., 'image-generation')
  selectedPlans?: PlanType[]; // New: Plans selected by admin for this model
}

// Represents a simplified provider info for frontend display
export interface FrontendProviderInfo {
  name: string; // Provider name (e.g., 'OpenAI')
  label: string; // Human-readable label (e.g., 'OpenAI')
  icon?: string; // Icon identifier
  enabled: boolean; // Whether the provider is enabled in settings
  apiKeyConfigured: boolean; // Whether an API key is configured (even if empty)
  getApiKeyLink?: string; // Link to get API key
  labelForGetApiKey?: string; // Label for the link
  models: FrontendModelInfo[]; // List of models available from this provider
  baseUrl?: string; // Include baseUrl for display/editing
}

// Extend the existing AIModel type if necessary, or ensure consistency
// export type AIModel = 'gpt-3.5' | 'gpt-4' | 'claude-3' | 'llama-3' | 'gemini-pro' | string; // Allow other model names
