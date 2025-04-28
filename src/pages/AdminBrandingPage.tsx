import React, { useState, useEffect, useRef } from 'react';
import { Palette, Upload, Save, Loader2, Layout, Menu, Sidebar as SidebarIcon, Section, Settings, ToggleLeft, ToggleRight } from 'lucide-react'; // Added ToggleLeft and ToggleRight
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { PlanType } from '../types'; // Import PlanType
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core'; // Import Dnd-kit hooks
import { CSS } from '@dnd-kit/utilities'; // Import CSS utility

// Define a type for a draggable element's position
interface DraggablePosition {
  x: number;
  y: number;
}

// Define a type for the layout configuration for this page
interface AdminBrandingPageLayout {
  colorBox: DraggablePosition;
  logoBox: DraggablePosition;
  headerLayoutBox: DraggablePosition;
  sidebarLayoutBox: DraggablePosition;
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


const AdminBrandingPage: React.FC = () => {
  const { user } = useApp();
  const isAdmin = user?.role === 'administrador';

  const [primaryColor, setPrimaryColor] = useState('#3366FF');
  const [secondaryColor, setSecondaryColor] = useState('#7B61FF');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // New state for layout settings (using arrays of PlanType for visibility)
  const [sidebarItemVisibility, setSidebarItemVisibility] = useState({
    show_history: [] as PlanType[],
    show_model_selector: [] as PlanType[],
    show_plans_link: [] as PlanType[],
    show_admin_dashboard_link: [] as PlanType[],
  });
  const [adminSidebarItemVisibility, setAdminSidebarItemVisibility] = useState({
    admin_dashboard: [] as PlanType[],
    admin_users: [] as PlanType[],
    admin_plans: [] as PlanType[],
    admin_models: [] as PlanType[],
    admin_branding: [] as PlanType[],
    admin_settings: [] as PlanType[],
    admin_tailwind: [] as PlanType[],
    admin_subscriptions: [] as PlanType[],
    admin_llm: [] as PlanType[],
  });

  // Other layout settings
  const [showSidebar, setShowSidebar] = useState(true);
  const [customHeaderText, setCustomHeaderText] = useState('iLyra');
  const [showThemeToggleInHeader, setShowThemeToggleInHeader] = useState(true);
  const [showUserDropdownInHeader, setShowUserDropdownInHeader] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logoRef = useRef<HTMLImageElement>(null);

  // Define available plans for checkboxes
  const availablePlans: PlanType[] = ['free', 'pro', 'enterprise', 'administrador']; // Include 'administrador' role as a plan type for visibility control

  // State for the layout, initialized with default positions
  const [layout, setLayout] = useState<AdminBrandingPageLayout>({
    colorBox: { x: 0, y: 0 },
    logoBox: { x: 0, y: 0 },
    headerLayoutBox: { x: 0, y: 0 },
    sidebarLayoutBox: { x: 0, y: 0 },
  });

  // State to track if the layout has been modified
  const [isLayoutModified, setIsLayoutModified] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);


  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await api.admin.settings.get();
        setPrimaryColor(settings.primary_color || '#3366FF');
        setSecondaryColor(settings.secondary_color || '#7B61FF');
        setLogoUrl(settings.logo_url || null);
        setLogoPreview(settings.logo_url || null);

        // Load new layout settings
        setShowSidebar(settings.show_sidebar ?? true);
        setCustomHeaderText(settings.custom_header_text || 'iLyra');
        setShowThemeToggleInHeader(settings.show_theme_toggle_in_header ?? true);
        setShowUserDropdownInHeader(settings.show_user_dropdown_in_header ?? true);

        // Load plan-based visibility settings
        setSidebarItemVisibility(settings.sidebar_item_visibility || {
          show_history: ['free', 'pro', 'enterprise'],
          show_model_selector: ['pro', 'enterprise'],
          show_plans_link: ['free', 'pro'],
          show_admin_dashboard_link: ['administrador'],
        });
        setAdminSidebarItemVisibility(settings.admin_sidebar_item_visibility || {
          admin_dashboard: ['administrador'],
          admin_users: ['administrador'],
          admin_plans: ['administrador'],
          admin_models: ['administrador'],
          admin_branding: ['administrador'],
          admin_settings: ['administrador'],
          admin_tailwind: ['administrador'],
          admin_subscriptions: ['administrador'],
          admin_llm: ['administrador'],
        });

        // Load saved layout from local storage on component mount (only for admin)
        if (isAdmin) {
          const savedLayout = localStorage.getItem('adminBrandingPageLayout');
          if (savedLayout) {
            try {
              setLayout(JSON.parse(savedLayout));
            } catch (error) {
              console.error("Failed to parse saved Branding page layout:", error);
            }
          }
        }


        console.log("Configurações de branding e layout carregadas via API simulada.");
      } catch (error) {
        console.error("Erro ao carregar configurações de branding e layout via API simulada:", error);
        alert("Falha ao carregar configurações de branding e layout.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isAdmin]); // Depend on isAdmin to load layout


  // Save layout to local storage when it changes (only if modified and is admin)
  useEffect(() => {
    if (isAdmin && isLayoutModified) {
      // Simulate saving to backend
      setIsSavingLayout(true);
      console.log("Simulating saving Branding page layout to backend:", layout);
      // In a real app, you would call your backend API here:
      // api.admin.settings.savePageLayout('adminBrandingPage', layout).then(() => {
      //   console.log("Branding page layout saved to backend.");
      //   setIsSavingLayout(false);
      // }).catch(error => {
      //   console.error("Failed to save Branding page layout:", error);
      //   setIsSavingLayout(false);
      // });

      // For simulation, just save to local storage after a delay
      const saveTimer = setTimeout(() => {
         localStorage.setItem('adminBrandingPageLayout', JSON.stringify(layout));
         console.log("Branding page layout saved locally (simulated).");
         setIsLayoutModified(false); // Reset modified state after saving
         setIsSavingLayout(false);
      }, 500); // Simulate network delay

      return () => clearTimeout(saveTimer); // Cleanup timer
    }
  }, [layout, isLayoutModified, isAdmin]);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && logoUrl) {
            setLogoPreview(logoUrl);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (logoRef.current) {
      observer.observe(logoRef.current);
    }

    return () => {
      if (logoRef.current) {
        observer.unobserve(logoRef.current);
      }
    };
  }, [logoUrl]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // In a real app, upload the file to storage (e.g., Supabase Storage)
      alert('Logo preview atualizado. Upload real não implementado.');
    }
  };

  const handlePlanCheckboxChange = (
    itemKey: keyof typeof sidebarItemVisibility | keyof typeof adminSidebarItemVisibility,
    plan: PlanType,
    isSidebarItem: boolean // Flag to distinguish between sidebar and admin sidebar items
  ) => {
    if (isSidebarItem) {
      setSidebarItemVisibility(prevState => {
        const currentPlans = prevState[itemKey as keyof typeof sidebarItemVisibility];
        const newPlans = currentPlans.includes(plan)
          ? currentPlans.filter(p => p !== plan)
          : [...currentPlans, plan];
        return { ...prevState, [itemKey]: newPlans };
      });
    } else {
       setAdminSidebarItemVisibility(prevState => {
         const currentPlans = prevState[itemKey as keyof typeof adminSidebarItemVisibility];
         const newPlans = currentPlans.includes(plan)
           ? currentPlans.filter(p => p !== plan)
           : [...currentPlans, plan];
         return { ...prevState, [itemKey]: newPlans };
       });
    }
  };


  const handleSaveChanges = async () => {
     setIsSaving(true);
     try {
        await api.admin.settings.save({
           primary_color: primaryColor,
           secondary_color: secondaryColor,
           logo_url: logoPreview,
           // Save other layout settings
           show_sidebar: showSidebar,
           custom_header_text: customHeaderText,
           show_theme_toggle_in_header: showThemeToggleInHeader,
           show_user_dropdown_in_header: showUserDropdownInHeader,
           // Save plan-based visibility settings
           sidebar_item_visibility: sidebarItemVisibility,
           admin_sidebar_item_visibility: adminSidebarItemVisibility,
        });
        alert('Alterações de branding e layout salvas! (No DB local)');
        setLogoUrl(logoPreview); // Update logoUrl state after saving
     } catch (error) {
        console.error("Falha ao salvar alterações de branding e layout via API simulada:", error);
        alert("Falha ao salvar alterações de branding e layout.");
     } finally {
       setIsSaving(false);
     }
  };

  // Handle drag end to update layout state and mark as modified
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as keyof AdminBrandingPageLayout;

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
    <div className="p-6">
       <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette size={24} className="text-warning" />
          Branding & Layout
        </h1>
         <Link to="/admin/users" className="btn btn-outline"> {/* Link to Admin Users */}
          Voltar ao Admin
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-warning" />
          <span className="ml-2 text-text/70">Carregando configurações de branding e layout...</span>
        </div>
      ) : (
        // Conditional DndContext wrapper for admin
        {isAdmin ? (
           <DndContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Configuration (Draggable) */}
                <DraggableItem id="colorBox" defaultPosition={layout.colorBox} isAdmin={isAdmin}>
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette size={18} /> Configuração de Cores</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Cor Primária</label>
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-full h-10 border border-border rounded-lg cursor-pointer"
                          disabled={isSaving}
                        />
                         <span className="text-xs text-text/70">{primaryColor}</span>
                      </div>
                       <div>
                        <label className="block text-sm font-medium mb-1">Cor Secundária</label>
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-full h-10 border border-border rounded-lg cursor-pointer"
                          disabled={isSaving}
                        />
                         <span className="text-xs text-text/70">{secondaryColor}</span>
                      </div>
                       <p className="text-sm text-text/70 mt-4">
                         (Alterar cores aqui **não afetará a UI real** sem implementação completa via CSS variables/backend).
                       </p>
                    </div>
                  </div>
                </DraggableItem>

                {/* Logo Management (Draggable) */}
                <DraggableItem id="logoBox" defaultPosition={layout.logoBox} isAdmin={isAdmin}>
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Upload size={18} /> Gerenciamento de Logo</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Logo Principal</label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 border border-dashed border-border rounded-lg flex items-center justify-center bg-input overflow-hidden">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Preview Logo" className="max-w-full max-h-full object-contain" />
                            ) : (
                              logoUrl ? (
                                <img
                                  ref={logoRef}
                                  src={logoUrl}
                                  alt="Logo"
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs text-text/50">Preview</span>
                              )
                            )}
                          </div>
                          <label className="btn btn-outline cursor-pointer flex items-center gap-2" disabled={isSaving}>
                            <Upload size={16} />
                            <span>Fazer Upload</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isSaving} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </DraggableItem>

                {/* Header Layout Settings (Draggable) */}
                <DraggableItem id="headerLayoutBox" defaultPosition={layout.headerLayoutBox} isAdmin={isAdmin}>
                  <div className="bg-card rounded-lg p-6 md:col-span-2"> {/* Span across two columns */}
                     <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Menu size={18} /> Layout do Cabeçalho</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium mb-1">Texto do Logo</label>
                         <input
                           type="text"
                           value={customHeaderText}
                           onChange={(e) => setCustomHeaderText(e.target.value)}
                           className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                           disabled={isSaving}
                         />
                       </div>
                       <div className="flex items-center justify-between md:col-span-2">
                         <div>
                           <p className="font-medium">Mostrar Alternador de Tema</p>
                           <p className="text-sm text-text/70">Permite que usuários alternem entre tema claro/escuro.</p>
                         </div>
                         <button
                           type="button"
                           className={`p-1 rounded-full transition-colors ${showThemeToggleInHeader ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                           onClick={() => setShowThemeToggleInHeader(!showThemeToggleInHeader)}
                           disabled={isSaving}
                         >
                           {showThemeToggleInHeader ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                         </button>
                       </div>
                        <div className="flex items-center justify-between md:col-span-2">
                         <div>
                           <p className="font-medium">Mostrar Dropdown do Usuário</p>
                           <p className="text-sm text-text/70">Exibe o menu de perfil, configurações, etc.</p>
                         </div>
                         <button
                           type="button"
                           className={`p-1 rounded-full transition-colors ${showUserDropdownInHeader ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                           onClick={() => setShowUserDropdownInHeader(!showUserDropdownInHeader)}
                           disabled={isSaving}
                         >
                           {showUserDropdownInHeader ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                         </button>
                       </div>
                       {/* Add more header specific settings here */}
                     </div>
                  </div>
                </DraggableItem>

                {/* Sidebar Layout Settings (Draggable) */}
                <DraggableItem id="sidebarLayoutBox" defaultPosition={layout.sidebarLayoutBox} isAdmin={isAdmin}>
                  <div className="bg-card rounded-lg p-6 md:col-span-2"> {/* Span across two columns */}
                     <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><SidebarIcon size={18} /> Layout da Barra Lateral</h3>
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="font-medium">Mostrar Barra Lateral</p>
                           <p className="text-sm text-text/70">Controla a visibilidade geral da barra lateral.</p>
                         </div>
                         <button
                           type="button"
                           className={`p-1 rounded-full transition-colors ${showSidebar ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                           onClick={() => setShowSidebar(!showSidebar)}
                           disabled={isSaving}
                         >
                           {showSidebar ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                         </button>
                       </div>
                       {showSidebar && ( // Only show these options if sidebar is enabled
                         <>
                           {/* Sidebar Items Visibility by Plan */}
                           <div className="space-y-4 pl-4">
                             <h4 className="text-md font-semibold mb-2">Visibilidade de Itens por Plano:</h4>
                             {[
                               { key: 'show_history', label: 'Mostrar Histórico de Conversas' },
                               { key: 'show_model_selector', label: 'Mostrar Seletor de Modelo' },
                               { key: 'show_plans_link', label: 'Mostrar Link "Atualizar Plano"' },
                               { key: 'show_admin_dashboard_link', label: 'Mostrar Link "Painel Admin"' },
                             ].map(item => (
                               <div key={item.key} className="flex flex-col">
                                 <p className="text-sm font-medium mb-1">{item.label}</p>
                                 <div className="flex flex-wrap gap-3">
                                   {availablePlans.map(plan => (
                                     <label key={plan} className="flex items-center text-sm cursor-pointer">
                                       <input
                                         type="checkbox"
                                         className="mr-1"
                                         checked={sidebarItemVisibility[item.key as keyof typeof sidebarItemVisibility].includes(plan)}
                                         onChange={() => handlePlanCheckboxChange(item.key as keyof typeof sidebarItemVisibility, plan, true)}
                                         disabled={isSaving}
                                       />
                                       {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                     </label>
                                   ))}
                                 </div>
                               </div>
                             ))}
                           </div>

                           {/* Admin Sidebar Sub-Items Visibility by Plan */}
                           <div className="space-y-4 pl-4 mt-6">
                             <h4 className="text-md font-semibold mb-2">Visibilidade de Sub-Itens do Painel Admin por Plano:</h4>
                              {[
                                { key: 'admin_dashboard', label: 'Admin Dashboard' },
                                { key: 'admin_users', label: 'Gerenciar Usuários' },
                                { key: 'admin_plans', label: 'Gerenciar Planos' },
                                { key: 'admin_models', label: 'Modelos de IA (Legado)' },
                                { key: 'admin_branding', label: 'Branding & Layout' },
                                { key: 'admin_settings', label: 'Configurações Gerais' },
                                { key: 'admin_tailwind', label: 'Customizar Tailwind' },
                                { key: 'admin_subscriptions', label: 'Assinaturas' },
                                { key: 'admin_llm', label: 'Provedores LLM' },
                              ].map(item => (
                                <div key={item.key} className="flex flex-col">
                                  <p className="text-sm font-medium mb-1">{item.label}</p>
                                  <div className="flex flex-wrap gap-3">
                                    {availablePlans.map(plan => (
                                      <label key={plan} className="flex items-center text-sm cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="mr-1"
                                          checked={adminSidebarItemVisibility[item.key as keyof typeof adminSidebarItemVisibility].includes(plan)}
                                          onChange={() => handlePlanCheckboxChange(item.key as keyof typeof adminSidebarItemVisibility, plan, false)}
                                          disabled={isSaving}
                                        />
                                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                           </div>
                         </>
                       )}
                     </div>
                  </div>
                </DraggableItem>

                   {/* Add sections for other layout areas like Footer, etc. */}
                   {/*
                   <div className="bg-card rounded-lg p-6 md:col-span-2">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Section size={18} /> Layout de Seções</h3>
                      </div>
                    */}

                </div>
              </DndContext>
            ) : (
              // Render non-draggable version for non-admins
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Configuration */}
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette size={18} /> Configuração de Cores</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cor Primária</label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-10 border border-border rounded-lg cursor-pointer"
                        disabled={isSaving}
                      />
                       <span className="text-xs text-text/70">{primaryColor}</span>
                    </div>
                     <div>
                      <label className="block text-sm font-medium mb-1">Cor Secundária</label>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full h-10 border border-border rounded-lg cursor-pointer"
                        disabled={isSaving}
                      />
                       <span className="text-xs text-text/70">{secondaryColor}</span>
                    </div>
                     <p className="text-sm text-text/70 mt-4">
                       (Alterar cores aqui **não afetará a UI real** sem implementação completa via CSS variables/backend).
                     </p>
                  </div>
                </div>

                {/* Logo Management */}
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Upload size={18} /> Gerenciamento de Logo</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo Principal</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 border border-dashed border-border rounded-lg flex items-center justify-center bg-input overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Preview Logo" className="max-w-full max-h-full object-contain" />
                          ) : (
                            logoUrl ? (
                              <img
                                ref={logoRef}
                                src={logoUrl}
                                alt="Logo"
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-xs text-text/50">Preview</span>
                            )
                          )}
                        </div>
                        <label className="btn btn-outline cursor-pointer flex items-center gap-2" disabled={isSaving}>
                          <Upload size={16} />
                          <span>Fazer Upload</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isSaving} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Layout Settings */}
                <div className="bg-card rounded-lg p-6 md:col-span-2"> {/* Span across two columns */}
                   <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Menu size={18} /> Layout do Cabeçalho</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium mb-1">Texto do Logo</label>
                       <input
                         type="text"
                         value={customHeaderText}
                         onChange={(e) => setCustomHeaderText(e.target.value)}
                         className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                         disabled={isSaving}
                       />
                     </div>
                     <div className="flex items-center justify-between md:col-span-2">
                       <div>
                         <p className="font-medium">Mostrar Alternador de Tema</p>
                         <p className="text-sm text-text/70">Permite que usuários alternem entre tema claro/escuro.</p>
                       </div>
                       <button
                         type="button"
                         className={`p-1 rounded-full transition-colors ${showThemeToggleInHeader ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                         onClick={() => setShowThemeToggleInHeader(!showThemeToggleInHeader)}
                         disabled={isSaving}
                       >
                         {showThemeToggleInHeader ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                       </button>
                     </div>
                      <div className="flex items-center justify-between md:col-span-2">
                       <div>
                         <p className="font-medium">Mostrar Dropdown do Usuário</p>
                         <p className="text-sm text-text/70">Exibe o menu de perfil, configurações, etc.</p>
                       </div>
                       <button
                         type="button"
                         className={`p-1 rounded-full transition-colors ${showUserDropdownInHeader ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                         onClick={() => setShowUserDropdownInHeader(!showUserDropdownInHeader)}
                         disabled={isSaving}
                       >
                         {showUserDropdownInHeader ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                       </button>
                     </div>
                     {/* Add more header specific settings here */}
                   </div>
                </div>

                {/* Sidebar Layout Settings */}
                <div className="bg-card rounded-lg p-6 md:col-span-2"> {/* Span across two columns */}
                   <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><SidebarIcon size={18} /> Layout da Barra Lateral</h3>
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="font-medium">Mostrar Barra Lateral</p>
                         <p className="text-sm text-text/70">Controla a visibilidade geral da barra lateral.</p>
                       </div>
                       <button
                         type="button"
                         className={`p-1 rounded-full transition-colors ${showSidebar ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'}`}
                         onClick={() => setShowSidebar(!showSidebar)}
                         disabled={isSaving}
                       >
                         {showSidebar ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                       </button>
                     </div>
                     {showSidebar && ( // Only show these options if sidebar is enabled
                       <>
                         {/* Sidebar Items Visibility by Plan */}
                         <div className="space-y-4 pl-4">
                           <h4 className="text-md font-semibold mb-2">Visibilidade de Itens por Plano:</h4>
                           {[
                             { key: 'show_history', label: 'Mostrar Histórico de Conversas' },
                             { key: 'show_model_selector', label: 'Mostrar Seletor de Modelo' },
                             { key: 'show_plans_link', label: 'Mostrar Link "Atualizar Plano"' },
                             { key: 'show_admin_dashboard_link', label: 'Mostrar Link "Painel Admin"' },
                           ].map(item => (
                             <div key={item.key} className="flex flex-col">
                               <p className="text-sm font-medium mb-1">{item.label}</p>
                               <div className="flex flex-wrap gap-3">
                                 {availablePlans.map(plan => (
                                   <label key={plan} className="flex items-center text-sm cursor-pointer">
                                     <input
                                       type="checkbox"
                                       className="mr-1"
                                       checked={sidebarItemVisibility[item.key as keyof typeof sidebarItemVisibility].includes(plan)}
                                       onChange={() => handlePlanCheckboxChange(item.key as keyof typeof sidebarItemVisibility, plan, true)}
                                       disabled={isSaving}
                                     />
                                     {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                   </label>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>

                         {/* Admin Sidebar Sub-Items Visibility by Plan */}
                         <div className="space-y-4 pl-4 mt-6">
                           <h4 className="text-md font-semibold mb-2">Visibilidade de Sub-Itens do Painel Admin por Plano:</h4>
                            {[
                              { key: 'admin_dashboard', label: 'Admin Dashboard' },
                              { key: 'admin_users', label: 'Gerenciar Usuários' },
                              { key: 'admin_plans', label: 'Gerenciar Planos' },
                              { key: 'admin_models', label: 'Modelos de IA (Legado)' },
                              { key: 'admin_branding', label: 'Branding & Layout' },
                              { key: 'admin_settings', label: 'Configurações Gerais' },
                              { key: 'admin_tailwind', label: 'Customizar Tailwind' },
                              { key: 'admin_subscriptions', label: 'Assinaturas' },
                              { key: 'admin_llm', label: 'Provedores LLM' },
                            ].map(item => (
                              <div key={item.key} className="flex flex-col">
                                <p className="text-sm font-medium mb-1">{item.label}</p>
                                <div className="flex flex-wrap gap-3">
                                  {availablePlans.map(plan => (
                                    <label key={plan} className="flex items-center text-sm cursor-pointer">
                                      <input
                                        type="checkbox"
                                        className="mr-1"
                                        checked={adminSidebarItemVisibility[item.key as keyof typeof adminSidebarItemVisibility].includes(plan)}
                                        onChange={() => handlePlanCheckboxChange(item.key as keyof typeof adminSidebarItemVisibility, plan, false)}
                                        disabled={isSaving}
                                      />
                                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                         </div>
                       </>
                       )}
                     </div>
                  </div>
                </DraggableItem>

                 {/* Add sections for other layout areas like Footer, etc. */}
                 {/*
                 <div className="bg-card rounded-lg p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Section size={18} /> Layout de Seções</h3>
                    </div>
                  */}

              </div>
            )}
          )}


       <div className="mt-6 flex justify-end">
         <button onClick={handleSaveChanges} className="btn btn-primary flex items-center gap-2" disabled={isSaving || isLoading}>
           {isSaving ? (
             <span className="flex items-center justify-center gap-2">
               <Loader2 size={18} className="animate-spin" /> Salvando...
             </span>
           ) : (
             <>
               <Save size={18} />
               <span>Salvar Alterações</span>
             </>
           )}
         </button>
       </div>
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

export default AdminBrandingPage;
