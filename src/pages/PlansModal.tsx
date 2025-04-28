import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Plan } from '../types';

interface PlansModalProps {
  onClose: () => void;
}

const PlansModal: React.FC<PlansModalProps> = ({ onClose }) => {
  // Updated plans array to only include free, pro, and enterprise
  const plans: Plan[] = [
    {
      type: 'free',
      name: 'iLyra Free',
      description: 'Para uso pessoal',
      price: 'Grátis',
      features: [
        'Acesso às funcionalidades básicas',
        'Histórico de conversas limitado',
        'Limite de mensagens em horários de pico',
        'Acesso apenas a um modelo de AI', // Updated feature description
      ],
    },
    {
      type: 'pro',
      name: 'iLyra Pro',
      description: 'Para uso avançado', // Updated description
      price: 'R$ 49/mês', // Updated price
      features: [
        'Acesso a todos os modelos de IA',
        'Velocidade prioritária',
        'Até 5x mais mensagens por hora',
        'Integração com outros modelos de AI', // Updated feature description
        'Suporte técnico prioritário',
        'Treinamentos personalizados',
      ],
      highlighted: true,
    },
    {
      type: 'enterprise',
      name: 'iLyra Enterprise',
      description: 'Para empresas',
      price: 'Contato',
      features: [
        'Personalização de modelos',
        'Integração em sistemas internos',
        'Segurança reforçada',
        'Garantia de isolamento de dados',
        'SLAs (Acordos de Nível de Serviço)',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Escolha seu plano</h2>
            <p className="text-text/70">Aprimore sua experiência com a iLyra</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-card"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"> {/* Adjusted grid columns */}
            {plans.map((plan) => (
              <div
                key={plan.type}
                className={`border rounded-xl p-6 flex flex-col h-full relative ${
                  plan.highlighted
                    ? 'border-primary shadow-md shadow-primary/10'
                    : 'border-border'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>Mais popular</span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-text/70">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <p className="text-2xl font-bold">{plan.price}</p>
                  {plan.type !== 'enterprise' && plan.type !== 'free' && (
                    <p className="text-xs text-text/70">Faturado mensalmente</p>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check
                        size={16}
                        className={`mt-1 ${
                          plan.highlighted ? 'text-primary' : 'text-success'
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn w-full ${
                    plan.highlighted ? 'btn-primary' : 'btn-outline'
                  }`}
                  // Add onClick handler if needed for modal buttons
                >
                  {plan.type === 'enterprise' ? 'Fale conosco' : 'Escolher plano'}
                </button>
              </div>
            ))}
          </div>

          {/* Removed the separate Edu section */}
        </div>
      </div>
    </div>
  );
};

export default PlansModal;
