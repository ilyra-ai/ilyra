import React, { useState, useEffect } from 'react';
import { Users, Search, PlusCircle, Edit, Trash2, MoreVertical, ArrowDown, ArrowUp, Key, ArrowLeft, ArrowRight, X, Loader2, Save } from 'lucide-react'; // Added Save
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User as UserType, PlanType } from '../types';
import { api } from '../utils/api';
import { generateUniqueId } from '../utils/helpers';
import DeleteConfirmModal from '../components/UI/DeleteConfirmModal';
import UserForm from '../components/Admin/UserForm';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core'; // Import Dnd-kit hooks
import { CSS } from '@dnd-kit/utilities'; // Import CSS utility

// Define a type for a draggable element's position
interface DraggablePosition {
  x: number;
  y: number;
}

// Define a type for the layout configuration for this page
interface AdminUsersPageLayout {
  searchAndAddBox: DraggablePosition;
  userListBox: DraggablePosition;
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


const AdminUsersPage: React.FC = () => {
  const { user } = useApp();
  const isAdmin = user?.role === 'administrador';

  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'joined' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for the layout, initialized with default positions
  const [layout, setLayout] = useState<AdminUsersPageLayout>({
    searchAndAddBox: { x: 0, y: 0 },
    userListBox: { x: 0, y: 0 },
    paginationBox: { x: 0, y: 0 },
  });

  // State to track if the layout has been modified
  const [isLayoutModified, setIsLayoutModified] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);


  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const users = await api.admin.users.get();
        const usersWithStatus = users.map(u => ({ ...u, status: u.status || 'active' }));
        setAllUsers(usersWithStatus);
        setFilteredUsers(usersWithStatus);
      } catch (error) {
        console.error("Erro ao carregar usuários via API simulada:", error);
        alert("Falha ao carregar usuários.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [searchTerm, sortBy, sortDirection, allUsers, currentPage]);

  // Load saved layout from local storage on component mount (only for admin)
  useEffect(() => {
    if (isAdmin) {
      const savedLayout = localStorage.getItem('adminUsersPageLayout');
      if (savedLayout) {
        try {
          setLayout(JSON.parse(savedLayout));
        } catch (error) {
          console.error("Failed to parse saved Admin Users page layout:", error);
          // Optionally clear invalid saved layout
          // localStorage.removeItem('adminUsersPageLayout');
        }
      }
    }
  }, [isAdmin]);

  // Save layout to local storage when it changes (only if modified and is admin)
  useEffect(() => {
    if (isAdmin && isLayoutModified) {
      // Simulate saving to backend
      setIsSavingLayout(true);
      console.log("Simulating saving Admin Users page layout to backend:", layout);
      // In a real app, you would call your backend API here:
      // api.admin.settings.savePageLayout('adminUsersPage', layout).then(() => {
      //   console.log("Admin Users page layout saved to backend.");
      //   setIsSavingLayout(false);
      // }).catch(error => {
      //   console.error("Failed to save Admin Users page layout:", error);
      //   setIsSavingLayout(false);
      // });

      // For simulation, just save to local storage after a delay
      const saveTimer = setTimeout(() => {
         localStorage.setItem('adminUsersPageLayout', JSON.stringify(layout));
         console.log("Admin Users page layout saved locally (simulated).");
         setIsLayoutModified(false); // Reset modified state after saving
         setIsSavingLayout(false);
      }, 500); // Simulate network delay

      return () => clearTimeout(saveTimer); // Cleanup timer
    }
  }, [layout, isLayoutModified, isAdmin]);


  const filterAndSortUsers = () => {
    let currentUsers = [...allUsers];

    if (searchTerm) {
      currentUsers = currentUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy) {
      currentUsers.sort((a, b) => {
        const valueA = sortBy === 'joined' ? a.createdAt.toISOString() : a[sortBy];
        const valueB = sortBy === 'joined' ? b.createdAt.toISOString() : b[sortBy];
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return sortDirection === 'asc' ? -1 : 1;
        if (valueB == null) return sortDirection === 'asc' ? 1 : -1;

        const comparison = (valueA as string).localeCompare(valueB as string);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const paginatedUsers = currentUsers.slice(indexOfFirstUser, indexOfLastUser);

    setFilteredUsers(paginatedUsers);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column: 'name' | 'email' | 'joined') => {
    const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDirection(newDirection);
  };

  const handleCreateUser = () => {
    setCurrentUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setCurrentUser(user);
    setIsFormModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<UserType>) => {
    if (!user || user.role !== 'administrador') {
       alert("Você não tem permissão para realizar esta ação.");
       return;
    }

    setIsSavingUser(true);
    try {
      if (userData.id) {
        console.log("[API Simulado] Editando usuário:", userData.id, userData);
        await api.admin.users.update(userData.id, userData);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === userData.id ? { ...u, ...userData } as UserType : u));
        alert("Usuário atualizado com sucesso! (Simulado)");
      } else {
        console.log("[API Simulado] Criando novo usuário:", userData);
        const newUser = await api.admin.users.create(userData);
        setAllUsers(prevUsers => [...prevUsers, newUser]);
        alert("Usuário criado com sucesso! (Simulado)");
      }
      setIsFormModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("[API Simulado] Erro ao salvar usuário:", error);
      alert("Falha ao salvar usuário.");
    } finally {
      setIsSavingUser(false);
    }
  };


  const handleDeleteUserClick = (user: UserType) => {
    setUserToDelete(user);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete || !user || user.role !== 'administrador') {
       alert("Você não tem permissão para realizar esta ação.");
       return;
    }
    setIsDeletingUser(true);
    try {
       await api.admin.users.delete(userToDelete.id);
       setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
       alert("Usuário excluído com sucesso! (Simulado)");
     } catch (error) {
       console.error("Falha ao excluir usuário via API simulada:", error);
       alert("Falha ao excluir usuário.");
    } finally {
       setIsDeletingUser(false);
       setIsDeleteConfirmModalOpen(false);
       setUserToDelete(null);
    }
  };


  const handleRoleChange = async (userId: string, newRole: 'user' | 'administrador') => {
     if (!user || user.role !== 'administrador') {
        alert("Você não tem permissão para realizar esta ação.");
        return;
     }
     try {
        await api.admin.users.updateRole(userId, newRole);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert("Papel do usuário atualizado! (Simulado)");
     } catch (error) {
        console.error("Falha ao alterar papel do usuário via API simulada:", error);
        alert("Falha ao alterar papel do usuário.");
     }
  };

  const handlePlanChange = async (userId: string, newPlan: PlanType) => {
     if (!user || user.role !== 'administrador') {
        alert("Você não tem permissão para realizar esta ação.");
        return;
     }
      try {
        await api.admin.users.updatePlan(userId, newPlan);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
        alert("Plano do usuário atualizado! (Simulado)");
     } catch (error) {
        console.error("Falha ao alterar plano do usuário via API simulada:", error);
        alert("Falha ao alterar plano do usuário.");
     }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'banned') => {
     if (!user || user.role !== 'administrador') {
        alert("Você não tem permissão para realizar esta ação.");
        return;
     }
     try {
        await api.admin.users.updateStatus(userId, newStatus);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        alert("Status do usuário atualizado! (Simulado)");
     } catch (error) {
        console.error("Falha ao alterar status do usuário via API simulada:", error);
        alert("Falha ao alterar status do usuário.");
     }
  };

  const handleResetPassword = async (userId: string) => {
     if (!user || user.role !== 'administrador') {
        alert("Você não tem permissão para realizar esta ação.");
        return;
     }
     try {
        await api.admin.users.resetPassword(userId);
        alert("Email de reset de senha enviado! (Simulado)");
     } catch (error) {
        console.error("Falha ao resetar senha via API simulada:", error);
        alert("Falha ao resetar senha.");
     }
  };


  const totalPages = Math.ceil(allUsers.length / usersPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderSortIcon = (column: 'name' | 'email' | 'joined') => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
  };

  // Handle drag end to update layout state and mark as modified
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as keyof AdminUsersPageLayout;

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
          <Users size={24} className="text-primary" />
          Gerenciar Usuários
        </h1>
        <Link to="/admin/users" className="btn btn-outline"> {/* Link to Admin Users */}
          Voltar ao Admin
        </Link>
      </div>

      {/* Conditional DndContext wrapper for admin */}
      {isAdmin ? (
         <DndContext onDragEnd={handleDragEnd}>
            <div className="space-y-6"> {/* Container for draggable items */}
               {/* Search and Add User Section (Draggable) */}
               {/* MODIFIED: Pass isAdmin prop and removed handle class from inner div */}
               <DraggableItem id="searchAndAddBox" defaultPosition={layout.searchAndAddBox} isAdmin={isAdmin}>
                 <div className="mb-4 flex flex-col md:flex-row gap-4">
                   <div className="relative flex-1">
                     <input
                       type="text"
                       value={searchTerm}
                       onChange={handleSearchChange}
                       placeholder="Buscar por nome ou email..."
                       className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                     />
                     <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
                   </div>
                   <button className="btn btn-primary flex items-center gap-2" onClick={handleCreateUser}>
                     <PlusCircle size={18} />
                     <span>Adicionar Usuário</span>
                   </button>
                 </div>
               </DraggableItem>

               {/* User List Table (Draggable) */}
               {/* MODIFIED: Pass isAdmin prop and removed handle class from inner div */}
               <DraggableItem id="userListBox" defaultPosition={layout.userListBox} isAdmin={isAdmin}>
                 {isLoading ? (
                   <div className="flex justify-center items-center h-64">
                     <Loader2 size={32} className="animate-spin text-primary" />
                     <span className="ml-2 text-text/70">Carregando usuários...</span>
                   </div>
                 ) : (
                   <div className="bg-card rounded-lg overflow-x-auto">
                     <table className="w-full table-auto">
                       <thead>
                         <tr className="border-b border-border text-left text-sm text-text/70">
                           <th className="p-3 cursor-pointer" onClick={() => handleSort('name')}>
                             Nome {renderSortIcon('name')}
                           </th>
                           <th className="p-3 cursor-pointer" onClick={() => handleSort('email')}>
                             Email {renderSortIcon('email')}
                           </th>
                           <th className="p-3">Papel</th>
                           <th className="p-3">Plano</th>
                           <th className="p-3">Status</th>
                           <th className="p-3 cursor-pointer" onClick={() => handleSort('joined')}>
                             Cadastro {renderSortIcon('joined')}
                           </th>
                           <th className="p-3">Ações</th>
                         </tr>
                       </thead>
                       <tbody>
                         {filteredUsers.map((user) => (
                           <tr key={user.id} className="border-b border-border hover:bg-background/50">
                             <td className="p-3">{user.name}</td>
                             <td className="p-3">{user.email}</td>
                             <td className="p-3">
                               <select
                                 value={user.role}
                                 onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'administrador')}
                                 className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                               >
                                 <option value="user">Usuário</option>
                                 <option value="administrador">Administrador</option>
                               </select>
                             </td>
                             <td className="p-3">
                               <select
                                 value={user.plan}
                                 onChange={(e) => handlePlanChange(user.id, e.target.value as PlanType)}
                                 className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                               >
                                 <option value="free">Free</option>
                                 <option value="pro">Pro</option>
                                 <option value="enterprise">Enterprise</option>
                               </select>
                             </td>
                             <td className="p-3">
                               <select
                                 value={user.status || 'active'}
                                 onChange={(e) => handleStatusChange(user.id, e.target.value as 'active' | 'inactive' | 'banned')}
                                 className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                               >
                                 <option value="active">Ativo</option>
                                 <option value="inactive">Inativo</option>
                                 <option value="banned">Banido</option>
                               </select>
                             </td>
                             <td className="p-3">{user.createdAt.toLocaleDateString()}</td>
                             <td className="p-3">
                               <div className="flex gap-2">
                                 <button onClick={() => handleEditUser(user)} className="p-1 hover:text-primary" title="Editar">
                                   <Edit size={16} />
                                 </button>
                                 <button onClick={() => handleDeleteUserClick(user)} className="p-1 hover:text-error" title="Excluir">
                                   <Trash2 size={16} />
                                 </button>
                                 <button onClick={() => handleResetPassword(user.id)} className="p-1 hover:text-warning" title="Resetar Senha">
                                   <Key size={16} />
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </DraggableItem>

               {/* Pagination Controls (Draggable) */}
               {/* MODIFIED: Pass isAdmin prop and removed handle class from inner div */}
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
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar por nome ou email..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
              </div>
              <button className="btn btn-primary flex items-center gap-2" onClick={handleCreateUser}>
                <PlusCircle size={18} />
                <span>Adicionar Usuário</span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="ml-2 text-text/70">Carregando usuários...</span>
              </div>
            ) : (
              <div className="bg-card rounded-lg overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-text/70">
                      <th className="p-3 cursor-pointer" onClick={() => handleSort('name')}>
                        Nome {renderSortIcon('name')}
                      </th>
                      <th className="p-3 cursor-pointer" onClick={() => handleSort('email')}>
                        Email {renderSortIcon('email')}
                      </th>
                      <th className="p-3">Papel</th>
                      <th className="p-3">Plano</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 cursor-pointer" onClick={() => handleSort('joined')}>
                        Cadastro {renderSortIcon('joined')}
                      </th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-background/50">
                        <td className="p-3">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'administrador')}
                            className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                          >
                            <option value="user">Usuário</option>
                            <option value="administrador">Administrador</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={user.plan}
                            onChange={(e) => handlePlanChange(user.id, e.target.value as PlanType)}
                            className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={user.status || 'active'}
                            onChange={(e) => handleStatusChange(user.id, e.target.value as 'active' | 'inactive' | 'banned')}
                            className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                          >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                            <option value="banned">Banido</option>
                          </select>
                        </td>
                        <td className="p-3">{user.createdAt.toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditUser(user)} className="p-1 hover:text-primary" title="Editar">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteUserClick(user)} className="p-1 hover:text-error" title="Excluir">
                              <Trash2 size={16} />
                            </button>
                            <button onClick={() => handleResetPassword(user.id)} className="p-1 hover:text-warning" title="Resetar Senha">
                              <Key size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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


      {/* User Form Modal (for Create and Edit) */}
      {isFormModalOpen && (
        <UserForm
          user={currentUser}
          onClose={() => { setIsFormModalOpen(false); setCurrentUser(null); }}
          onSave={handleSaveUser}
          isSaving={isSavingUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && userToDelete && (
        <DeleteConfirmModal
          itemType="usuário"
          itemName={userToDelete.name}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          onConfirm={handleDeleteUserConfirm}
          isDeleting={isDeletingUser}
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

export default AdminUsersPage;
