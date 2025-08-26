import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { Toast, ToastAPI, ToastConfig, ToastOptions, ToastType } from "./types";

/**
 * Configuración por defecto del sistema de toasts
 */
const DEFAULT_CONFIG: Required<ToastConfig> = {
  defaultDuration: 4000,
  defaultPosition: "top-right",
  defaultVariant: "filled",
  maxToasts: 5,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  gap: 8,
  offset: { x: 16, y: 16 },
};

/**
 * Contexto del sistema de toasts
 */
interface ToastContextValue {
  /** Lista actual de toasts */
  toasts: Toast[];
  /** Configuración actual */
  config: Required<ToastConfig>;
  /** API para manejar toasts */
  api: ToastAPI;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook para acceder al contexto de toasts
 * @throws Error si se usa fuera del ToastProvider
 */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/**
 * Genera un ID único para un toast
 */
function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Props del ToastProvider
 */
export interface ToastProviderProps {
  /** Configuración global opcional */
  config?: Partial<ToastConfig>;
  /** Elementos hijos */
  children: ReactNode;
}

/**
 * Provider que maneja el estado global de toasts
 * Debe envolver la aplicación para usar el sistema de toasts
 *
 * @example
 * ```tsx
 * import { ToastProvider } from '@complete/react-toast';
 *
 * function App() {
 *   return (
 *     <ToastProvider config={{ maxToasts: 3, defaultPosition: 'bottom-center' }}>
 *       <MyApplication />
 *     </ToastProvider>
 *   );
 * }
 * ```
 */
export function ToastProvider({ config: userConfig = {}, children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  /**
   * Limpia el timer de un toast específico
   */
  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /**
   * Configura el timer de auto-dismiss para un toast
   */
  const setTimer = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return;

      clearTimer(id);
      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [clearTimer],
  );

  /**
   * Crea un nuevo toast
   */
  const createToast = useCallback(
    (message: ReactNode, options: ToastOptions = {}): string => {
      const id = options.id || generateToastId();
      const duration = options.duration ?? config.defaultDuration;

      const toast: Toast = {
        id,
        message,
        type: options.type || "info",
        duration,
        dismissible: options.dismissible ?? true,
        position: options.position || config.defaultPosition,
        variant: options.variant || config.defaultVariant,
        icon: options.icon,
        action: options.action,
        data: options.data,
        onClose: options.onClose,
        createdAt: Date.now(),
        visible: true,
        removing: false,
      };

      setToasts((prev) => {
        // Filtrar toasts existentes por posición y aplicar límite
        const samePosition = prev.filter((t) => t.position === toast.position);
        const otherPositions = prev.filter((t) => t.position !== toast.position);

        let newPositionToasts = [toast, ...samePosition];

        // Aplicar límite de toasts por posición
        if (newPositionToasts.length > config.maxToasts) {
          const toRemove = newPositionToasts.slice(config.maxToasts);
          toRemove.forEach((t) => clearTimer(t.id));
          newPositionToasts = newPositionToasts.slice(0, config.maxToasts);
        }

        return [...newPositionToasts, ...otherPositions];
      });

      // Configurar auto-dismiss
      if (duration > 0) {
        setTimer(id, duration);
      }

      return id;
    },
    [config, clearTimer, setTimer],
  );

  /**
   * Cierra un toast específico
   */
  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);

      setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, removing: true } : toast)));

      // Remover del estado después de la animación
      setTimeout(() => {
        setToasts((prev) => {
          const toast = prev.find((t) => t.id === id);
          if (toast?.onClose) {
            toast.onClose();
          }
          return prev.filter((t) => t.id !== id);
        });
      }, 300); // Duración de la animación de salida
    },
    [clearTimer],
  );

  /**
   * Cierra todos los toasts
   */
  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();

    setToasts((prev) => {
      prev.forEach((toast) => {
        if (toast.onClose) {
          toast.onClose();
        }
      });
      return [];
    });
  }, []);

  /**
   * Actualiza un toast existente
   */
  const update = useCallback(
    (id: string, message: ReactNode, options: Partial<ToastOptions> = {}) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                message,
                ...options,
                // Si se cambia la duración, reconfigurar timer
                duration: options.duration ?? toast.duration,
              }
            : toast,
        ),
      );

      // Reconfigurar timer si es necesario
      if (options.duration !== undefined) {
        setTimer(id, options.duration);
      }
    },
    [setTimer],
  );

  /**
   * API completa del sistema de toasts
   */
  const api: ToastAPI = {
    success: (message, options) => createToast(message, { ...options, type: "success" }),
    error: (message, options) => createToast(message, { ...options, type: "error" }),
    warning: (message, options) => createToast(message, { ...options, type: "warning" }),
    info: (message, options) => createToast(message, { ...options, type: "info" }),
    loading: (message, options) => createToast(message, { ...options, type: "loading" }),
    custom: createToast,
    dismiss,
    dismissAll,
    update,
    toasts,
  };

  return <ToastContext.Provider value={{ toasts, config, api }}>{children}</ToastContext.Provider>;
}
