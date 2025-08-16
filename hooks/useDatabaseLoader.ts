"use client";

import { useEffect, useState } from "react";
import { useAccountingStore } from "../store";

export const useDatabaseLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { replaceAllData, loadDataFromSupabase } = useAccountingStore();

  const loadDataFromDatabase = async () => {
    if (typeof window === "undefined") {
      console.log("🔄 Database loader: Not in browser environment");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔄 Database loader: Loading data from localStorage...");
      // For web-based app, load data from localStorage or use sample data
      const storedData = localStorage.getItem("accountingData");
      let data;

      if (storedData) {
        data = JSON.parse(storedData);
        console.log("🔄 Database loader: Data loaded from localStorage:", data);
      } else {
        // Load sample data if no stored data exists
        try {
          const sampleData = await import("../data/sample-data-v2.json");
          data = sampleData.default;
          console.log("🔄 Database loader: Sample data loaded:", data);

          // Store the sample data in localStorage for future use
          localStorage.setItem("accountingData", JSON.stringify(data));
          console.log("🔄 Database loader: Sample data stored in localStorage");
        } catch (importError) {
          console.error(
            "🔄 Database loader: Error importing sample data:",
            importError
          );
          // Try alternative approach - fetch the data
          try {
            const response = await fetch("/data/sample-data-v2.json");
            if (response.ok) {
              data = await response.json();
              console.log(
                "🔄 Database loader: Sample data loaded via fetch:",
                data
              );
              localStorage.setItem("accountingData", JSON.stringify(data));
            } else {
              throw new Error(
                `Failed to fetch sample data: ${response.status}`
              );
            }
          } catch (fetchError) {
            console.error(
              "🔄 Database loader: Error fetching sample data:",
              fetchError
            );
            // Create minimal data structure
            data = {
              clients: [],
              projects: [],
              invoices: [],
              expenses: [],
              timesheets: [],
              dailyLogs: [],
              companyProfile: {
                name: "BST",
                email: "info@bst.com",
              },
            };
            console.log("🔄 Database loader: Using minimal data structure");
          }
        }
      }

      // Update the store with data
      replaceAllData(data);
      console.log("🔄 Database loader: Store updated with data");

      // Now try to load data from Supabase to sync/override local data
      try {
        console.log("🔄 Database loader: Attempting to load data from Supabase...");
        await loadDataFromSupabase();
        console.log("🔄 Database loader: Supabase data loaded successfully");
      } catch (supabaseError) {
        console.warn("🔄 Database loader: Supabase data loading failed, using local data:", supabaseError);
        // Continue with local data if Supabase fails
      }

      setIsLoading(false);
    } catch (error) {
      console.error("🔄 Database loader: Error loading data:", error);
      // Don't show error, just proceed without data
      console.log("🔄 Database loader: Proceeding without data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  // Reload data from database
  const reloadData = async () => {
    setIsLoading(true);
    setError(null);
    await loadDataFromDatabase();
  };

  return {
    isLoading,
    error,
    reloadData,
  };
};
