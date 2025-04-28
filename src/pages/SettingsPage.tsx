import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Moon, Sun, Type, MessageSquare, Save, Loader2 } from 'lucide-react';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Define a type for a draggable element's position
interface DraggablePosition {
  x: number;
  y: number;
}

// Define a type for the layout configuration for this page
interface SettingsPageLayout {
  appearanceBox: DraggablePosition;
  responseBox: DraggablePosition;
  historyBox: DraggablePosition;
}

// Draggable component wrapper using useDraggable hook
// MODIFIED: Added isAdmin prop and visual cue
const DraggableItem: React.FC<{ id: string; defaultPosition: DraggablePosition; children: React.ReactNode; isAdmin: boolean }> = ({ id, defaultPosition, children, isAdmin }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  // Apply transform using CSS utility
  const style = {
    transform: CSS.Translate.toString(transform),
    position: 'relative', // Ensure relative positioning for transform
    zIndex: 1, // Default z-index
    // Add transition for smoother movement if needed
    // transition: 'transform 0.1s ease-out',
  };

  // MODIFIED: Apply setNodeRef, listeners, and attributes to the first child
  const child = React.Children.only(children) as React.ReactElement;

  return React.cloneElement(child, {
    ref: setNodeRef,
    style: { ...child.props.style, ...style }, // Merge existing styles with transform
    ...listeners,
    ...attributes,
    // MODIFIED: Add visual cue class only if isAdmin
    className: `${child.props.className || ''} cursor-move ${isAdmin ? 'border-2 border-dashed border-primary/50 p-2 rounded-lg' : ''}`.trim(),
  });
};


const SettingsPage: React.FC = () => {
  const { userPreferences, updateUserPreferences, user } = useApp();
  const isAdmin = user?.role === 'administrador';

  // State for the layout, initialized with default positions
  const [layout, setLayout] = useState<SettingsPageLayout>({
    appearanceBox: { x: 0, y: 0 },
    responseBox: { x: 0, y: 0 },
    historyBox: { x: 0, y: 0 },
  });

  // State to track if the layout has been modified
  const [isLayoutModified, setIsLayoutModified] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);


  // Load saved layout from local storage on component mount (only for admin)
  useEffect(() => {
    if (isAdmin) {
      const savedLayout = localStorage.getItem('settingsPageLayout');
      if (savedLayout) {
        try {
          setLayout(JSON.parse(savedLayout));
        } catch (error) {
          console.error("Failed to parse saved Settings page layout:", error);
          // Optionally clear invalid saved layout
          // localStorage.removeItem('settingsPageLayout');
        }
      }
    }
  }, [isAdmin]);

  // Save layout to local storage when it changes (only if modified and is admin)
  useEffect(() => {
    if (isAdmin && isLayoutModified) {
      // Simulate saving to backend
      setIsSavingLayout(true);
      console.log("Simulating saving Settings page layout to backend:", layout);
      // In a real app, you would call your backend API here:
      // api.admin.settings.savePageLayout('settingsPage', layout).then(() => {
      //   console.log("Settings page layout saved to backend.");
      //   setIsSavingLayout(false);
      // }).catch(error => {
      //   console.error("Failed to save Settings page layout:", error);
      //   setIsSavingLayout(false);
      // });

      // For simulation, just save to local storage after a delay
      const saveTimer = setTimeout(() => {
         localStorage.setItem('settingsPageLayout', JSON.stringify(layout));
         console.log("Settings page layout saved locally (simulated).");
         setIsLayoutModified(false); // Reset modified state after saving
         setIsSavingLayout(false);
      }, 500); // Simulate network delay

      return () => clearTimeout(saveTimer); // Cleanup timer
    }
  }, [layout, isLayoutModified, isAdmin]);


  // Handle drag end to update layout state and mark as modified
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as keyof SettingsPageLayout;

    setLayout(prevLayout => {
      const currentPosition = prevLayout[elementId] || { x: 0, y: 0 };
      const newPosition = {
        x: currentPosition.x + delta.x,
        y: currentPosition.y + delta.y,
      };
      return {
        ...prevLayout,
        [elementId]: newPosition,
      };
    });
    setIsLayoutModified(true); // Mark layout as modified
  };


  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={24} className="text-primary" />
          Configurações
        </h1>
        <p className="text-text/70">Personalize sua experiência na iLyra</p>
      </div>

      {/* Conditional DndContext wrapper for admin */}
      {isAdmin ? (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            {/* Appearance Section (Draggable) */}
            {/* MODIFIED: Pass isAdmin prop and removed handle class from inner div */}
            <DraggableItem id="appearanceBox" defaultPosition={layout.appearanceBox} isAdmin={isAdmin}>
              <div className="bg-card rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Aparência</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 block">Tema</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateUserPreferences({ theme: 'light' })}
                        className={`flex items-center gap-2 p-3 rounded-lg border ${
                          userPreferences.theme === 'light'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-card'
                        }`}
                      >
                        <Sun size={18} />
                        <span>Claro</span>
                      </button>
                      <button
                        onClick={() => updateUserPreferences({ theme: 'dark' })}
                        className={`flex items-center gap-2 p-3 rounded-lg border ${
                          userPreferences.theme === 'dark'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-card'
                        }`}
                      >
                        <Moon size={18} />
                        <span>Escuro</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 block">Tamanho da fonte</label>
                    <div className="flex gap-3">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => updateUserPreferences({ fontSize: size as 'small' | 'medium' | 'large' })}
                          className={`flex items-center gap-2 p-3 rounded-lg border ${
                            userPreferences.fontSize === size
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-card'
                          }`}
                        >
                          <Type size={size === 'small' ? 14 : size === 'medium' ? 18 : 22} />
                          <span className="capitalize">{size}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DraggableItem>

            {/* Responses Section (Draggable) */}
            {/* MODIFIED: Pass isAdmin prop and removed handle class from inner div */}
            <DraggableItem id="responseBox" defaultPosition={layout.responseBox} isAdmin={isAdmin}>
              <div className="bg-card rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Respostas</h2>
                <div>
                  <label className="block text-sm font-medium mb-2 block">Estilo de resposta</label>
                  <div className="flex gap-3">
                    {['formal', 'creative', 'technical'].map((style) => (
                      <button
                        key={style}
                        onClick={() => updateUserPreferences({ responseStyle: style as 'formal' | 'creative' | 'technical' })}
                        className={`flex items-center gap-2 p-3 rounded-lg border ${
                          userPreferences.responseStyle === style
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-card'
                        }`}
                      >
                        <MessageSquare size={18} />
                        <span className="capitalize">{style}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DraggableItem>

            {/* History Section (Draggable) */}
            {/* MODIFIED: Pass isAdmin prop and removed handle class from inner div */}
            <DraggableItem id="historyBox" defaultPosition={layout.historyBox} isAdmin={isAdmin}>
              <div className="bg-card rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Histórico</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Salvar histórico de conversas</p>
                    <p className="text-sm text-text/70">
                      Mantenha suas conversas salvas para referência futura
                    </p>
                  </div>
                  <button
                    onClick={() => updateUserPreferences({ enableHistory: !userPreferences.enableHistory })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userPreferences.enableHistory ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userPreferences.enableHistory ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </DraggableItem>
          </div>
        </DndContext>
      ) : (
        // Render non-draggable version for non-admins
        <div className="space-y-6">
           {/* Appearance Section */}
            <div className="bg-card rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Aparência</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 block">Tema</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateUserPreferences({ theme: 'light' })}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${
                        userPreferences.theme === 'light'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-card'
                      }`}
                    >
                      <Sun size={18} />
                      <span>Claro</span>
                    </button>
                    <button
                      onClick={() => updateUserPreferences({ theme: 'dark' })}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${
                        userPreferences.theme === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-card'
                      }`}
                    >
                      <Moon size={18} />
                      <span>Escuro</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 block">Tamanho da fonte</label>
                  <div className="flex gap-3">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateUserPreferences({ fontSize: size as 'small' | 'medium' | 'large' })}
                        className={`flex items-center gap-2 p-3 rounded-lg border ${
                          userPreferences.fontSize === size
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-card'
                        }`}
                      >
                        <Type size={size === 'small' ? 14 : size === 'medium' ? 18 : 22} />
                        <span className="capitalize">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Responses Section */}
            <div className="bg-card rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Respostas</h2>
              <div>
                <label className="block text-sm font-medium mb-2 block">Estilo de resposta</label>
                <div className="flex gap-3">
                  {['formal', 'creative', 'technical'].map((style) => (
                    <button
                      key={style}
                      onClick={() => updateUserPreferences({ responseStyle: style as 'formal' | 'creative' | 'technical' })}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${
                        userPreferences.responseStyle === style
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-card'
                      }`}
                    >
                      <MessageSquare size={18} />
                      <span className="capitalize">{style}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* History Section */}
            <div className="bg-card rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Histórico</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Salvar histórico de conversas</p>
                  <p className="text-sm text-text/70">
                    Mantenha suas conversas salvas para referência futura
                  </p>
                </div>
                <button
                  onClick={() => updateUserPreferences({ enableHistory: !userPreferences.enableHistory })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    userPreferences.enableHistory ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      userPreferences.enableHistory ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Optional: Add a save button for admin if layout is modified */}
      {isAdmin && isLayoutModified && !isSavingLayout && (
         <div className="fixed bottom-4 right-4 z-20">
           <button className="btn btn-primary" onClick={() => setIsLayoutModified(true)}> {/* Clicking this button triggers the save effect */}
             <Save size={18} /> Salvar Layout (Simulado)
           </button>
         </div>
      )}
       {isAdmin && isSavingLayout && (
         <div className="fixed bottom-4 right-4 z-20">
           <button className="btn btn-primary" disabled>
             <Loader2 size={18} className="animate-spin" /> Salvando...
           </button>
         </div>
      )}
    </div>
  );
};

export default SettingsPage;
