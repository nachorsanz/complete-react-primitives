import { RefCallback, useCallback, useEffect, useRef, useState } from "react";

/**
 * Opciones para el hook useInView.
 * Extiende IntersectionObserverInit con opciones adicionales.
 */
export type InViewOptions = IntersectionObserverInit & {
  /** Si es true, el observer se desconecta después de la primera intersección */
  once?: boolean;
};

/**
 * Resultado del hook useInView.
 */
export type UseInViewResult = [
  /** Ref callback para asignar al elemento a observar */
  RefCallback<Element>,
  /** Si el elemento está actualmente visible en el viewport */
  boolean,
  /** La entrada actual del IntersectionObserver (null si no hay) */
  IntersectionObserverEntry | null,
];

/**
 * Verifica si estamos en un entorno de navegador
 */
const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Hook para detectar cuando un elemento está visible en el viewport usando IntersectionObserver.
 *
 * @param options - Opciones del IntersectionObserver y configuración adicional
 * @returns Una tupla con [ref, inView, entry]
 *
 * @example
 * ```tsx
 * import { useInView } from '@complete/react-intersect';
 *
 * function MyComponent() {
 *   const [ref, inView, entry] = useInView({
 *     threshold: 0.5,
 *     once: true
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       {inView ? 'Visible!' : 'No visible'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInView(options: InViewOptions = {}): UseInViewResult {
  const { once = false, ...io } = options;
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [inView, setInView] = useState(false);
  const obsRef = useRef<IntersectionObserver | null>(null);

  /** Función para limpiar el observer actual */
  const cleanup = useCallback(() => {
    obsRef.current?.disconnect();
    obsRef.current = null;
  }, []);

  /** Ref callback que se asigna al elemento a observar */
  const ref: RefCallback<Element> = useCallback(
    (node) => {
      // Limpiar observer anterior
      cleanup();

      // No hacer nada si no estamos en el navegador o no hay nodo
      if (!isBrowser() || !node) return;

      // Verificar soporte para IntersectionObserver
      if ("IntersectionObserver" in window) {
        try {
          obsRef.current = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry) {
              setEntry(entry);
              setInView(entry.isIntersecting);

              // Si 'once' está activado y el elemento está visible, desconectar
              if (once && entry.isIntersecting) {
                cleanup();
              }
            }
          }, io);

          obsRef.current.observe(node);
        } catch (error) {
          // Fallback en caso de error al crear el observer
          console.warn("Error creando IntersectionObserver:", error);
          setInView(true);
        }
      } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        setInView(true);
      }
    },
    [cleanup, io, once],
  );

  useEffect(() => cleanup, [cleanup]);
  return [ref, inView, entry];
}
