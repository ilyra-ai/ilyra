import React, { useEffect } from 'react';
import { User, Edit, Trash2, Key } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import { api } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import DeleteConfirmModal from '../UI/DeleteConfirmModal';
import UserForm from './UserForm';
import { User as UserType } from '../../types';

const UserList: React.FC = () => {
  const {
    items: users,
    isLoading,
    selectedItem: selectedUser,
    isModalOpen,
    isDeleting,
    isSubmitting,
    loadItems,
    handleCreate,
    handleUpdate,
    handleDelete,
    openCreateModal,
    openEditModal,
    setIsModalOpen
  } = useCrud<UserType>({
    fetchItems: api.admin.users.get,
    createItem: (data) => api.admin.users.create(data),
    updateItem: (id, data) => api.admin.users.update(id, data),
    deleteItem: (id) => api.admin.users.delete(id),
    itemName: 'usuário'
  });

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner message="Carregando usuários..." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={openCreateModal}
        >
          <User size={18} />
          <span>Adicionar Usuário</span>
        </button>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Papel</th>
              <th className="p-4 text-left">Plano</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'administrador' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {user.role === 'administrador' ? 'Administrador' : 'Usuário'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.plan === 'free' 
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-success/10 text-success'
                  }`}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1 hover:text-primary"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1 hover:text-error"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => api.admin.users.resetPassword(user.id)}
                      className="p-1 hover:text-warning"
                      title="Resetar Senha"
                    >
                      <Key size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserForm
          user={selectedUser}
          onSubmit={selectedUser ? 
            (data) => handleUpdate(selectedUser.id, data) : 
            handleCreate
          }
          onClose={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedUser && isDeleting && (
        <DeleteConfirmModal
          itemType="usuário"
          itemName={selectedUser.name}
          onConfirm={() => handleDelete(selectedUser.id)}
          onClose={() => setIsModalOpen(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default UserList;
