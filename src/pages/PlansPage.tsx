import React from 'react';
import { X, Check, Sparkles, DollarSign } from 'lucide-react';
import { Plan } from '../types';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

// Updated PlanDisplay type to reflect only the desired plans
interface PlanDisplay extends Plan {
  type: 'free' | 'pro' | 'enterprise';
  highlighted?: boolean;
}

const PlansPage: React.FC = () => {
  // Updated plans array to only include free, pro, and enterprise
  const plans: PlanDisplay[] = [
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

  const handleChoosePlan = async (planId: string) => {
    if (planId === 'enterprise') { // Only enterprise requires contact now
      alert(`Simulado: Redirecionaria para a página de contato para o plano ${planId}.`);
      // In a real app, navigate to a contact page or open a contact form
      return;
    }
    try {
      // Call the simulated API to create a checkout session
      const response = await api.payments.createCheckoutSession(planId);
      console.log(`[Simulação Pagamento] Sessão de checkout criada para o plano ${planId}:`, response);
      /*
        // --- Produção: Redirect to Payment Gateway ---
        // Em produção, o backend retornaria uma URL de redirecionamento do gateway de pagamento.
        // Você redirecionaria o usuário para essa URL para completar o pagamento.
        // Exemplo:
        // window.location.href = response.redirectUrl;
        // --- End Production Notes ---
      */
      alert(`Simulado: Redirecionaria para o checkout do gateway de pagamento para o plano ${planId}.`);
    } catch (error) {
      console.error(`[Simulação Pagamento] Erro ao criar sessão de checkout para o plano ${planId}:`, error);
      alert("Falha ao iniciar o processo de pagamento.");
    }
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign size={24} className="text-primary" />
          Planos e Preços
        </h1>
        {/* Optional: Add a back button if needed */}
        {/* <Link to="/" className="btn btn-outline">Voltar</Link> */}
      </div>

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
                  onClick={() => handleChoosePlan(plan.type)}
                >
                  {plan.type === 'enterprise' ? 'Fale conosco' : 'Escolher plano'}
                </button>
              </div>
            ))}
          </div>

          {/* Removed the separate Edu section */}
        </div>
      );
    };

export default PlansPage;
