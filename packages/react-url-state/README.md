# @complete/react-url-state

[![npm](https://img.shields.io/npm/v/@complete/react-url-state?logo=npm)](https://www.npmjs.com/package/@complete/react-url-state) [![bundlephobia](https://img.shields.io/bundlephobia/minzip/%40complete%2Freact-url-state)](https://bundlephobia.com/package/%40complete%2Freact-url-state) ![types](https://img.shields.io/badge/types-included-blue) ![tree-shaking](https://img.shields.io/badge/tree--shaking-true-success)

Hook para **sincronizar estado con la URL** (query string) en React.

## 🚀 Instalación

```bash
npm install @complete/react-url-state
# o
pnpm add @complete/react-url-state
# o
yarn add @complete/react-url-state
```

## 📖 Uso básico

```tsx
import { useUrlState } from "@complete/react-url-state";

function SearchPage() {
  const [filters, setFilters] = useUrlState({
    page: 1,
    q: "",
    category: "all"
  });

  return (
    <div>
      <input
        value={filters.q}
        onChange={(e) => setFilters({ q: e.target.value, page: 1 })}
        placeholder="Buscar..."
      />
      <p>Página: {filters.page} | Categoría: {filters.category}</p>
    </div>
  );
}
```

## 🔧 API

### `useUrlState(initial, options?)`

Retorna una tupla `[state, setState]`:

- **`state`**: Estado actual sincronizado con la URL
- **`setState`**: Función para actualizar el estado (acepta objeto parcial o función)

### Parámetros

| Parámetro | Tipo                    | Descripción                         |
| --------- | ----------------------- | ----------------------------------- |
| `initial` | `T`                     | Estado inicial con todas las claves |
| `options` | `UseUrlStateOptions<T>` | Opciones de configuración           |

### Opciones

| Propiedad      | Tipo                  | Default             | Descripción                                 |
| -------------- | --------------------- | ------------------- | ------------------------------------------- |
| `history`      | `"push" \| "replace"` | `"replace"`         | Modo de navegación del historial            |
| `serializer`   | `Serializer<T>`       | `defaultSerializer` | Serializador personalizado                  |
| `shallowEqual` | `boolean`             | `true`              | Comparación superficial para evitar renders |

## 📋 Ejemplos

### Filtros de búsqueda

```tsx
function ProductSearch() {
  const [filters, setFilters] = useUrlState({
    search: '',
    category: 'all',
    price: [0, 1000],
    sort: 'name'
  }, {
    history: 'push' // Crear entradas en historial
  });

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
      />

      <select
        value={filters.category}
        onChange={(e) => setFilters({ category: e.target.value })}
      >
        <option value="all">Todas</option>
        <option value="electronics">Electrónicos</option>
        <option value="clothing">Ropa</option>
      </select>

      {/* Reset de filtros */}
      <button onClick={() => setFilters({ search: '', category: 'all' })}>
        Limpiar filtros
      </button>
    </div>
  );
}
```

### Paginación

```tsx
function UserList() {
  const [pagination, setPagination] = useUrlState({
    page: 1,
    limit: 10,
    sort: 'created_at'
  });

  const nextPage = () => setPagination(p => ({ page: p.page + 1 }));
  const prevPage = () => setPagination(p => ({
    page: Math.max(1, p.page - 1)
  }));

  return (
    <div>
      <div>Página {pagination.page}</div>
      <button onClick={prevPage} disabled={pagination.page === 1}>
        Anterior
      </button>
      <button onClick={nextPage}>Siguiente</button>
    </div>
  );
}
```

### Modal con estado en URL

```tsx
function App() {
  const [ui, setUI] = useUrlState({
    modal: '',
    sidebar: false
  });

  return (
    <div>
      <button onClick={() => setUI({ modal: 'settings' })}>
        Configuración
      </button>

      {ui.modal === 'settings' && (
        <Modal onClose={() => setUI({ modal: '' })}>
          <h2>Configuración</h2>
        </Modal>
      )}
    </div>
  );
}
```

### Serializador personalizado

```tsx
// Para datos complejos o formatos específicos
const customSerializer = {
  parse: (qs: URLSearchParams) => ({
    tags: qs.get('tags')?.split(',').filter(Boolean) || [],
    date: qs.get('date') ? new Date(qs.get('date')!) : new Date()
  }),
  stringify: (state: any) => {
    const qs = new URLSearchParams();
    if (state.tags?.length) qs.set('tags', state.tags.join(','));
    if (state.date) qs.set('date', state.date.toISOString());
    return qs;
  }
};

function BlogPosts() {
  const [filters, setFilters] = useUrlState({
    tags: [] as string[],
    date: new Date()
  }, {
    serializer: customSerializer
  });
}
```

### Sin comparación superficial

```tsx
// Para estado complejo donde quieres forzar actualizaciones
const [state, setState] = useUrlState(initialState, {
  shallowEqual: false
});
```

## ✨ Características

- ✅ **SSR Safe**: Funciona en servidor sin errores
- ✅ **TypeScript**: Tipado completo incluido
- ✅ **History API**: Soporte completo para push/replace
- ✅ **Serialización**: JSON automático + serializador personalizable
- ✅ **Performance**: Comparación superficial para evitar renders
- ✅ **Navegación**: Respeta botones back/forward del navegador
- ✅ **Tree-shakeable**: Solo importa lo que usas
- ✅ **Minimalista**: < 1.5KB gzipped

## 🌐 Compatibilidad

- React ≥18
- Navegadores modernos con History API
- Funciona en SSR/SSG (Next.js, Gatsby, etc.)

## 💡 Casos de uso

- 🔍 **Búsqueda**: Filtros y queries compartibles
- 📄 **Paginación**: Estado de página en URL
- 🎛️ **Filtros**: E-commerce, dashboards
- 🪟 **Modales**: UI state compartible
- 📊 **Dashboards**: Configuración de gráficos
- 🎮 **Configuración**: Settings de aplicación

## 🤝 Comparación

| Característica | @complete/react-url-state | otros         |
| -------------- | ------------------------- | ------------- |
| Tamaño         | < 1.5KB                   | > 3KB         |
| TypeScript     | ✅ Nativo                 | ⚠️ Parcial    |
| SSR            | ✅ Safe                   | ❌ Problemas  |
| Serialización  | ✅ Flexible               | ⚠️ Limitada   |
| Performance    | ✅ Optimizado             | ⚠️ Re-renders |
