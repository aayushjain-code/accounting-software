import { useEffect } from 'react';
import { useAccountingStore } from '@/store';

export const useSupabaseSync = () => {
  const { loadDataFromSupabase, syncWithSupabase } = useAccountingStore();

  useEffect(() => {
    // Load data from Supabase when the app starts
    const initializeData = async () => {
      try {
        await loadDataFromSupabase();
      } catch (error) {
        console.error('Failed to initialize data from Supabase:', error);
      }
    };

    initializeData();
  }, [loadDataFromSupabase]);

  return {
    syncWithSupabase,
    loadDataFromSupabase,
  };
};
