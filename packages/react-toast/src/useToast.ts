import { ReactNode } from "react";
import { useToastContext } from "./context";
import { ToastAPI, ToastOptions } from "./types";

/**
 * Hook principal para manejar toasts de forma programática.
 * Proporciona una API completa para crear, actualizar y gestionar toasts.
 *
 * @returns API del sistema de toasts
 *
 * @example
 * ```tsx
 * import { useToast } from '@complete/react-toast';
 *
 * function MyComponent() {
 *   const toast = useToast();
 *
 *   const handleSuccess = () => {
 *     toast.success('¡Operación exitosa!');
 *   };
 *
 *   const handleError = async () => {
 *     try {
 *       await riskyOperation();
 *       toast.success('Todo salió bien');
 *     } catch (error) {
 *       toast.error(`Error: ${error.message}`);
 *     }
 *   };
 *
 *   const handleCustom = () => {
 *     const id = toast.custom('Procesando...', {
 *       type: 'loading',
 *       duration: 0, // No auto-dismiss
 *       dismissible: false
 *     });
 *
 *     setTimeout(() => {
 *       toast.update(id, '¡Completado!', { type: 'success', duration: 3000 });
 *     }, 2000);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Success Toast</button>
 *       <button onClick={handleError}>Try Operation</button>
 *       <button onClick={handleCustom}>Loading Toast</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useToast(): ToastAPI {
  const { api } = useToastContext();
  return api;
}

/**
 * Utilidad para manejo de errores con toasts automáticos.
 * Wrapper que automáticamente muestra toasts de error para excepciones.
 *
 * @param fn - Función async a ejecutar
 * @param options - Opciones para los toasts de éxito y error
 * @returns Función wrapped que maneja errores automáticamente
 *
 * @example
 * ```tsx
 * import { useToast, withToastError } from '@complete/react-toast';
 *
 * function ApiComponent() {
 *   const toast = useToast();
 *
 *   const handleSave = withToastError(
 *     async () => {
 *       await api.saveData(data);
 *       return 'Datos guardados correctamente';
 *     },
 *     {
 *       successMessage: (result) => result,
 *       errorMessage: (error) => `Error al guardar: ${error.message}`,
 *       loadingMessage: 'Guardando...'
 *     }
 *   );
 *
 *   return <button onClick={handleSave}>Guardar</button>;
 * }
 * ```
 */
export function useToastError() {
  const toast = useToast();

  return function withToastError<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      /** Mensaje de éxito (puede ser función que recibe el resultado) */
      successMessage?: string | ((result: R) => ReactNode);
      /** Mensaje de error (puede ser función que recibe el error) */
      errorMessage?: string | ((error: Error) => ReactNode);
      /** Mensaje durante la carga */
      loadingMessage?: ReactNode;
      /** Opciones adicionales para toast de éxito */
      successOptions?: Omit<ToastOptions, "type">;
      /** Opciones adicionales para toast de error */
      errorOptions?: Omit<ToastOptions, "type">;
      /** Opciones adicionales para toast de carga */
      loadingOptions?: Omit<ToastOptions, "type">;
      /** Si mostrar toast de éxito al completar */
      showSuccess?: boolean;
      /** Si mostrar toast de error al fallar */
      showError?: boolean;
    } = {},
  ) {
    const {
      successMessage,
      errorMessage = "Ocurrió un error",
      loadingMessage,
      successOptions,
      errorOptions,
      loadingOptions,
      showSuccess = true,
      showError = true,
    } = options;

    return async (...args: T): Promise<R> => {
      let loadingId: string | undefined;

      try {
        // Mostrar toast de carga si está configurado
        if (loadingMessage) {
          loadingId = toast.loading(loadingMessage, {
            duration: 0,
            dismissible: false,
            ...loadingOptions,
          });
        }

        const result = await fn(...args);

        // Cerrar toast de carga
        if (loadingId) {
          toast.dismiss(loadingId);
        }

        // Mostrar toast de éxito
        if (showSuccess && successMessage) {
          const message = typeof successMessage === "function" ? successMessage(result) : successMessage;
          toast.success(message, successOptions);
        }

        return result;
      } catch (error) {
        // Cerrar toast de carga
        if (loadingId) {
          toast.dismiss(loadingId);
        }

        // Mostrar toast de error
        if (showError) {
          const message = typeof errorMessage === "function" ? errorMessage(error as Error) : errorMessage;
          toast.error(message, errorOptions);
        }

        throw error;
      }
    };
  };
}

/**
 * Hook para crear toasts con configuración predefinida.
 * Útil para casos donde necesitas toasts con la misma configuración repetidamente.
 *
 * @param defaultOptions - Opciones por defecto para todos los toasts
 * @returns API de toast con opciones predefinidas
 *
 * @example
 * ```tsx
 * function NotificationComponent() {
 *   const apiToast = useToastWithDefaults({
 *     position: 'bottom-left',
 *     variant: 'outlined',
 *     duration: 6000
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => apiToast.info('API notification')}>
 *         Show API Toast
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useToastWithDefaults(defaultOptions: Partial<ToastOptions> = {}): ToastAPI {
  const toast = useToast();

  return {
    success: (message, options) => toast.success(message, { ...defaultOptions, ...options }),
    error: (message, options) => toast.error(message, { ...defaultOptions, ...options }),
    warning: (message, options) => toast.warning(message, { ...defaultOptions, ...options }),
    info: (message, options) => toast.info(message, { ...defaultOptions, ...options }),
    loading: (message, options) => toast.loading(message, { ...defaultOptions, ...options }),
    custom: (message, options) => toast.custom(message, { ...defaultOptions, ...options }),
    dismiss: toast.dismiss,
    dismissAll: toast.dismissAll,
    update: toast.update,
    toasts: toast.toasts,
  };
}
