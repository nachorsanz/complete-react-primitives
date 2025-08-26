import { ReactNode } from "react";

/**
 * Tipos de toast disponibles
 */
export type ToastType = "success" | "error" | "warning" | "info" | "loading";

/**
 * Posiciones donde puede aparecer el toast
 */
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

/**
 * Variantes de estilo para el toast
 */
export type ToastVariant = "filled" | "outlined" | "minimal";

/**
 * Configuración de un toast individual
 */
export interface ToastOptions {
  /** Tipo de toast que determina el color y icono */
  type?: ToastType;
  /** Duración en milisegundos antes de auto-dismiss (0 = no auto-dismiss) */
  duration?: number;
  /** Si el toast es dismissible por el usuario */
  dismissible?: boolean;
  /** Posición donde aparece el toast */
  position?: ToastPosition;
  /** Variante de estilo */
  variant?: ToastVariant;
  /** Icono personalizado (sobrescribe el icono por defecto del tipo) */
  icon?: ReactNode;
  /** Acción personalizada (botón/link) */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Datos adicionales que se pueden usar para identificar o filtrar toasts */
  data?: Record<string, any>;
  /** Callback cuando el toast se cierra */
  onClose?: () => void;
  /** ID único del toast (se genera automáticamente si no se proporciona) */
  id?: string;
}

/**
 * Configuración global del sistema de toasts
 */
export interface ToastConfig {
  /** Duración por defecto para todos los toasts */
  defaultDuration?: number;
  /** Posición por defecto */
  defaultPosition?: ToastPosition;
  /** Variante por defecto */
  defaultVariant?: ToastVariant;
  /** Máximo número de toasts visibles al mismo tiempo */
  maxToasts?: number;
  /** Si pausar los timers cuando el mouse está sobre un toast */
  pauseOnHover?: boolean;
  /** Si pausar los timers cuando la ventana pierde el foco */
  pauseOnFocusLoss?: boolean;
  /** Gap entre toasts en píxeles */
  gap?: number;
  /** Offset desde los bordes de la pantalla */
  offset?: {
    x?: number;
    y?: number;
  };
}

/**
 * Estado interno de un toast
 */
export interface Toast extends Required<Omit<ToastOptions, "onClose" | "data" | "icon" | "action">> {
  /** ID único del toast */
  id: string;
  /** Mensaje del toast */
  message: ReactNode;
  /** Timestamp cuando fue creado */
  createdAt: number;
  /** Si está visible actualmente */
  visible: boolean;
  /** Si está siendo removido (animación de salida) */
  removing: boolean;
  /** Icono personalizado (opcional) */
  icon?: ReactNode;
  /** Acción personalizada (opcional) */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Datos adicionales */
  data?: Record<string, any>;
  /** Callback cuando se cierra */
  onClose?: () => void;
}

/**
 * API del hook useToast
 */
export interface ToastAPI {
  /** Mostrar toast de éxito */
  success: (message: ReactNode, options?: Omit<ToastOptions, "type">) => string;
  /** Mostrar toast de error */
  error: (message: ReactNode, options?: Omit<ToastOptions, "type">) => string;
  /** Mostrar toast de advertencia */
  warning: (message: ReactNode, options?: Omit<ToastOptions, "type">) => string;
  /** Mostrar toast informativo */
  info: (message: ReactNode, options?: Omit<ToastOptions, "type">) => string;
  /** Mostrar toast de carga */
  loading: (message: ReactNode, options?: Omit<ToastOptions, "type">) => string;
  /** Mostrar toast personalizado */
  custom: (message: ReactNode, options?: ToastOptions) => string;
  /** Cerrar un toast específico */
  dismiss: (id: string) => void;
  /** Cerrar todos los toasts */
  dismissAll: () => void;
  /** Actualizar un toast existente */
  update: (id: string, message: ReactNode, options?: Partial<ToastOptions>) => void;
  /** Obtener lista actual de toasts */
  toasts: Toast[];
}

/**
 * Props del ToastProvider
 */
export interface ToastProviderProps {
  /** Configuración global */
  config?: ToastConfig;
  /** Elementos hijos */
  children: ReactNode;
}

/**
 * Props del ToastContainer
 */
export interface ToastContainerProps {
  /** Posición específica para este container */
  position?: ToastPosition;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Props de un Toast individual
 */
export interface ToastItemProps {
  /** Datos del toast */
  toast: Toast;
  /** Función para cerrar el toast */
  onDismiss: (id: string) => void;
  /** Configuración global */
  config: Required<ToastConfig>;
}
