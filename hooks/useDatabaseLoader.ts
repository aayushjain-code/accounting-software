import { useEffect, useRef } from "react";
import { useAccountingStore } from "@/store";

export function useDatabaseLoader() {
  const { clearAllData } = useAccountingStore();
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Load data from database if in Electron mode and not already loaded
    if (
      typeof window !== "undefined" &&
      window.electronAPI?.isElectron &&
      !hasLoaded.current
    ) {
      hasLoaded.current = true;

      const loadDataFromDatabase = async () => {
        try {
          const data = await window.electronAPI?.getAllData?.();
          if (data && Object.keys(data).length > 0) {
            console.log("Loading data from database:", data);

            // Clear current store data first
            clearAllData();

            // Force a page reload to get fresh data from database
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        } catch (error) {
          console.error("Error loading data from database:", error);
        }
      };

      // Load data after a short delay to ensure window.electronAPI is available
      setTimeout(loadDataFromDatabase, 1000);
    }
  }, [clearAllData]);
}
