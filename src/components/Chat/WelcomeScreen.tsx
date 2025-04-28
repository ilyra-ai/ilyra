import React from 'react';
import { Sparkles, Code, PencilRuler, BrainCircuit, Zap, MessageCircle } from 'lucide-react'; // Added MessageCircle
import { useApp } from '../../context/AppContext';
import PlanBadge from '../UI/PlanBadge'; // Import PlanBadge

const WelcomeScreen: React.FC = () => {
  const { sendMessage, user } = useApp(); // Get user from context

  // Example prompts (optional, keep if desired)
  const examplePrompts = [
    {
      text: 'O que é a plataforma iLyra?',
      icon: <BrainCircuit size={16} />,
    },
    {
      text: 'Quais são os planos disponíveis?',
      icon: <Zap size={16} />,
    },
    {
      text: 'Escreva uma receita de bolo de chocolate',
      icon: <PencilRuler size={16} />,
    },
    {
      text: 'Crie um código em JavaScript para uma calculadora',
      icon: <Code size={16} />,
    },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background"> {/* Ensure background color */}
      <div className="max-w-2xl">
        {/* Logo and Plan */}
        <div className="flex flex-col items-center mb-6">
          {/* Using MessageCircle as a placeholder logo icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white mb-2"> {/* Adjusted margin */}
             <MessageCircle size={40} /> {/* Using MessageCircle icon */}
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1"> {/* Adjusted size */}
            iLyra
          </span>
          {user?.plan && (
            <div className="text-lg">
              <PlanBadge plan={user.plan} />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-3 text-text">Como posso ajudar você hoje?</h1> {/* Adjusted text color */}

        {/* Example Prompts (Optional, keep if desired) */}
        {/*
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              className="text-left p-4 border border-border rounded-lg hover:bg-card flex items-center gap-3 transition-colors"
              onClick={() => sendMessage(prompt.text)}
            >
              <span className="text-primary">{prompt.icon}</span>
              <span className="text-sm">{prompt.text}</span>
            </button>
          ))}
        </div>
        */}

        {/* Feature Icons (Optional, keep if desired) */}
        {/*
        <div className="flex gap-3 justify-center flex-wrap">
          <div className="flex items-center gap-2 text-sm text-text/70">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap size={14} className="text-primary" />
            </div>
            <span>Resposta rápida</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text/70">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
              <PencilRuler size={14} className="text-secondary" />
            </div>
            <span>Criação de conteúdo</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text/70">
            <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
              <Code size={14} className="text-success" />
            </div>
            <span>Geração de código</span>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default WelcomeScreen;
