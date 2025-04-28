import React, { useState, useEffect } from 'react';
import { DollarSign, PlusCircle, Edit, Trash2, ArrowLeft, ArrowRight, Loader2, Search, ArrowUp, ArrowDown } from 'lucide-react'; // Added Search, ArrowUp, ArrowDown
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import DeleteConfirmModal from '../components/UI/DeleteConfirmModal';
import SubscriptionForm from '../components/Admin/SubscriptionForm';

// Define a type for Subscription based on your database schema
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string; // Store as ISO string
  end_date: string | null; // Store as ISO string or null
  status: string; // e.g., 'active', 'cancelled', 'expired'
  created_at: string; // Store as ISO string
  updated_at: string; // Store as ISO string
  // Add related data if needed for display, e.g., user_email, plan_name
  user_email?: string; // Simulated join data
  plan_name?: string; // Simulated join data
}

const AdminSubscriptionsPage: React.FC = () => {
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]); // Store all fetched subscriptions
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]); // Store filtered/sorted subscriptions

  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [sortBy, setSortBy] = useState<'start_date' | 'end_date' | 'status' | 'user_id' | 'plan_id' | null>(null); // State for sorting column
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // State for sorting direction

  const [currentPage, setCurrentPage] = useState(1);
  const [subscriptionsPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);

  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [isDeletingSubscription, setIsDeletingSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const loadSubscriptions = async () => {
      setIsLoading(true);
      try {
        const fetchedSubscriptions = await api.admin.subscriptions.get();
        setAllSubscriptions(fetchedSubscriptions); // Store in allSubscriptions
        setFilteredSubscriptions(fetchedSubscriptions); // Initialize filtered list
      } catch (error) {
        console.error("Erro ao carregar assinaturas via API simulada:", error);
        alert("Falha ao carregar assinaturas.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  // Effect to filter and sort subscriptions whenever allSubscriptions, searchTerm, sortBy, or sortDirection changes
  useEffect(() => {
    filterAndSortSubscriptions();
  }, [allSubscriptions, searchTerm, sortBy, sortDirection]);


  const filterAndSortSubscriptions = () => {
    let currentSubs = [...allSubscriptions];

    // Filter
    if (searchTerm) {
      currentSubs = currentSubs.filter(sub =>
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase())) || // Include simulated fields
        (sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())) // Include simulated fields
      );
    }

    // Sort
    if (sortBy) {
      currentSubs.sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];

        // Handle null/undefined values for dates
        if (sortBy === 'start_date' || sortBy === 'end_date') {
            const dateA = valueA ? new Date(valueA as string).getTime() : (sortBy === 'end_date' ? Infinity : -Infinity); // Treat null end_date as latest
            const dateB = valueB ? new Date(valueB as string).getTime() : (sortBy === 'end_date' ? Infinity : -Infinity);

            if (dateA < dateB) return sortDirection === 'asc' ? -1 : 1;
            if (dateA > dateB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        } else {
            // Handle string/other types
            const comparison = (valueA as string || '').localeCompare(valueB as string || '');
            return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }

    setFilteredSubscriptions(currentSubs);
    setCurrentPage(1); // Reset to first page after filter/sort
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: 'start_date' | 'end_date' | 'status' | 'user_id' | 'plan_id') => {
    const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDirection(newDirection);
  };


  const handleCreateSubscription = () => {
    setCurrentSubscription(null);
    setIsFormModalOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setCurrentSubscription(subscription);
    setIsFormModalOpen(true);
  };

  const handleSaveSubscription = async (subscriptionData: Partial<Subscription>) => {
    setIsSavingSubscription(true);
    try {
      if (subscriptionData.id) {
        console.log("[API Simulado] Editando assinatura:", subscriptionData.id, subscriptionData);
        await api.admin.subscriptions.update(subscriptionData.id, subscriptionData);
        setAllSubscriptions(prevSubscriptions => prevSubscriptions.map(sub => sub.id === subscriptionData.id ? { ...sub, ...subscriptionData } as Subscription : sub));
        alert("Assinatura atualizada com sucesso! (Simulado)");
      } else {
        console.log("[API Simulado] Criando nova assinatura:", subscriptionData);
        const newSubscription = await api.admin.subscriptions.create(subscriptionData);
        setAllSubscriptions(prevSubscriptions => [...prevSubscriptions, newSubscription]);
        alert("Assinatura criada com sucesso! (Simulado)");
      }
      setIsFormModalOpen(false);
      setCurrentSubscription(null);
    } catch (error: any) {
      console.error("[API Simulado] Erro ao salvar assinatura:", error);
      alert(error.message || "Falha ao salvar assinatura.");
    } finally {
      setIsSavingSubscription(false);
    }
  };


  const handleDeleteSubscriptionClick = (subscription: Subscription) => {
    setSubscriptionToDelete(subscription);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteSubscriptionConfirm = async () => {
     if (!subscriptionToDelete) {
       return;
     }
     setIsDeletingSubscription(true);
     try {
        await api.admin.subscriptions.delete(subscriptionToDelete.id);
        setAllSubscriptions(prevSubscriptions => prevSubscriptions.filter(sub => sub.id !== subscriptionToDelete.id));
        alert("Assinatura excluída com sucesso! (Simulado)");
     } catch (error: any) {
        console.error("Falha ao excluir assinatura via API simulada:", error);
        alert(error.message || "Falha ao excluir assinatura.");
     } finally {
        setIsDeletingSubscription(false);
        setIsDeleteConfirmModalOpen(false);
        setSubscriptionToDelete(null);
     }
  };


  const indexOfLastSubscription = currentPage * subscriptionsPerPage;
  const indexOfFirstSubscription = indexOfLastSubscription - subscriptionsPerPage;
  const currentSubscriptions = filteredSubscriptions.slice(indexOfFirstSubscription, indexOfLastSubscription); // Use filteredSubscriptions

  const totalPages = Math.ceil(filteredSubscriptions.length / subscriptionsPerPage); // Use filteredSubscriptions length

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderSortIcon = (column: 'start_date' | 'end_date' | 'status' | 'user_id' | 'plan_id') => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
  };


  return (
    <div className="p-6">
       <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign size={24} className="text-secondary" />
          Gerenciar Assinaturas
        </h1>
         <Link to="/admin/dashboard" className="btn btn-outline">
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-4"> {/* Added flex layout for search and add button */}
        <div className="relative flex-1"> {/* Make search bar take available space */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por ID, usuário, plano ou status..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
        </div>
         <button className="btn btn-primary flex items-center gap-2" onClick={handleCreateSubscription}>
           <PlusCircle size={18} />
           <span>Adicionar Assinatura</span>
         </button>
       </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-secondary" />
          <span className="ml-2 text-text/70">Carregando assinaturas...</span>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-border text-left text-sm text-text/70">
                <th className="p-3">ID</th>
                <th className="p-3 cursor-pointer" onClick={() => handleSort('user_id')}>
                  ID Usuário {renderSortIcon('user_id')}
                </th>
                <th className="p-3 cursor-pointer" onClick={() => handleSort('plan_id')}>
                  ID Plano {renderSortIcon('plan_id')}
                </th>
                <th className="p-3 cursor-pointer" onClick={() => handleSort('status')}>
                  Status {renderSortIcon('status')}
                </th>
                <th className="p-3 cursor-pointer" onClick={() => handleSort('start_date')}>
                  Início {renderSortIcon('start_date')}
                </th>
                <th className="p-3 cursor-pointer" onClick={() => handleSort('end_date')}>
                  Fim {renderSortIcon('end_date')}
                </th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-border hover:bg-background/50">
                  <td className="p-3 text-sm truncate max-w-[100px]">{subscription.id}</td>
                  <td className="p-3 text-sm truncate max-w-[100px]">{subscription.user_id}</td>
                  <td className="p-3 text-sm truncate max-w-[100px]">{subscription.plan_id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded ${subscription.status === 'active' ? 'bg-success/10 text-success' : subscription.status === 'cancelled' ? 'bg-warning/10 text-warning' : 'bg-gray-500/10 text-gray-500'}`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{new Date(subscription.start_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm">{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                       <button onClick={() => handleEditSubscription(subscription)} className="p-1 hover:text-primary" title="Editar">
                         <Edit size={16} />
                       </button>
                       <button onClick={() => handleDeleteSubscriptionClick(subscription)} className="p-1 hover:text-error" title="Excluir">
                         <Trash2 size={16} />
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

      {/* Subscription Form Modal (for Create and Edit) */}
      {isFormModalOpen && (
        <SubscriptionForm
          subscription={currentSubscription}
          onClose={() => { setIsFormModalOpen(false); setCurrentSubscription(null); }}
          onSave={handleSaveSubscription}
          isSaving={isSavingSubscription}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && subscriptionToDelete && (
        <DeleteConfirmModal
          itemType="assinatura"
          itemName={subscriptionToDelete.id}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          onConfirm={handleDeleteSubscriptionConfirm}
          isDeleting={isDeletingSubscription}
        />
      )}
    </div>
  );
};

export default AdminSubscriptionsPage;
