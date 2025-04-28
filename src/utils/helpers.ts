import { type } from "os";

// Generate a unique ID
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format short date (for conversation list)
export const formatShortDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return 'Hoje';
  } else if (isSameDay(date, yesterday)) {
    return 'Ontem';
  } else {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  }
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Simulate typing effect
export const simulateTyping = (
  text: string,
  onUpdate: (text: string) => void,
  onComplete: () => void
): void => {
  let currentIndex = 0;
  const interval = setInterval(() => {
    currentIndex++;
    onUpdate(text.substring(0, currentIndex));

    if (currentIndex >= text.length) {
      clearInterval(interval);
      onComplete();
    }
  }, 20);
};

// Get placeholder text for input based on selected model
export const getInputPlaceholder = (model: string): string => {
  switch (model) {
    case 'gpt-4':
      return 'Mensagem para GPT-4...';
    case 'claude-3':
      return 'Mensagem para Claude-3...';
    case 'llama-3':
      return 'Mensagem para Llama-3...';
    case 'gemini-pro':
      return 'Mensagem para Gemini Pro...';
    default:
      return 'Envie uma mensagem...';
  }
};
