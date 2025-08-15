import { useState, useEffect } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // For web-based app, check localStorage for authentication
        const isAuth = localStorage.getItem("isAuthenticated") === "true";
        setIsAuthenticated(isAuth);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = async () => {
    try {
      // For web-based app, clear localStorage and update state
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
};
