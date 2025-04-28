import React, { useState, useEffect } from 'react';
import { DollarSign, PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, ArrowLeft, ArrowRight, X, Loader2, Settings, Save } from 'lucide-react'; // Added Settings, Save
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { generateUniqueId } from '../utils/helpers';
import DeleteConfirmModal from '../components/UI/DeleteConfirmModal';
import PlanForm from '../components/Admin/PlanForm';
import PlanLimitsModal from '../components/Admin/PlanLimitsModal'; // Import the new modal
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core'; // Import Dnd-kit hooks
import { CSS } from '@dnd-kit/utilities'; // Import CSS utility
import { useApp } from '../context/AppContext'; // Import useApp

// Define a type for a draggable element's position
interface DraggablePosition {
  x: number;
  y: number;
}

// Define a type for the layout configuration for this page
interface AdminPlansPageLayout {
  addPlanBox: DraggablePosition;
  planListBox: DraggablePosition;
  paginationBox: DraggablePosition;
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


const AdminPlansPage: React.FC = () => {
  const { user } = useApp(); // Get user from context
  const isAdmin = user?.role === 'administrador';

  const [plans, setPlans] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [plansPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<any | null>(null);

  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false); // State for limits modal
  const [planToConfigureLimits, setPlanToConfigureLimits] = useState<any | null>(null); // Plan for limits modal


  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for the layout, initialized with default positions
  const [layout, setLayout] = useState<AdminPlansPageLayout>({
    addPlanBox: { x: 0, y: 0 },
    planListBox: { x: 0, y: 0 },
    paginationBox: { x: 0, y: 0 },
  });

  // State to track if the layout has been modified
  const [isLayoutModified, setIsLayoutModified] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);


  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      try {
        const fetchedPlans = await api.admin.plans.get();
        setPlans(fetchedPlans);

        // Load saved layout from local storage on component mount (only for admin)
        if (isAdmin) {
          const savedLayout = localStorage.getItem('adminPlansPageLayout');
          if (savedLayout) {
            try {
              setLayout(JSON.parse(savedLayout));
            } catch (error) {
              console.error("Failed to parse saved Admin Plans page layout:", error);
            }
          }
        }

      } catch (error) {
        console.error("Erro ao carregar planos via API simulada:", error);
        alert("Falha ao carregar planos.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [isAdmin]); // Depend on isAdmin to load layout

  // Save layout to local storage when it changes (only if modified and is admin)
  useEffect(() => {
    if (isAdmin && isLayoutModified) {
      // Simulate saving to backend
      setIsSavingLayout(true);
      console.log("Simulating saving Admin Plans page layout to backend:", layout);
      // In a real app, you would call your backend API here:
      // api.admin.settings.savePageLayout('adminPlansPage', layout).then(() => {
      //   console.log("Admin Plans page layout saved to backend.");
      //   setIsSavingLayout(false);
      // }).catch(error => {
      //   console.error("Failed to save Admin Plans page layout:", error);
      //   setIsSavingLayout(false);
      // });

      // For simulation, just save to local storage after a delay
      const saveTimer = setTimeout(() => {
         localStorage.setItem('adminPlansPageLayout', JSON.stringify(layout));
         console.log("Admin Plans page layout saved locally (simulated).");
         setIsLayoutModified(false); // Reset modified state after saving
         setIsSavingLayout(false);
      }, 500); // Simulate network delay

      return () => clearTimeout(saveTimer); // Cleanup timer
    }
  }, [layout, isLayoutModified, isAdmin]);


  const handleCreatePlan = () => {
    setCurrentPlan(null);
    setIsFormModalOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    setCurrentPlan(plan);
    setIsFormModalOpen(true);
  };

  const handleSavePlan = async (planData: any) => {
    setIsSavingPlan(true);
    try {
      if (planData.planId) {
        console.log("[API Simulado] Editando plano:", planData.planId, planData);
        await api.admin.plans.update(planData.planId, planData);
        setPlans(prevPlans => prevPlans.map(p => p.id === planData.planId ? { ...p, ...planData } : p));
        alert("Plano atualizado com sucesso! (Simulado)");
      } else {
        console.log("[API Simulado] Criando novo plano:", planData);
        const newPlan = await api.admin.plans.create(planData);
        setPlans(prevPlans => [...prevPlans, newPlan]);
        alert("Plano criado com sucesso! (Simulado)");
      }
      setIsFormModalOpen(false);
      setCurrentPlan(null);
    } catch (error: any) {
      console.error("[API Simulado] Erro ao salvar plano:", error);
      alert(error.message || "Falha ao salvar plano.");
    } finally {
      setIsSavingPlan(false);
    }
  };


  const handleDeletePlanClick = (plan: any) => {
    setPlanToDelete(plan);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeletePlanConfirm = async () => {
     if (!planToDelete) {
       return;
     }
     setIsDeletingPlan(true);
     try {
        await api.admin.plans.delete(planToDelete.id);
        setPlans(prevPlans => prevPlans.filter(p => p.id !== planToDelete.id));
        alert("Plano excluído com sucesso! (Simulado)");
     } catch (error: any) {
        console.error("Falha ao excluir plano via API simulada:", error);
        alert(error.message || "Falha ao excluir plano.");
     } finally {
        setIsDeletingPlan(false);
        setIsDeleteConfirmModalOpen(false);
        setPlanToDelete(null);
     }
  };


  const handleToggleStatus = async (planId: string, currentStatus: string) => {
     const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
     const newIsActive = newStatus === 'active';
     try {
        await api.admin.plans.toggleStatus(planId, newIsActive);
        setPlans(prevPlans => plans.map(p => p.id === planId ? { ...p, status: newStatus } : p));
        alert("Status do plano alterado! (Simulado)");
     } catch (error) {
        console.error("Falha ao alterar status do plano via API simulada:", error);
        alert("Falha ao alterar status do plano.");
     }
  };

  const handleConfigureLimits = (plan: any) => {
      setPlanToConfigureLimits(plan);
      setIsLimitsModalOpen(true);
  };

  const handleSaveLimits = async (planId: string, limits: { message_limit: number | null, rate_limit_per_minute: number | null }) => {
      setIsSavingPlan(true); // Use saving state for limits too
      try {
          await api.admin.plans.updateLimits(planId, limits);
          // Update local state with new limits
          setPlans(prevPlans => prevPlans.map(p => p.id === planId ? { ...p, ...limits } : p));
          alert("Limites do plano salvos! (Simulado)");
          setIsLimitsModalOpen(false);
          setPlanToConfigureLimits(null);
      } catch (error) {
          console.error("Falha ao salvar limites do plano via API simulada:", error);
          alert("Falha ao salvar limites do plano.");
      } finally {
          setIsSavingPlan(false);
      }
  };


  const indexOfLastPlan = currentPage * plansPerPage;
  const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
  const currentPlans = plans.slice(indexOfFirstPlan, indexOfLastPlan);

  const totalPages = Math.ceil(plans.length / plansPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle drag end to update layout state and mark as modified
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as keyof AdminPlansPageLayout;

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
       <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign size={24} className="text-secondary" />
          Gerenciar Planos
        </h1>
         <Link to="/admin/users" className="btn btn-outline"> {/* Link to Admin Users */}
          Voltar ao Admin
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-secondary" />
          <span className="ml-2 text-text/70">Carregando planos...</span>
        </div>
      ) : (
        // Conditional DndContext wrapper for admin
        {isAdmin ? (
           <DndContext onDragEnd={handleDragEnd}>
              <div className="space-y-6"> {/* Container for draggable items */}
                 {/* Add New Plan Button (Draggable) */}
                 <DraggableItem id="addPlanBox" defaultPosition={layout.addPlanBox} isAdmin={isAdmin}>
                   <div className="mb-4 flex justify-end">
                      <button className="btn btn-primary flex items-center gap-2" onClick={handleCreatePlan}>
                        <PlusCircle size={18} />
                        <span>Criar Novo Plano</span>
                      </button>
                    </div>
                 </DraggableItem>

                 {/* Plan List Table (Draggable) */}
                 <DraggableItem id="planListBox" defaultPosition={layout.planListBox} isAdmin={isAdmin}>
                   <div className="bg-card rounded-lg overflow-x-auto">
                     <table className="w-full table-auto">
                       <thead>
                         <tr className="border-b border-border text-left text-sm text-text/70">
                           <th className="p-3">Nome</th>
                           <th className="p-3">Descrição</th>
                           <th className="p-3">Preço</th>
                           <th className="p-3">Status</th>
                           <th className="p-3">Ações</th>
                         </tr>
                       </thead>
                       <tbody>
                         {currentPlans.map((plan) => (
                           <tr key={plan.id} className="border-b border-border hover:bg-background/50">
                             <td className="p-3 font-medium">{plan.name}</td>
                             <td className="p-3 text-sm">{plan.description}</td>
                             <td className="p-3 text-sm">
                               {plan.price === null ? 'Contato' : `R$ ${plan.price !== undefined ? plan.price.toFixed(2) : 'N/A'}/mês`}
                             </td>
                             <td className="p-3">
                               <span className={`px-2 py-1 text-xs rounded ${plan.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-500/10 text-gray-500'}`}>
                                 {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                               </span>
                             </td>
                             <td className="p-3">
                               <div className="flex gap-2">
                                  <button onClick={() => handleToggleStatus(plan.id, plan.status)} className={`p-1 hover:text-text/80 ${plan.status === 'active' ? 'text-success' : 'text-gray-500'}`} title={plan.status === 'active' ? 'Desativar' : 'Ativar'}>
                                    {plan.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                  </button>
                                  <button onClick={() => handleEditPlan(plan)} className="p-1 hover:text-primary" title="Editar">
                                    <Edit size={16} />
                                  </button>
                                  {/* New button for configuring limits */}
                                  <button onClick={() => handleConfigureLimits(plan)} className="p-1 hover:text-info" title="Configurar Limites">
                                    <Settings size={16} />
                                  </button>
                                  <button onClick={() => handleDeletePlanClick(plan)} className="p-1 hover:text-error" title="Excluir">
                                    <Trash2 size={16} />
                                  </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </DraggableItem>

                 {/* Pagination Controls (Draggable) */}
                 <DraggableItem id="paginationBox" defaultPosition={layout.paginationBox} isAdmin={isAdmin}>
                   <div className="mt-4 flex justify-center items-center gap-2">
                     <button
                       onClick={() => handlePageChange(currentPage - 1)}
                       disabled={currentPage === 1 || isLoading}
                       className="p-2 rounded hover:bg-card"
                     >
                       <ArrowLeft size={16} />
                     </button>
                     <span>
                       {currentPage} de {totalPages}
                     </span>
                     <button
                       onClick={() => handlePageChange(currentPage + 1)}
                       disabled={currentPage === totalPages || isLoading}
                       className="p-2 rounded hover:bg-card"
                     >
                       <ArrowRight size={16} />
                     </button>
                   </div>
                 </DraggableItem>
              </div>
           </DndContext>
         ) : (
           // Render non-draggable version for non-admins
           <>
             <div className="mb-4 flex justify-end">
                <button className="btn btn-primary flex items-center gap-2" onClick={handleCreatePlan}>
                  <PlusCircle size={18} />
                  <span>Criar Novo Plano</span>
                </button>
              </div>

             <div className="bg-card rounded-lg overflow-x-auto">
               <table className="w-full table-auto">
                 <thead>
                   <tr className="border-b border-border text-left text-sm text-text/70">
                     <th className="p-3">Nome</th>
                     <th className="p-3">Descrição</th>
                     <th className="p-3">Preço</th>
                     <th className="p-3">Status</th>
                     <th className="p-3">Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                   {currentPlans.map((plan) => (
                     <tr key={plan.id} className="border-b border-border hover:bg-background/50">
                       <td className="p-3 font-medium">{plan.name}</td>
                       <td className="p-3 text-sm">{plan.description}</td>
                       <td className="p-3 text-sm">
                         {plan.price === null ? 'Contato' : `R$ ${plan.price !== undefined ? plan.price.toFixed(2) : 'N/A'}/mês`}
                       </td>
                       <td className="p-3">
                         <span className={`px-2 py-1 text-xs rounded ${plan.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-500/10 text-gray-500'}`}>
                           {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                         </span>
                       </td>
                       <td className="p-3">
                         <div className="flex gap-2">
                            <button onClick={() => handleToggleStatus(plan.id, plan.status)} className={`p-1 hover:text-text/80 ${plan.status === 'active' ? 'text-success' : 'text-gray-500'}`} title={plan.status === 'active' ? 'Desativar' : 'Ativar'}>
                              {plan.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button onClick={() => handleEditPlan(plan)} className="p-1 hover:text-primary" title="Editar">
                              <Edit size={16} />
                            </button>
                            {/* New button for configuring limits */}
                            <button onClick={() => handleConfigureLimits(plan)} className="p-1 hover:text-info" title="Configurar Limites">
                              <Settings size={16} />
                            </button>
                            <button onClick={() => handleDeletePlanClick(plan)} className="p-1 hover:text-error" title="Excluir">
                              <Trash2 size={16} />
                            </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             {/* Pagination Controls */}
             <div className="mt-4 flex justify-center items-center gap-2">
               <button
                 onClick={() => handlePageChange(currentPage - 1)}
                 disabled={currentPage === 1 || isLoading}
                 className="p-2 rounded hover:bg-card"
               >
                 <ArrowLeft size={16} />
               </button>
               <span>
                 {currentPage} de {totalPages}
               </span>
               <button
                 onClick={() => handlePageChange(currentPage + 1)}
                 disabled={currentPage === totalPages || isLoading}
                 className="p-2 rounded hover:bg-card"
               >
                 <ArrowRight size={16} />
               </button>
             </div>
           </>
         )}
      )}


      {/* Edit/Create Plan Modal */}
      {(isFormModalOpen) && (
        <PlanForm
          plan={currentPlan}
          onClose={() => { setIsFormModalOpen(false); setCurrentPlan(null); }}
          onSave={handleSavePlan}
          isSaving={isSavingPlan}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && planToDelete && (
        <DeleteConfirmModal
          itemType="plano"
          itemName={planToDelete.name}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          onConfirm={handleDeletePlanConfirm}
          isDeleting={isDeletingPlan}
        />
      )}

      {/* Plan Limits Modal */}
      {isLimitsModalOpen && planToConfigureLimits && (
          <PlanLimitsModal
              plan={planToConfigureLimits}
              onClose={() => { setIsLimitsModalOpen(false); setPlanToConfigureLimits(null); }}
              onSave={handleSaveLimits}
              isSaving={isSavingPlan} // Use the same saving state
          />
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

export default AdminPlansPage;
