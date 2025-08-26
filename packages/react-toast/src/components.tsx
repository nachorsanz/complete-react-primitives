import React, { useEffect, useRef } from "react";
import { useToastContext } from "./context";
import { Toast, ToastPosition, ToastContainerProps, ToastItemProps } from "./types";

/**
 * Iconos por defecto para cada tipo de toast
 */
const DEFAULT_ICONS = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
  loading: "⟳",
} as const;

/**
 * Estilos CSS en línea para los toasts
 * Se incluyen aquí para evitar dependencias externas
 */
const TOAST_STYLES = {
  // Container principal
  container: {
    position: "fixed" as const,
    zIndex: 9999,
    pointerEvents: "none" as const,
    display: "flex",
    flexDirection: "column" as const,
  },
  
  // Toast individual
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    pointerEvents: "auto" as const,
    cursor: "default",
    transition: "all 0.3s ease",
    transform: "translateX(0)",
    opacity: 1,
    marginBottom: "8px",
    maxWidth: "400px",
    wordWrap: "break-word" as const,
  },

  // Estados de animación
  entering: {
    transform: "translateX(100%)",
    opacity: 0,
  },
  
  removing: {
    transform: "translateX(100%)",
    opacity: 0,
  },

  // Botón de cerrar
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    padding: "0",
    marginLeft: "auto",
    opacity: 0.7,
    transition: "opacity 0.2s",
  },

  // Botón de acción
  actionButton: {
    background: "none",
    border: "1px solid currentColor",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "12px",
    cursor: "pointer",
    marginLeft: "8px",
    transition: "all 0.2s",
  },
} as const;

/**
 * Colores para cada tipo de toast
 */
const TOAST_COLORS = {
  filled: {
    success: { background: "#10b981", color: "#ffffff" },
    error: { background: "#ef4444", color: "#ffffff" },
    warning: { background: "#f59e0b", color: "#ffffff" },
    info: { background: "#3b82f6", color: "#ffffff" },
    loading: { background: "#6b7280", color: "#ffffff" },
  },
  outlined: {
    success: { background: "#ffffff", color: "#10b981", border: "1px solid #10b981" },
    error: { background: "#ffffff", color: "#ef4444", border: "1px solid #ef4444" },
    warning: { background: "#ffffff", color: "#f59e0b", border: "1px solid #f59e0b" },
    info: { background: "#ffffff", color: "#3b82f6", border: "1px solid #3b82f6" },
    loading: { background: "#ffffff", color: "#6b7280", border: "1px solid #6b7280" },
  },
  minimal: {
    success: { background: "#f0fdf4", color: "#10b981", border: "1px solid #bbf7d0" },
    error: { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" },
    warning: { background: "#fffbeb", color: "#f59e0b", border: "1px solid #fed7aa" },
    info: { background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" },
    loading: { background: "#f9fafb", color: "#6b7280", border: "1px solid #d1d5db" },
  },
} as const;

/**
 * Calcula la posición CSS para un container de toasts
 */
function getPositionStyles(position: ToastPosition, offset: { x?: number; y?: number }) {
  const styles: React.CSSProperties = {};
  const x = offset.x ?? 16;
  const y = offset.y ?? 16;

  // Posición vertical
  if (position.includes("top")) {
    styles.top = y;
  } else {
    styles.bottom = y;
  }

  // Posición horizontal
  if (position.includes("left")) {
    styles.left = x;
    styles.alignItems = "flex-start";
  } else if (position.includes("right")) {
    styles.right = x;
    styles.alignItems = "flex-end";
  } else {
    styles.left = "50%";
    styles.transform = "translateX(-50%)";
    styles.alignItems = "center";
  }

  return styles;
}

/**
 * Componente individual de toast
 */
function ToastItem({ toast, onDismiss, config }: ToastItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Manejar animaciones de entrada
  useEffect(() => {
    if (ref.current && toast.visible && !toast.removing) {
      // Forzar animación de entrada
      const element = ref.current;
      element.style.transform = "translateX(100%)";
      element.style.opacity = "0";
      
      requestAnimationFrame(() => {
        element.style.transform = "translateX(0)";
        element.style.opacity = "1";
      });
    }
  }, [toast.visible, toast.removing]);

  // Pausar/reanudar timer en hover
  useEffect(() => {
    if (!config.pauseOnHover || !ref.current) return;

    const element = ref.current;
    let pauseTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
      // Aquí se podría pausar el timer del toast
      element.style.transform = "scale(1.02)";
    };

    const handleMouseLeave = () => {
      element.style.transform = "scale(1)";
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [config.pauseOnHover]);

  const colors = TOAST_COLORS[toast.variant][toast.type];
  const icon = toast.icon ?? DEFAULT_ICONS[toast.type];

  const toastStyle: React.CSSProperties = {
    ...TOAST_STYLES.toast,
    ...colors,
    ...(toast.removing ? TOAST_STYLES.removing : {}),
  };

  const closeButtonStyle: React.CSSProperties = {
    ...TOAST_STYLES.closeButton,
    color: colors.color,
  };

  const actionButtonStyle: React.CSSProperties = {
    ...TOAST_STYLES.actionButton,
    color: colors.color,
    borderColor: colors.color,
  };

  return (
    <div
      ref={ref}
      style={toastStyle}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {icon && (
        <span 
          style={{ 
            fontSize: "16px", 
            flexShrink: 0,
            animation: toast.type === "loading" ? "spin 1s linear infinite" : undefined,
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.message}
      </div>

      {toast.action && (
        <button
          style={actionButtonStyle}
          onClick={toast.action.onClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.color;
            e.currentTarget.style.color = colors.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = colors.color;
          }}
        >
          {toast.action.label}
        </button>
      )}

      {toast.dismissible && (
        <button
          style={closeButtonStyle}
          onClick={() => onDismiss(toast.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Container que agrupa y posiciona los toasts
 * 
 * @example
 * ```tsx
 * import { ToastContainer } from '@complete/react-toast';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <MyApp />
 *       {/ * Containers para diferentes posiciones * /}
 *       <ToastContainer position="top-right" />
 *       <ToastContainer position="bottom-center" />
 *     </div>
 *   );
 * }
 * ```
 */
export function ToastContainer({ position, className }: ToastContainerProps) {
  const { toasts, config, api } = useToastContext();

  // Filtrar toasts por posición
  const positionToasts = toasts.filter((toast) => 
    position ? toast.position === position : true
  );

  if (positionToasts.length === 0) {
    return null;
  }

  // Usar la primera posición si no se especifica
  const containerPosition = position || positionToasts[0]?.position || "top-right";
  const positionStyles = getPositionStyles(containerPosition, config.offset);

  const containerStyle: React.CSSProperties = {
    ...TOAST_STYLES.container,
    ...positionStyles,
    gap: `${config.gap}px`,
  };

  return (
    <>
      {/* Estilos CSS para animaciones */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div 
        style={containerStyle}
        className={className}
        aria-label={`Notificaciones ${containerPosition}`}
      >
        {positionToasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={api.dismiss}
            config={config}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Componente que renderiza automáticamente todos los containers necesarios
 * Detecta las posiciones usadas y crea containers para cada una
 * 
 * @example
 * ```tsx
 * import { ToastProvider, Toaster } from '@complete/react-toast';
 * 
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <MyApp />
 *       <Toaster />
 *     </ToastProvider>
 *   );
 * }
 * ```
 */
export function Toaster({ className }: { className?: string }) {
  const { toasts } = useToastContext();

  // Obtener todas las posiciones únicas
  const positions = Array.from(
    new Set(toasts.map((toast) => toast.position))
  ) as ToastPosition[];

  return (
    <>
      {positions.map((position) => (
        <ToastContainer
          key={position}
          position={position}
          className={className}
        />
      ))}
    </>
  );
}
