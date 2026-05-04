"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const ToastContext = createContext(null);
const DEFAULT_TOAST_DURATION = 3500;
const DEFAULT_TRANSMISSION_DELAY = 600;
const ENTRY_ANIMATION_DURATION = 500;
const EXIT_ANIMATION_DURATION = 700;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerIdsRef = useRef([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((toast) => (
      toast.id === id ? { ...toast, isExiting: true } : toast
    )));

    const cleanupTimer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, EXIT_ANIMATION_DURATION);

    timerIdsRef.current.push(cleanupTimer);
  }, []);

  const showToast = useCallback((message, type = "success", duration = DEFAULT_TOAST_DURATION) => {
    const id = Date.now() + Math.random();
    const addTimer = window.setTimeout(() => {
      setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);

      const removeTimer = window.setTimeout(() => {
        dismissToast(id);
      }, duration);

      timerIdsRef.current.push(removeTimer);
    }, DEFAULT_TRANSMISSION_DELAY);

    timerIdsRef.current.push(addTimer);
  }, [dismissToast]);

  useEffect(() => {
    return () => {
      timerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: "fixed", top: "24px", right: "24px",
        zIndex: 99999, display: "flex", flexDirection: "column", gap: "10px"
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 18px", borderRadius: "10px",
              minWidth: "280px", maxWidth: "400px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              background: toast.type === "success" ? "#0BAB7C"
                : toast.type === "error" ? "#E53935"
                : toast.type === "warning" ? "#F59E0B"
                : "#1976D2",
              color: "#fff", fontSize: "14px", fontWeight: 500,
              animation: toast.isExiting
                ? `slideOutToast ${EXIT_ANIMATION_DURATION}ms ease-in forwards`
                : `slideInToast ${ENTRY_ANIMATION_DURATION}ms ease-out forwards`,
            }}
          >
            <span style={{ fontSize: "18px" }}>
              {toast.type === "success" ? "✓"
                : toast.type === "error" ? "✕"
                : toast.type === "warning" ? "⚠"
                : "ℹ"}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px", padding: "0 4px", opacity: 0.8 }}
            >×</button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(56px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutToast {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(84px); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.showToast;
};
