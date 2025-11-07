"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; message: string; type: ToastType };

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void;
} | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    setToasts((t) => [...t, { id, message, type }]);
    // auto remove
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm px-4 py-2 rounded-md shadow-md text-sm text-white flex items-center justify-between gap-3 border ${
              toast.type === "success"
                ? "bg-green-600 border-green-700"
                : toast.type === "error"
                ? "bg-red-600 border-red-700"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <span className="truncate">{toast.message}</span>
            <button
              aria-label="Dismiss"
              onClick={() => remove(toast.id)}
              className="ml-3 opacity-80 hover:opacity-100 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
