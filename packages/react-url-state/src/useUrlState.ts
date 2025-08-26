import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Modos de navegación disponibles
 */
type HistoryMode = "push" | "replace";

/**
 * Interfaz para serialización personalizada de estado a URL
 */
type Serializer<T> = {
  /** Convierte URLSearchParams a objeto de estado parcial */
  parse: (qs: URLSearchParams) => Partial<T>;
  /** Convierte estado a URLSearchParams */
  stringify: (state: T) => URLSearchParams;
};

/**
 * Opciones para el hook useUrlState
 */
export type UseUrlStateOptions<T> = {
  /** Modo de navegación: 'push' crea nueva entrada, 'replace' reemplaza actual */
  history?: HistoryMode;
  /** Serializador personalizado para el estado */
  serializer?: Serializer<T>;
  /** Si usar comparación superficial para evitar actualizaciones innecesarias */
  shallowEqual?: boolean;
};

/**
 * Resultado del hook useUrlState
 */
export type UseUrlStateResult<T> = [
  /** Estado actual sincronizado con la URL */
  T,
  /** Función para actualizar el estado (parcial o función callback) */
  (next: Partial<T> | ((current: T) => Partial<T>)) => void,
];

/**
 * Serializador por defecto que maneja tipos básicos y JSON
 */
function defaultSerializer<T extends Record<string, any>>(initial: T): Serializer<T> {
  return {
    parse(qs) {
      const out: Record<string, any> = {};
      for (const key of Object.keys(initial)) {
        const value = qs.get(key);
        if (value !== null) {
          out[key] = tryJSON(value);
        }
      }
      return out as Partial<T>;
    },
    stringify(state) {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(state)) {
        // Omitir valores vacíos o undefined
        if (value === undefined || value === null || value === "") continue;

        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        qs.set(key, serialized);
      }
      return qs;
    },
  };
}

/**
 * Intenta parsear JSON, retorna string original si falla
 */
function tryJSON(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Verifica si estamos en un entorno de navegador
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Comparación superficial de objetos
 */
function shallowEq(a: any, b: any): boolean {
  if (a === b) return true;

  const keysA = Object.keys(a ?? {});
  const keysB = Object.keys(b ?? {});

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

/**
 * Hook para sincronizar estado con la URL query string.
 * Permite mantener estado en la URL para bookmarks, sharing y navegación.
 *
 * @param initial - Estado inicial con todas las claves
 * @param opts - Opciones de configuración
 * @returns Una tupla con [state, setState]
 *
 * @example
 * ```tsx
 * import { useUrlState } from 'complete-react-url-state';
 *
 * function SearchPage() {
 *   const [filters, setFilters] = useUrlState({
 *     q: '',
 *     page: 1,
 *     category: 'all'
 *   }, {
 *     history: 'push',
 *     shallowEqual: true
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         value={filters.q}
 *         onChange={(e) => setFilters({ q: e.target.value, page: 1 })}
 *       />
 *       <p>Página: {filters.page}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUrlState<T extends Record<string, any>>(
  initial: T,
  opts: UseUrlStateOptions<T> = {},
): UseUrlStateResult<T> {
  const { history = "replace", serializer, shallowEqual: se = true } = opts;
  const ser = useMemo(() => serializer ?? defaultSerializer(initial), [serializer]);

  /** Función para leer el estado actual desde la URL */
  const getFromLocation = useCallback((): T => {
    if (!isBrowser()) return initial;

    try {
      const current = ser.parse(new URLSearchParams(window.location.search));
      return { ...initial, ...current } as T;
    } catch (error) {
      console.warn("Error parseando estado de URL:", error);
      return initial;
    }
  }, [initial, ser]);

  const [state, setState] = useState<T>(() => getFromLocation());
  /** Ref para evitar actualizaciones de URL duplicadas */
  const lastQS = useRef<string>("");

  /** Función para escribir estado a la URL */
  const write = useCallback(
    (next: T) => {
      if (!isBrowser()) return;

      try {
        const qs = ser.stringify(next).toString();
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        const url = qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`;

        // Solo actualizar si el query string cambió
        if (qs !== lastQS.current) {
          lastQS.current = qs;
          const method = history === "push" ? window.history.pushState : window.history.replaceState;
          method.call(window.history, null, "", url);
        }
      } catch (error) {
        console.warn("Error escribiendo estado a URL:", error);
      }
    },
    [history, ser],
  );

  /** Función para actualizar el estado */
  const set = useCallback(
    (patch: Partial<T> | ((current: T) => Partial<T>)) => {
      setState((current) => {
        const delta = typeof patch === "function" ? (patch as any)(current) : patch;
        const next = { ...current, ...delta } as T;

        // Solo escribir a URL si hay cambios (shallow equality check)
        if (!se || !shallowEq(current, next)) {
          write(next);
        }

        return next;
      });
    },
    [se, write],
  );

  // Efecto para escuchar cambios de navegación (back/forward)
  useEffect(() => {
    if (!isBrowser()) return;

    /** Manejador para eventos de navegación del navegador */
    const onPop = () => {
      const next = getFromLocation();
      setState((current) => {
        // Solo actualizar si hay cambios reales (shallow equality check)
        return se && shallowEq(current, next) ? current : next;
      });
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [getFromLocation, se]);

  return [state, set];
}
