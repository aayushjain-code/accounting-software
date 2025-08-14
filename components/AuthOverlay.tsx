import React, { useState, useEffect } from "react";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface AuthOverlayProps {
  onAuthenticated: () => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({
  onAuthenticated,
}) => {
  const [currentPin, setCurrentPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | ""
  >("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked] = useState(false);
  const [remainingTime] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Only check auth status if not already authenticated
    if (!isAuthenticated) {
      checkAuthStatus();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      // For web-based app, check if user is already authenticated
      const isAuth = localStorage.getItem("isAuthenticated") === "true";
      if (isAuth) {
        setIsAuthenticated(true);
        onAuthenticated();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };



  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPin.length !== 4) {
      setMessage("Please enter a 4-digit PIN");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // For web-based app, use a simple PIN verification
      // Default PIN is "1234" - in production, this would be stored securely
      const defaultPin = "1234";

      if (currentPin === defaultPin) {
        setMessage("Authentication successful!");
        setMessageType("success");
        // Store authentication in localStorage
        localStorage.setItem("isAuthenticated", "true");
        setTimeout(() => {
          onAuthenticated();
        }, 1000);
      } else {
        setMessage("Invalid PIN. Please try again.");
        setMessageType("error");
        setCurrentPin("");
      }
    } catch {
      setMessage("Authentication failed. Please try again.");
      setMessageType("error");
      setCurrentPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Enter your PIN to access the application
          </p>
        </div>

        {isLocked ? (
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium">
                Account is locked due to too many failed attempts
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Unlock in: {formatTime(remainingTime)}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={currentPin}
                  onChange={(e) =>
                    setCurrentPin(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono"
                  placeholder="Enter 4-digit PIN"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  messageType === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : messageType === "error"
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : messageType === "warning"
                    ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                    : "bg-gray-50 text-gray-800 border border-gray-200"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || currentPin.length !== 4}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Authenticate"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
