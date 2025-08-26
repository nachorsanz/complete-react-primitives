# @complete/react-storage

[![npm](https://img.shields.io/npm/v/@complete/react-storage?logo=npm)](https://www.npmjs.com/package/@complete/react-storage) [![bundlephobia](https://img.shields.io/bundlephobia/minzip/%40complete%2Freact-storage)](https://bundlephobia.com/package/%40complete%2Freact-storage) ![types](https://img.shields.io/badge/types-included-blue) ![tree-shaking](https://img.shields.io/badge/tree--shaking-true-success)

Hook para **sincronizar estado con localStorage / sessionStorage** (TTL, cross‑tab).

## 🚀 Instalación

```bash
npm install @complete/react-storage
# o
pnpm add @complete/react-storage
# o
yarn add @complete/react-storage
```

## 📖 Uso básico

```tsx
import { useStorage } from '@complete/react-storage';

function MyComponent() {
  const [count, setCount, removeCount] = useStorage('counter', 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <button onClick={removeCount}>Reset</button>
    </div>
  );
}
```

## 🔧 API

### `useStorage(key, initial, options?)`

Retorna una tupla `[value, setValue, removeValue]`:

- **`value`**: Valor actual del storage
- **`setValue`**: Función para actualizar el valor (acepta función callback)
- **`removeValue`**: Función para eliminar del storage y resetear al valor inicial

### Parámetros

| Parámetro | Tipo                   | Descripción                           |
| --------- | ---------------------- | ------------------------------------- |
| `key`     | `string`               | Clave única para el storage           |
| `initial` | `T`                    | Valor inicial si no existe en storage |
| `options` | `UseStorageOptions<T>` | Opciones de configuración             |

### Opciones

| Propiedad  | Tipo                   | Default     | Descripción                    |
| ---------- | ---------------------- | ----------- | ------------------------------ |
| `area`     | `"local" \| "session"` | `"local"`   | Tipo de storage a usar         |
| `json`     | `boolean`              | `true`      | Si usar JSON.stringify/parse   |
| `ttl`      | `number`               | `undefined` | Tiempo de vida en milisegundos |
| `crossTab` | `boolean`              | `true`      | Sincronización entre pestañas  |
| `migrate`  | `(raw: unknown) => T`  | `undefined` | Función de migración de datos  |

## 📋 Ejemplos

### Con TTL (Time To Live)

```tsx
const [token, setToken, clearToken] = useStorage('auth-token', null, {
  ttl: 1000 * 60 * 60 * 24, // 24 horas
  area: 'session'
});

// El token se elimina automáticamente después de 24 horas
```

### Datos complejos

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser, clearUser] = useStorage<User | null>('user', null, {
  crossTab: true,
  area: 'local'
});

// Actualizar usuario
setUser(current => current ? { ...current, name: 'Nuevo nombre' } : null);
```

### Con migración de datos

```tsx
const [settings, setSettings] = useStorage('app-settings', { theme: 'light' }, {
  migrate: (raw) => {
    // Migrar datos de versiones anteriores
    if (typeof raw === 'string') {
      return { theme: raw }; // v1 solo guardaba el tema como string
    }
    return raw as any;
  }
});
```

### SessionStorage sin JSON

```tsx
const [sessionId, setSessionId] = useStorage('session', '', {
  area: 'session',
  json: false, // Almacenar como string plano
  crossTab: false
});
```

### Configuración avanzada

```tsx
const [cache, setCache, clearCache] = useStorage('api-cache', {}, {
  area: 'local',
  ttl: 1000 * 60 * 5, // 5 minutos
  crossTab: true,
  migrate: (raw) => {
    // Limpiar cache legacy
    if (!raw || typeof raw !== 'object') return {};
    return raw;
  }
});
```

## ✨ Características

- ✅ **SSR Safe**: Funciona en servidor sin errores
- ✅ **TypeScript**: Tipado completo incluido
- ✅ **TTL Support**: Expiración automática de datos
- ✅ **Cross-tab**: Sincronización entre pestañas/ventanas
- ✅ **Migration**: Función para migrar datos legacy
- ✅ **Error Handling**: Manejo robusto de errores
- ✅ **Fallback**: Funciona sin storage disponible
- ✅ **Tree-shakeable**: Solo importa lo que usas
- ✅ **Minimalista**: < 2KB gzipped

## 🌐 Compatibilidad

- React ≥18
- Navegadores con localStorage/sessionStorage
- Fallback automático cuando storage no está disponible
- Compatible con modo privado de Safari

## 💡 Casos de uso

- 🔐 **Autenticación**: Tokens con expiración automática
- ⚙️ **Configuración**: Preferencias de usuario persistentes
- 📊 **Cache**: Datos de API con TTL
- 🎨 **Temas**: Dark/light mode sincronizado
- 📝 **Formularios**: Guardar borrador automáticamente
- 🛒 **Carrito**: E-commerce state persistence
