export type Theme = 'light' | 'dark';

export type MessageRole = 'user' | 'assistant' | 'system'; // Added 'system' role

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  conversation_id?: string; // Added conversation_id for context
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: AIModel;
  user_id?: string; // Added user_id for context
}

export interface UserPreferences {
  theme: Theme;
  fontSize: 'small' | 'medium' | 'large';
  responseStyle: 'formal' | 'creative' | 'technical';
  enableHistory: boolean;
  user_id?: string; // Added user_id for context
}

// Updated AIModel type to be a string to allow any model name from providers
export type AIModel = string;

// Updated PlanType enum to only include the specified plans
export type PlanType = 'free' | 'pro' | 'enterprise' | 'administrador'; // Added 'administrador' as a potential type for visibility checks

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'administrador';
  plan: PlanType; // User's current plan
  createdAt: Date;
  status?: string; // Added status property
}

// Added Plan interface based on PlansModal/PlansPage
export interface Plan {
  type: PlanType;
  name: string;
  description: string;
  price: string | number | null; // Allow null for Enterprise
  features: string[];
  highlighted?: boolean; // Optional for styling
}
