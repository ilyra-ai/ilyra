import React from 'react';
import { HelpCircle, Book, MessageSquare, Code, Image, Zap, ChevronDown } from 'lucide-react';

const HelpPage: React.FC = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle size={24} className="text-primary" />
          Central de Ajuda
        </h1>
        <p className="text-text/70">Encontre respostas para suas dúvidas sobre a iLyra</p>
      </div>

      <div className="grid gap-6">
        <details className="group bg-card rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <Book size={20} className="text-primary" />
              <h3 className="font-medium">Como começar</h3>
            </div>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 pt-2 text-text/70">
            <p className="mb-4">
              A iLyra é uma plataforma de IA que oferece diversas funcionalidades para auxiliar em suas tarefas diárias.
              Para começar:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Crie uma nova conversa clicando no botão "Nova conversa"</li>
              <li>Escolha o modelo de IA mais adequado para sua necessidade</li>
              <li>Digite sua mensagem e pressione Enter para enviar</li>
              <li>Explore os diferentes recursos disponíveis na plataforma</li>
            </ol>
          </div>
        </details>

        <details className="group bg-card rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-primary" />
              <h3 className="font-medium">Conversas e Respostas</h3>
            </div>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 pt-2 text-text/70">
            <p>
              A iLyra oferece diferentes estilos de resposta e pode se adaptar às suas necessidades.
              Você pode ajustar o estilo nas configurações:
            </p>
            <ul className="mt-2 space-y-2">
              <li>• Formal: Para comunicações profissionais</li>
              <li>• Criativo: Para brainstorming e ideias</li>
              <li>• Técnico: Para explicações detalhadas</li>
            </ul>
          </div>
        </details>

        <details className="group bg-card rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <Code size={20} className="text-primary" />
              <h3 className="font-medium">Geração de Código</h3>
            </div>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 pt-2 text-text/70">
            <p>
              Para gerar código, simplesmente descreva o que deseja criar. A iLyra suporta
              diversas linguagens de programação e pode ajudar com:
            </p>
            <ul className="mt-2 space-y-2">
              <li>• Desenvolvimento web (HTML, CSS, JavaScript)</li>
              <li>• Programação backend (Python, Node.js, PHP)</li>
              <li>• Scripts e automações</li>
              <li>• Debugging e otimização</li>
            </ul>
          </div>
        </details>

        <details className="group bg-card rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <Image size={20} className="text-primary" />
              <h3 className="font-medium">Geração de Imagens</h3>
            </div>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 pt-2 text-text/70">
            <p>
              A geração de imagens está disponível nos planos Plus e superiores.
              Para gerar uma imagem:
            </p>
            <ol className="mt-2 list-decimal list-inside space-y-2">
              <li>Descreva em detalhes a imagem que deseja criar</li>
              <li>Especifique estilo, cores e elementos importantes</li>
              <li>Aguarde alguns segundos para a geração</li>
              <li>Baixe ou compartilhe a imagem gerada</li>
            </ol>
          </div>
        </details>

        <details className="group bg-card rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-primary" />
              <h3 className="font-medium">Planos e Recursos</h3>
            </div>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 pt-2 text-text/70">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">iLyra Free</h4>
                <ul className="list-disc list-inside">
                  <li>Acesso às funcionalidades básicas</li>
                  <li>Modelo GPT-3.5</li>
                  <li>Histórico limitado</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">iLyra Plus</h4>
                <ul className="list-disc list-inside">
                  <li>Todos os modelos de IA</li>
                  <li>Geração de imagens</li>
                  <li>Velocidade prioritária</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">iLyra Pro</h4>
                <ul className="list-disc list-inside">
                  <li>Workspace colaborativo</li>
                  <li>Suporte prioritário</li>
                  <li>Recursos avançados</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default HelpPage;
