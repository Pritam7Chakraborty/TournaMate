import React, { useCallback, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ToastContext } from "./ToastContext.jsx";

function Toast({ id, type = "info", text, onClose }) {
  const base =
    "pointer-events-auto max-w-sm w-full rounded-lg px-4 py-3 shadow-lg flex items-start gap-3 border";
  const typeStyles =
    type === "success"
      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent"
      : type === "error"
      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent"
      : "bg-white/5 text-white border-white/10";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`transform transition-all duration-300 ease-out animate-fade-in-up ${base} ${typeStyles}`}
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}
    >
      <div className="flex-1 text-left">
        <div className="text-sm font-medium">{text}</div>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex items-center justify-center p-1 rounded hover:bg-white/10"
        aria-label="Close toast"
      >
        <FaTimes className="text-white text-sm" />
      </button>
    </div>
  );
}

export function ToastProvider({ children, maxToasts = 4 }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (text, { type = "info", duration = 3000, id = null } = {}) => {
      const toastId = id || `toast-${Date.now()}-${Math.round(Math.random() * 1000)}`;

      setToasts((prev) => {
        const next = [...prev, { id: toastId, type, text }];
        if (next.length > maxToasts) next.shift();
        return next;
      });

      if (duration > 0) {
        setTimeout(() => removeToast(toastId), duration);
      }

      return toastId;
    },
    [maxToasts, removeToast]
  );

  const contextValue = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-live="assertive"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 items-end"
        style={{ pointerEvents: "none" }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <Toast id={t.id} text={t.text} type={t.type} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}