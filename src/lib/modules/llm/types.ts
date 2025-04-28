// NOTE: This file defines types used by the conceptual backend LLM management code.
// It is included in the frontend project structure for type safety but the runtime logic
// associated with these types (like getModelInstance) is NOT executed in the browser.

import type { LanguageModelV1 } from 'ai'; // Assuming 'ai' types are available

// Represents information about a specific AI model
export interface ModelInfo {
  name: string; // Unique identifier for the model (e.g., 'gpt-4', 'claude-3-sonnet-20240229')
  label: string; // Human-readable name for the model (e.g., 'GPT-4', 'Claude 3 Sonnet')
  provider: string; // Name of the provider (e.g., 'OpenAI', 'Anthropic', 'Google')
  maxTokenAllowed: number; // Maximum number of tokens allowed for context/response
  // Add other model-specific properties as needed (e.g., capabilities like 'image-generation')
  capabilities?: string[];
}

// Represents information about an LLM provider
export interface ProviderInfo {
  name: string; // Unique name for the provider (e.g., 'OpenAI', 'Anthropic')
  staticModels: ModelInfo[]; // Models that are always available for this provider
  // Optional method to fetch dynamic models (models that might change or require API key to list)
  getDynamicModels?: (
    apiKeys?: Record<string, string>, // API keys passed from settings
    settings?: IProviderSetting, // Provider-specific settings
    serverEnv?: Record<string, string>, // Server environment variables
  ) => Promise<ModelInfo[]>;
  // Method to get an instance of the AI model using the provider's SDK
  // This method would be called in the backend to interact with the LLM API
  getModelInstance: (options: {
    model: string; // The specific model name to instantiate
    serverEnv: Env; // Server environment variables (conceptual)
    apiKeys?: Record<string, string>; // API keys from settings
    providerSettings?: Record<string, IProviderSetting>; // Provider-specific settings
  }) => LanguageModelV1; // The AI SDK LanguageModel instance
  getApiKeyLink?: string; // Optional link to get an API key for this provider
  labelForGetApiKey?: string; // Optional label for the API key link
  icon?: string; // Optional icon identifier for the provider
}

// Represents configuration specific to a provider (e.g., base URL env var key)
export interface ProviderConfig {
  baseUrlKey?: string; // Environment variable key for the provider's base URL
  baseUrl?: string; // Default base URL if not specified in env or settings
  apiTokenKey?: string; // Environment variable key for the provider's API token/key
}

// Represents settings for a specific provider stored in the database
// This type is used in the frontend to manage provider settings via the Admin UI
export interface IProviderSetting {
  providerName: string; // Name of the provider (matches ProviderInfo.name)
  enabled: boolean; // Whether the provider is enabled
  apiKey?: string; // The API key for this provider
  baseUrl?: string; // Custom base URL for this provider (optional)
  // Add other provider-specific settings here
}

// Define Env type if it's not globally available (conceptual backend type)
// type Env = Record<string, string | undefined>; // Example definition for backend Env

// Re-export types if needed elsewhere
// export type { LanguageModelV1 };
