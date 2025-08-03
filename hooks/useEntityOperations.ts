import { useState, useCallback } from "react";
import { useAccountingStore } from "@/store";

interface UseEntityOperationsOptions<T> {
  entityName: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  confirmDelete?: boolean;
}

export function useEntityOperations<T extends { id: string }>(
  options: UseEntityOperationsOptions<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const { entityName, onSuccess, onError, confirmDelete = true } = options;

  const handleSuccess = useCallback((message: string) => {
    setError(null);
    setLoading(false);
    onSuccess?.(message);
  }, [onSuccess]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
    onError?.(errorMessage);
  }, [onError]);

  const createEntity = useCallback(async (
    createFn: () => Promise<void> | void,
    successMessage?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await createFn();
      handleSuccess(successMessage || `${entityName} created successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to create ${entityName}`;
      handleError(errorMessage);
    }
  }, [entityName, handleSuccess, handleError]);

  const updateEntity = useCallback(async (
    updateFn: () => Promise<void> | void,
    successMessage?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateFn();
      handleSuccess(successMessage || `${entityName} updated successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update ${entityName}`;
      handleError(errorMessage);
    }
  }, [entityName, handleSuccess, handleError]);

  const deleteEntity = useCallback(async (
    deleteFn: () => Promise<void> | void,
    successMessage?: string
  ) => {
    if (confirmDelete) {
      setItemToDelete(null);
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await deleteFn();
      handleSuccess(successMessage || `${entityName} deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${entityName}`;
      handleError(errorMessage);
    }
  }, [entityName, confirmDelete, handleSuccess, handleError]);

  const confirmDeleteEntity = useCallback(async (
    deleteFn: () => Promise<void> | void,
    successMessage?: string
  ) => {
    setLoading(true);
    setError(null);
    setShowDeleteConfirm(false);
    
    try {
      await deleteFn();
      handleSuccess(successMessage || `${entityName} deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${entityName}`;
      handleError(errorMessage);
    }
  }, [entityName, handleSuccess, handleError]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  }, []);

  const setDeleteItem = useCallback((item: T) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  }, []);

  return {
    loading,
    error,
    showDeleteConfirm,
    itemToDelete,
    createEntity,
    updateEntity,
    deleteEntity,
    confirmDeleteEntity,
    cancelDelete,
    setDeleteItem,
    clearError: () => setError(null),
  };
} 