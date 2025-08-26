import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tipos de storage disponibles
 */
type Area = "local" | "session";

/**
 * Opciones para el hook useStorage
 */
export type UseStorageOptions<T> = {
  /** Tipo de storage a usar ('local' o 'session') */
  area?: Area;
  /** Si usar JSON.stringify/parse para serialización */
  json?: boolean;
  /** Tiempo de vida en milisegundos (TTL) */
  ttl?: number;
  /** Si sincronizar entre pestañas/ventanas */
  crossTab?: boolean;
  /** Función para migrar datos de versiones anteriores */
  migrate?: (raw: unknown) => T;
};

/**
 * Resultado del hook useStorage
 */
export type UseStorageResult<T> = [
  /** Valor actual del storage */
  T,
  /** Función para actualizar el valor */
  (value: T | ((current: T) => T)) => void,
  /** Función para eliminar el valor del storage */
  () => void,
];

/**
 * Verifica si estamos en un entorno de navegador
 */
const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Obtiene la instancia de storage según el área especificada
 */
function getStore(area: Area): Storage | null {
  if (!isBrowser()) return null;
  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch (error) {
    // Storage puede no estar disponible (ej: modo privado en Safari)
    console.warn(`${area}Storage no disponible:`, error);
    return null;
  }
}

/**
 * Estructura interna para almacenar datos con metadatos
 */
type Box = {
  /** Valor almacenado */
  v: unknown;
  /** Timestamp de expiración (opcional) */
  e?: number;
};

/**
 * Obtiene el timestamp actual en milisegundos
 */
function now(): number {
  return Date.now();
}

/**
 * Hook para sincronizar estado con localStorage o sessionStorage.
 * Incluye soporte para TTL, sincronización cross-tab y migración de datos.
 *
 * @param key - Clave única para el storage
 * @param initial - Valor inicial si no existe en el storage
 * @param opts - Opciones de configuración
 * @returns Una tupla con [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * import { useStorage } from '@complete/react-storage';
 *
 * function MyComponent() {
 *   const [count, setCount, removeCount] = useStorage('counter', 0, {
 *     ttl: 1000 * 60 * 60, // 1 hora
 *     crossTab: true
 *   });
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={() => setCount(c => c + 1)}>+</button>
 *       <button onClick={removeCount}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStorage<T>(key: string, initial: T, opts: UseStorageOptions<T> = {}): UseStorageResult<T> {
  const { area = "local", json = true, ttl, crossTab = true, migrate } = opts;
  const store = getStore(area);
  const readRef = useRef<() => T>(() => initial);

  /** Función para leer el valor actual del storage */
  const read = useCallback((): T => {
    if (!store) return initial;

    try {
      const raw = store.getItem(key);
      if (!raw) return initial;

      const box: Box = json ? JSON.parse(raw) : (raw as any);

      // Si es un objeto Box con metadatos
      if (box && typeof box === "object" && "v" in box) {
        // Verificar expiración (TTL)
        if (box.e && box.e < now()) {
          store.removeItem(key);
          return initial;
        }

        // Aplicar migración si está disponible
        const value = migrate ? migrate(box.v) : box.v;
        return (value as T) ?? initial;
      }

      // Datos legacy sin estructura Box
      const value = migrate ? migrate(raw) : (raw as unknown as T);
      return value ?? initial;
    } catch (error) {
      console.warn(`Error leyendo storage key "${key}":`, error);
      return initial;
    }
  }, [initial, json, key, migrate, store]);

  const [state, setState] = useState<T>(() => read());
  readRef.current = read;

  /** Función para escribir al storage */
  const write = useCallback(
    (value: T) => {
      if (!store) return;

      try {
        const box: Box = {
          v: value,
          e: ttl ? now() + ttl : undefined,
        };
        const serialized = json ? JSON.stringify(box) : (box as any);
        store.setItem(key, serialized);
      } catch (error) {
        console.warn(`Error escribiendo storage key "${key}":`, error);
      }
    },
    [json, key, store, ttl],
  );

  /** Función para actualizar el valor */
  const set = useCallback(
    (patch: T | ((current: T) => T)) => {
      setState((current) => {
        const next = typeof patch === "function" ? (patch as any)(current) : patch;
        write(next);
        return next;
      });
    },
    [write],
  );

  /** Función para eliminar el valor del storage */
  const remove = useCallback(() => {
    if (!store) return;

    try {
      store.removeItem(key);
      setState(initial);
    } catch (error) {
      console.warn(`Error eliminando storage key "${key}":`, error);
    }
  }, [initial, key, store]);

  // Efecto para sincronización cross-tab
  useEffect(() => {
    if (!crossTab || !isBrowser()) return;

    /** Manejador para eventos de storage cross-tab */
    const onStorage = (event: StorageEvent) => {
      // Solo reaccionar a cambios en nuestra clave específica
      if (event.key !== key) return;

      // Actualizar estado con el valor más reciente
      setState(readRef.current());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [crossTab, key]);

  return [state, set, remove];
}
