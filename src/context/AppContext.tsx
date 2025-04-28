import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, UserPreferences, Conversation, Message, AIModel, User, PlanType, MessageRole, Plan } from '../types'; // Import Plan type
import { generateUniqueId } from '../utils/helpers';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

interface AppContextProps {
  theme: Theme;
  toggleTheme: () => void;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  createNewConversation: () => Promise<Conversation | undefined>;
  sendMessage: (content: string) => Promise<void>;
  userPreferences: UserPreferences;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  isWaitingForResponse: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearConversations: () => void;
  deleteConversation: (conversationId: string) => void;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  showPlansModal: boolean;
  setShowPlansModal: (show: boolean) => void;
  freeMessageCount: number; // This is a simulation count, not tied to backend state yet
  isLoadingHistory: boolean;
  isContextReady: boolean;
  platformSettings: any;
  plans: Plan[]; // Add plans to context
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  fontSize: 'medium',
  responseStyle: 'formal',
  enableHistory: true,
};

const defaultModel: AIModel = 'gpt-3.5';

const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
  const [selectedModel, setSelectedModel] = useState<AIModel>(defaultModel);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [freeMessageCount, setFreeMessageCount] = useState(0); // Simular contagem
  const navigate = useNavigate();
  const location = useLocation();
  const [currentConversation, setCurrentConversationState] = useState<Conversation | null>(null);
  const [isContextReady, setIsContextReady] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]); // State for plans


  // Effect to check auth and load platform settings and plans on mount
  useEffect(() => {
    const initializeApp = async () => {
      console.log("[AppContext] Inicializando App...");
      try {
        // 1. Carregar configurações da plataforma primeiro
        const settings = await api.admin.settings.get();
        setPlatformSettings(settings);
        console.log("[AppContext] Configurações da plataforma carregadas:", settings);

        // 2. Carregar planos
        const fetchedPlans = await api.admin.plans.get();
        setPlans(fetchedPlans);
        console.log("[AppContext] Planos carregados:", fetchedPlans);

        // 3. Tentar buscar usuário atual (simulado)
        const fetchedUser = await api.auth.getCurrentUser();
        if (fetchedUser) {
          setUser(fetchedUser);
          console.log("[AppContext] Verificação inicial de auth: Usuário encontrado (simulado).");
        } else {
          setUser(null);
          console.log("[AppContext] Verificação inicial de auth: Nenhum usuário encontrado.");
        }
      } catch (error) {
        console.error("[AppContext] Erro na inicialização (settings, plans ou auth check):", error);
        // Definir um estado de erro ou configurações/planos padrão se necessário
        setPlatformSettings({}); // Define objeto vazio em caso de erro
        setPlans([]); // Define array vazio em caso de erro
        setUser(null);
      } finally {
        setIsContextReady(true); // Contexto está pronto após tentativas iniciais
        console.log("[AppContext] Contexto pronto.");
      }
    };

    initializeApp();
  }, []); // Executar apenas na montagem


  // Effect to load user data or redirect based on user state and context readiness
  useEffect(() => {
    // Só executa se o contexto estiver pronto
    if (!isContextReady) {
      console.log("[AppContext] Contexto ainda não está pronto, aguardando...");
      return;
    }
    console.log("[AppContext] Contexto pronto, verificando estado do usuário...");

    if (user) {
      console.log("[AppContext] Usuário logado, carregando dados:", user.id);
      loadUserData(user.id);

      // Redirecionar usuários logados das páginas de autenticação ou landing
      if (['/', '/auth/login', '/auth/register'].includes(location.pathname)) {
         console.log("[AppContext] Usuário logado em página de auth/landing, redirecionando...");
         // MODIFIED: Removed admin redirect here, handled in ChatWindowPage
         navigate('/chat'); // Redireciona qualquer usuário logado para o chat
      }
      // Se já estiver em uma página protegida e logado, não faz nada (permanece na página)

    } else {
      // Limpar estado específico do usuário ao deslogar
      console.log("[AppContext] Usuário não logado ou deslogado, limpando dados.");
      setConversations([]);
      setCurrentConversationState(null);
      setUserPreferences(defaultPreferences);
      setFreeMessageCount(0); // Resetar contagem

      // Redirecionar de páginas protegidas se não estiver logado
      const protectedPaths = ['/chat', '/profile', '/settings', '/help', '/planos', '/admin'];
      if (protectedPaths.some(path => location.pathname.startsWith(path))) {
         console.log("[AppContext] Acesso a rota protegida sem login, redirecionando para /auth/login");
         navigate('/auth/login'); // Redirecionar para login
      }
      // Se estiver na landing page ou auth page e não logado, permanece nelas
    }
  }, [user, isContextReady, navigate, location.pathname]); // Depende de user e isContextReady


  const loadUserData = async (userId: string) => {
     setIsLoadingHistory(true); // Usar isLoadingHistory para indicar carregamento geral de dados do usuário
     try {
       // Carregar Preferências
       const prefs = await api.user.getPreferences(userId);
       if (prefs) {
          setUserPreferences(prefs);
          setTheme(prefs.theme);
          console.log("[AppContext] Preferências do usuário carregadas:", prefs);
       } else {
          const defaultPrefs = defaultPreferences;
          await api.user.updatePreferences(userId, defaultPrefs);
          setUserPreferences(defaultPrefs);
          setTheme(defaultPrefs.theme);
          console.log("[AppContext] Preferências não encontradas, padrões criados.");
       }

       // Carregar Conversas (se a opção de histórico estiver habilitada)
       if (userPreferences.enableHistory) {
         const fetchedConversations = await api.user.getConversations(userId);
         setConversations(fetchedConversations);
         console.log("[AppContext] Conversas carregadas:", fetchedConversations.length);

         // Definir conversa atual e carregar mensagens
         if (fetchedConversations.length > 0) {
            const firstConv = fetchedConversations[0];
            // Não definir como atual automaticamente, deixar o usuário clicar
            // setCurrentConversationState(firstConv);
            // console.log("[AppContext] Definindo conversa atual:", firstConv.id);
            // await loadMessagesForConversation(firstConv.id);
         } else {
            setCurrentConversationState(null);
            console.log("[AppContext] Nenhuma conversa encontrada.");
         }
       } else {
         setConversations([]);
         setCurrentConversationState(null);
         console.log("[AppContext] Histórico desabilitado, não carregando conversas.");
       }

       // Simular carregamento da contagem de mensagens gratuitas (se aplicável)
       // This count is currently just a simulation and not tied to backend state
       if (user?.plan === 'free') {
         // In a real backend, fetch the actual message count for the current billing period
         setFreeMessageCount(0); // Reset for simulation clarity
         console.log("[AppContext] Contagem de mensagens gratuitas resetada (simulação).");
       }


     } catch (error) {
       console.error("[AppContext] Erro ao carregar dados do usuário via API simulada:", error);
     } finally {
       setIsLoadingHistory(false);
     }
  };

  const loadMessagesForConversation = async (conversationId: string) => {
     setIsLoadingHistory(true);
     try {
       const messages = await api.user.getMessages(conversationId);
       console.log(`[AppContext] Mensagens carregadas para conversa ${conversationId}:`, messages.length);

       setConversations(prevConvs => prevConvs.map(conv =>
          conv.id === conversationId ? { ...conv, messages: messages } : conv
       ));
       setCurrentConversationState(prevCurrent =>
          prevCurrent?.id === conversationId ? { ...prevCurrent, messages: messages } : prevCurrent
       );
     } catch (error) {
       console.error("[AppContext] Erro ao carregar mensagens para conversa via API simulada:", conversationId, error);
     } finally {
       setIsLoadingHistory(false);
     }
  };


  // Atualizar tema no HTML
  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const login = async (email: string, password: string) => {
    try {
      console.log("[AppContext] Tentando login para:", email);
      const loggedInUser = await api.auth.login(email, password);
      if (loggedInUser) {
         setUser(loggedInUser); // Define o usuário no estado
         console.log("[AppContext] Login bem-sucedido, usuário definido:", loggedInUser.id);
         // Navegação será tratada pelo useEffect [user]
      } else {
         console.warn("[AppContext] Login falhou na API mas não lançou erro.");
         throw new Error('Falha no login.'); // Erro genérico
      }
    } catch (error: any) {
      console.error('[AppContext] Erro de login capturado:', error);
      throw new Error(error.message || 'Erro ao fazer login.'); // Re-lança para UI
    }
  };

  const register = async (email: string, password: string, name: string) => {
     try {
        console.log("[AppContext] Tentando registro para:", email);
        const newUser = await api.auth.register(email, password, name);
        if (newUser) {
           console.warn("[AppContext] Registro simulado bem-sucedido inesperadamente.");
           throw new Error('Registro simulado falhou. Apenas douglas@ilyra.com.br está ativo.');
        } else {
           console.warn("[AppContext] Registro falhou na simulação mas não lançou erro.");
           throw new Error('Falha no registro.');
        }
     } catch (error: any) {
        console.error('[AppContext] Erro de registro simulado capturado:', error);
        throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
     }
  };

  const logout = async () => {
     try {
        console.log("[AppContext] Tentando logout.");
        await api.auth.logout();
        setUser(null); // Limpa o usuário localmente
        console.log("[AppContext] Logout bem-sucedido, estado do usuário limpo.");
        // Navegação será tratada pelo useEffect [user]
     } catch (error) {
        console.error('[AppContext] Erro de logout simulado:', error);
        alert('Falha ao fazer logout.');
     }
  };

  const signInWithProvider = async (provider: 'google' | 'apple') => {
     try {
        console.log(`[AppContext] Tentando login social com ${provider}.`);
        await api.auth.signInWithOAuth(provider);
        alert(`Simulado: Redirecionaria para o login com ${provider}.`);
     } catch (error: any) {
        console.error(`[AppContext] Erro de login social simulado (${provider}):`, error);
        throw new Error(error.message || `Erro ao fazer login com ${provider}.`);
     }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user?.id) {
       console.warn("[AppContext] Usuário não logado, não pode atualizar perfil.");
       return;
    }
    try {
      console.log("[AppContext] Tentando atualizar perfil para usuário:", user.id, data);
      await api.user.updateProfile(user.id, data);
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null); // Atualiza estado local
      console.log("[AppContext] Perfil atualizado localmente (simulado).");
    } catch (error) {
      console.error("[AppContext] Erro ao atualizar perfil via API simulada:", error);
      throw new Error("Falha ao atualizar perfil.");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    // Não chama updateUserPreferences aqui para evitar chamadas de API desnecessárias
    // A preferência será salva quando o usuário for para a página de configurações
    setTheme(newTheme);
    console.log("[AppContext] Tema alterado para:", newTheme);
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user?.id) {
       console.warn("[AppContext] Usuário não logado, não pode atualizar preferências.");
       return;
    }
    try {
      const newPreferences = { ...userPreferences, ...preferences };
      console.log("[AppContext] Tentando atualizar preferências para usuário:", user.id, newPreferences);
      await api.user.updatePreferences(user.id, newPreferences);
      setUserPreferences(newPreferences); // Atualiza estado local
      if (preferences.theme) {
        setTheme(preferences.theme); // Atualiza tema global se alterado
      }
      console.log("[AppContext] Preferências do usuário atualizadas localmente (simulado).");
    } catch (error) {
      console.error("[AppContext] Erro ao atualizar preferências do usuário via API simulada:", error);
      throw new Error("Falha ao atualizar preferências.");
    }
  };

  const createNewConversation = async () => {
    if (!user) {
       console.warn("[AppContext] Usuário não logado, não pode criar conversa.");
       navigate('/auth/login');
       return undefined;
    }
    const tempId = generateUniqueId(); // ID temporário para UI
    const newConversationData: Partial<Conversation> = {
      // id: tempId, // ID será definido pelo backend (simulado)
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel,
    };

    try {
      console.log("[AppContext] Tentando criar nova conversa para usuário:", user.id);
      const createdConversation = await api.user.createConversation(user.id, newConversationData);

      // Atualizar estado local com a conversa retornada pela API (que tem o ID real)
      setConversations((prev) => [createdConversation, ...prev].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      setCurrentConversationState(createdConversation); // Define a nova conversa como ativa
      console.log("[AppContext] Nova conversa criada via API simulada:", createdConversation.id);
      return createdConversation;
    } catch (error) {
      console.error("[AppContext] Erro ao criar nova conversa via API simulada:", error);
      throw new Error("Falha ao criar nova conversa.");
    }
  };

  const clearConversations = async () => {
    if (!user) {
       console.warn("[AppContext] Usuário não logado, não pode limpar conversas.");
       return;
    }
    if (!confirm('Tem certeza que deseja limpar todo o histórico de conversas? Esta ação não pode ser desfeita.')) {
        return;
    }
    try {
      console.log("[AppContext] Tentando limpar conversas para usuário:", user.id);
      await api.user.clearConversations(user.id);
      setConversations([]);
      setCurrentConversationState(null);
      console.log("[AppContext] Todas as conversas limpas via API simulada para usuário:", user.id);
    } catch (error) {
      console.error("[AppContext] Erro ao limpar conversas via API simulada:", error);
      throw new Error("Falha ao limpar conversas.");
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) {
       console.warn("[AppContext] Usuário não logado, não pode excluir conversa.");
       return;
    }
     if (!confirm('Tem certeza que deseja excluir esta conversa?')) {
        return;
    }
    try {
      console.log(`[AppContext] Tentando excluir conversa ${conversationId} para usuário:`, user.id);
      await api.user.deleteConversation(conversationId, user.id);

      setConversations(prevConversations => {
        const updatedConversations = prevConversations.filter(conv => conv.id !== conversationId);
        if (currentConversationState?.id === conversationId) {
          // Se a conversa excluída era a atual, seleciona a próxima ou nenhuma
          setCurrentConversationState(updatedConversations.length > 0 ? updatedConversations[0] : null);
        }
        return updatedConversations;
      });
      console.log("[AppContext] Conversa excluída via API simulada:", conversationId);
    } catch (error) {
      console.error("[AppContext] Erro ao excluir conversa via API simulada:", error);
      throw new Error("Falha ao excluir conversa.");
    }
  };

  // Simulação de resposta da IA (mantida para demonstração)
  const getAIResponse = (userMessage: string): Promise<string> => {
    return new Promise((resolve) => {
      const greeting = userMessage.toLowerCase().includes('olá') || userMessage.toLowerCase().includes('oi');
      const aboutPlatform = userMessage.toLowerCase().includes('ilyra') || userMessage.toLowerCase().includes('plataforma');
      const aboutPlans = userMessage.toLowerCase().includes('plano') || userMessage.toLowerCase().includes('preço');

      setTimeout(() => {
        if (greeting) {
          resolve('Olá! Como posso ajudar você hoje? Sou a iLyra, uma assistente virtual projetada para responder perguntas, ajudar com tarefas e fornecer informações úteis.');
        } else if (aboutPlatform) {
          resolve('A iLyra é uma plataforma de inteligência artificial interativa que permite aos usuários conversar com um assistente virtual. Oferecemos recursos como geração de textos, análises de dados, tradução, criação de código e geração de imagens a partir de descrições textuais. Nossa tecnologia avançada é constantemente atualizada para garantir respostas precisas e úteis.');
        } else if (aboutPlans) {
          resolve('A iLyra oferece diversos planos:\n\n• iLyra Free: Versão gratuita com acesso às funcionalidades básicas\n• iLyra Pro: Velocidade prioritária e acesso a recursos avançados (R$49/mês)\n• iLyra Enterprise: Solução corporativa personalizada (preço sob consulta)\n\nPosso fornecer mais detalhes sobre algum plano específico?');
        } else {
          resolve(`Simulação: Recebi "${userMessage}". Em um ambiente real, eu processaria isso com o modelo ${selectedModel} e responderia adequadamente.`);
        }
      }, 1500);
    });
  };

  const sendMessage = async (content: string) => {
    if (!user) {
       console.warn("[AppContext] Usuário não logado, não pode enviar mensagem.");
       navigate('/auth/login');
       return;
    }

    // Verificar limite de mensagens gratuitas (agora busca do plano do usuário)
    // MODIFIED: Use the plans state from context
    const userPlanDetails = plans.find(p => p.id === user.plan);
    const messageLimit = userPlanDetails?.message_limit ?? null; // Use limit from plan, null for unlimited

    if (messageLimit !== null && freeMessageCount >= messageLimit) {
      setShowPlansModal(true); // Mostrar modal de planos se atingir o limite
      console.log("[AppContext] Limite de mensagens atingido para o plano:", user.plan);
      return;
    }

    let conversationToUpdate = currentConversationState;
    let isNewConversation = false;

    // Se não houver conversa atual, cria uma nova PRIMEIRO
    if (!conversationToUpdate) {
       console.log("[AppContext] Nenhuma conversa atual, criando uma nova...");
       const newConv = await createNewConversation();
       if (!newConv) {
         console.error("[AppContext] Falha ao criar nova conversa antes de enviar mensagem.");
         return; // Não prosseguir se a criação da conversa falhar
       }
       conversationToUpdate = newConv;
       isNewConversation = true; // Marcar que é nova
    }

    // Agora que temos certeza que conversationToUpdate existe...
    const userMessage: Message = {
      id: generateUniqueId(), // ID temporário, backend deve gerar o real
      role: 'user',
      content,
      timestamp: new Date(),
      conversation_id: conversationToUpdate.id, // Adicionar conversation_id
    };

    // Atualizar estado local IMEDIATAMENTE com a mensagem do usuário
    const updatedMessages = [...(conversationToUpdate.messages || []), userMessage];
    const updatedConversation = {
      ...conversationToUpdate,
      messages: updatedMessages,
      updatedAt: new Date(),
      // Atualizar título apenas se for a primeira mensagem da conversa
      title: (conversationToUpdate.messages?.length || 0) === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : conversationToUpdate.title,
    };

    setConversations(prevConversations => {
       const otherConversations = prevConversations.filter(conv => conv.id !== updatedConversation.id);
       return [updatedConversation, ...otherConversations].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });
    setCurrentConversationState(updatedConversation); // Atualiza a conversa atual
    setIsWaitingForResponse(true); // Inicia espera pela resposta da IA

    // Incrementar contagem de mensagens (simulação)
    // This is a simple simulation and doesn't reset based on billing cycles
    setFreeMessageCount(prev => prev + 1); // Incrementa para qualquer plano na simulação


    try {
      console.log("[AppContext] Enviando mensagem do usuário via API simulada.");
      // Enviar mensagem para a API simulada (backend)
      await api.chat.send(content, updatedConversation.id, selectedModel);
      console.log("[AppContext] Mensagem do usuário enviada via API simulada.");

      // Simular recebimento da resposta da IA (substituir por chamada real ao backend/LLM)
      const aiResponseContent = await getAIResponse(content); // Usando a simulação local
      const aiMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
        conversation_id: updatedConversation.id, // Adicionar conversation_id
      };

      // Atualizar estado local com a resposta da IA
      setConversations(prevConversations => {
         return prevConversations.map(conv =>
            conv.id === updatedConversation.id
              ? { ...conv, messages: [...(conv.messages || []), aiMessage], updatedAt: new Date() }
              : conv
         ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      });
       setCurrentConversationState(prevCurrent =>
          prevCurrent?.id === updatedConversation.id
            ? { ...prevCurrent, messages: [...(prevCurrent.messages || []), aiMessage], updatedAt: new Date() }
            : prevCurrent
       );


    } catch (error) {
      console.error("[AppContext] Erro ao enviar mensagem ou receber resposta via API simulada:", error);
      // Adicionar mensagem de erro na UI?
       const errorMessage: Message = {
         id: generateUniqueId(),
         role: 'system', // Usar role 'system' para erros
         content: `Erro ao processar a mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
         timestamp: new Date(),
         conversation_id: updatedConversation.id,
       };
        setConversations(prevConversations => {
         return prevConversations.map(conv =>
            conv.id === updatedConversation.id
              ? { ...conv, messages: [...(conv.messages || []), errorMessage], updatedAt: new Date() }
              : conv
         ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      });
       setCurrentConversationState(prevCurrent =>
          prevCurrent?.id === updatedConversation.id
            ? { ...prevCurrent, messages: [...(prevCurrent.messages || []), errorMessage], updatedAt: new Date() }
            : prevCurrent
       );
    } finally {
      setIsWaitingForResponse(false);
      console.log("[AppContext] Finalizada espera por resposta.");
    }
  };

  const setCurrentConversation = async (conversation: Conversation | null) => {
     if (conversation) {
        console.log("[AppContext] Tentando definir conversa atual:", conversation.id);
        const fullConversation = conversations.find(conv => conv.id === conversation.id);
        if (fullConversation) {
           setCurrentConversationState(fullConversation);
           console.log("[AppContext] Conversa atual definida:", fullConversation.id);
           // Carregar mensagens se não estiverem carregadas ou se o histórico estiver habilitado
           if (userPreferences.enableHistory && (!fullConversation.messages || fullConversation.messages.length === 0)) {
              console.log("[AppContext] Mensagens não carregadas, buscando...");
              await loadMessagesForConversation(fullConversation.id);
           } else {
              console.log("[AppContext] Mensagens já carregadas ou histórico desabilitado.");
           }
        } else {
           setCurrentConversationState(null);
           console.warn("[AppContext] Tentativa de definir conversa atual não encontrada no estado:", conversation.id);
        }
     } else {
        setCurrentConversationState(null);
        console.log("[AppContext] Conversa atual definida como null.");
     }
  };

  // Renderizar loading inicial enquanto o contexto não está pronto
  if (!isContextReady) {
    return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="flex flex-col items-center">
           <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
             i
           </div>
           <h1 className="mt-4 text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
             iLyra
           </h1>
           <div className="mt-4 flex gap-1">
             <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
             <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
           </div>
         </div>
       </div>
    );
  }


  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        conversations,
        currentConversation,
        setCurrentConversation,
        createNewConversation,
        sendMessage,
        userPreferences,
        updateUserPreferences,
        selectedModel,
        setSelectedModel,
        isWaitingForResponse,
        user,
        login,
        register,
        logout,
        updateProfile,
        clearConversations,
        deleteConversation,
        signInWithProvider,
        showPlansModal,
        setShowPlansModal,
        freeMessageCount,
        isLoadingHistory,
        isContextReady,
        platformSettings,
        plans, // Provide plans in context
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { AppProvider, useApp };
