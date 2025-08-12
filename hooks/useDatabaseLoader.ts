"use client";

import { useEffect, useState } from "react";
import { useAccountingStore } from "../store";

export const useDatabaseLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { replaceAllData } = useAccountingStore();

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
        const sampleData = await import("../data/sample-data-v2.json");
        data = sampleData.default;
        console.log("🔄 Database loader: Sample data loaded:", data);
      }

      // Update the store with data
      replaceAllData(data);
      console.log("🔄 Database loader: Store updated with data");

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
