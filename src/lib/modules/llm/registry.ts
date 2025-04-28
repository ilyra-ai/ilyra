// NOTE: This file represents conceptual backend code for registering LLM providers.
// It is included in the frontend project structure for completeness but is NOT executed
// in the browser environment. The frontend interacts with a simulated backend via api.ts.

// In a real backend, this file would import actual provider implementations
// and potentially be used by the LLMManager to register them.

// Example imports (conceptual):
import AnthropicProvider from './providers/anthropic'; // Import the new provider
import CohereProvider from './providers/cohere'; // Import the new provider
import DeepseekProvider from './providers/deepseek'; // Import the new provider
import GoogleProvider from './providers/google';
import GroqProvider from './providers/groq'; // Import the new provider
import HuggingFaceProvider from './providers/huggingface';
import LMStudioProvider from './providers/lmstudio'; // Import the new provider
import MistralProvider from './providers/mistral'; // Import the new provider
import OllamaProvider from './providers/ollama';
import OpenRouterProvider from './providers/open-router'; // Import the new provider
import OpenAILikeProvider from './providers/openai-like'; // Import the new provider
import OpenAIProvider from './providers/openai'; // Import the new provider
import PerplexityProvider from './providers/perplexity'; // Import the new provider
import TogetherProvider from './providers/together'; // Import the new provider
import XAIProvider from './providers/xai'; // Import the new provider
import HyperbolicProvider from './providers/hyperbolic'; // Import the new provider
import AmazonBedrockProvider from './providers/amazon-bedrock';
import GithubProvider from './providers/github'; // Import the new provider

// In the frontend simulation, this file primarily serves to define the list of *known* providers
// that the Admin UI might display, even if their backend implementations aren't active here.

// Define a list of known providers for frontend display purposes
export const knownProviders = [
  { name: 'OpenAI', label: 'OpenAI', icon: 'i-simple-icons:openai' },
  { name: 'Anthropic', label: 'Anthropic', icon: 'i-simple-icons:anthropic' },
  { name: 'Google', label: 'Google AI', icon: 'i-simple-icons:google' },
  { name: 'HuggingFace', label: 'Hugging Face', icon: 'i-simple-icons:huggingface' },
  { name: 'Ollama', label: 'Ollama', icon: 'i-ph:cloud-arrow-down' }, // Using icon from Ollama provider
  { name: 'Mistral', label: 'Mistral AI', icon: 'i-simple-icons:mistral' },
  { name: 'Cohere', label: 'Cohere', icon: 'i-simple-icons:cohere' },
  { name: 'Groq', label: 'Groq', icon: 'i-simple-icons:groq' },
  { name: 'Perplexity', label: 'Perplexity AI', icon: 'i-simple-icons:perplexity' }, // Added Perplexity
  { name: 'Together', label: 'Together AI', icon: 'i-simple-icons:togetherai' }, // Added Together
  { name: 'Deepseek', label: 'Deepseek AI', icon: 'i-simple-icons:deepseek' },
  { name: 'OpenRouter', label: 'OpenRouter', icon: 'i-simple-icons:openrouter' },
  { name: 'XAI', label: 'XAI', icon: 'i-simple-icons:xai' }, // Added xAI
  { name: 'Hyperbolic', label: 'Hyperbolic', icon: 'i-simple-icons:hyperbolic' },
  { name: 'AmazonBedrock', label: 'Amazon Bedrock', icon: 'i-simple-icons:amazonaws' },
  { name: 'Github', label: 'GitHub', icon: 'i-simple-icons:github' },
  { name: 'LMStudio', label: 'LM Studio', icon: 'i-ph:cloud-arrow-down' },
  { name: 'OpenAILike', label: 'OpenAI Compatible', icon: 'i-simple-icons:openai' },
];

// Re-export conceptual provider classes if needed for type hinting, but they won't be instantiated in frontend
// export { AnthropicProvider, GoogleProvider, HuggingFaceProvider, OllamaProvider, AmazonBedrockProvider };
