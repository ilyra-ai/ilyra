import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface CrudOptions<T> {
  fetchItems: () => Promise<T[]>;
  createItem: (data: Partial<T>) => Promise<T>;
  updateItem: (id: string, data: Partial<T>) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
  itemName: string;
}

export const useCrud = <T extends { id: string }>({
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  itemName
}: CrudOptions<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      error(`Erro ao carregar ${itemName}s`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, itemName, error]);

  const handleCreate = useCallback(async (data: Partial<T>) => {
    setIsSubmitting(true);
    try {
      const newItem = await createItem(data);
      setItems((prev) => [newItem, ...prev]);
      success(`${itemName} criado com sucesso!`);
      setIsModalOpen(false);
    } catch (err) {
      error(`Erro ao criar ${itemName}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [createItem, itemName, success, error]);

  const handleUpdate = useCallback(async (id: string, data: Partial<T>) => {
    setIsSubmitting(true);
    try {
      const updatedItem = await updateItem(id, data);
      setItems((prev) => 
        prev.map((item) => item.id === id ? updatedItem : item)
      );
      success(`${itemName} atualizado com sucesso!`);
      setIsModalOpen(false);
    } catch (err) {
      error(`Erro ao atualizar ${itemName}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [updateItem, itemName, success, error]);

  const handleDelete = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      success(`${itemName} excluído com sucesso!`);
    } catch (err) {
      error(`Erro ao excluir ${itemName}`);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem, itemName, success, error]);

  const openCreateModal = useCallback(() => {
    setSelectedItem(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  return {
    items,
    isLoading,
    selectedItem,
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
  };
};
