# Complete React Primitives

[![Build Status](https://img.shields.io/github/actions/workflow/status/nachorsanz/complete-react-primitives/ci.yml?branch=main&logo=github)](https://github.com/nachorsanz/complete-react-primitives/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![types](https://img.shields.io/badge/types-included-blue)
![tree-shaking](https://img.shields.io/badge/tree--shaking-true-success)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)

🚀 **Primitivas React headless, ultra-ligeras y completamente tipadas**

Colección de hooks y componentes **sin dependencias** diseñados para resolver problemas comunes en aplicaciones React modernas. Cada package está optimizado para **performance**, **bundle size** y **developer experience**.

## ✨ Características principales

- 🪶 **Ultra-ligeros**: <3KB cada package (gzipped)
- 🎯 **Headless**: Sin estilos predefinidos, máxima personalización
- 📦 **Tree-shakable**: Solo importa lo que usas
- 🛡️ **Type-safe**: 100% TypeScript con tipos completos
- ⚡ **SSR-ready**: Compatible con Next.js, Remix, etc.
- 🔋 **Sin dependencias**: No añaden peso extra a tu bundle
- 🎨 **API consistente**: Mismo patrón de uso en todos los packages

## 📦 Packages disponibles

| Package                                                  | Descripción                                         | Tamaño  | npm                                                                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [`complete-react-url-state`](./packages/react-url-state) | Estado sincronizado con la URL (querystring)        | <2 kB   | [![npm](https://img.shields.io/npm/v/complete-react-url-state?logo=npm&color=red)](https://www.npmjs.com/package/complete-react-url-state) |
| [`complete-react-storage`](./packages/react-storage)     | Estado sincronizado con localStorage/sessionStorage | <1.5 kB | [![npm](https://img.shields.io/npm/v/complete-react-storage?logo=npm&color=red)](https://www.npmjs.com/package/complete-react-storage)     |
| [`complete-react-intersect`](./packages/react-intersect) | Hook IntersectionObserver simple y optimizado       | <1 kB   | [![npm](https://img.shields.io/npm/v/complete-react-intersect?logo=npm&color=red)](https://www.npmjs.com/package/complete-react-intersect) |
| [`complete-react-toast`](./packages/react-toast)         | Sistema de toasts dinámico y accesible              | <3 kB   | [![npm](https://img.shields.io/npm/v/complete-react-toast?logo=npm&color=red)](https://www.npmjs.com/package/complete-react-toast)         |

## 🚀 Instalación rápida

Cada package se puede instalar independientemente:

```bash
# Estado en URL
npm install complete-react-url-state

# Persistencia en storage
npm install complete-react-storage

# Intersection Observer
npm install complete-react-intersect

# Sistema de toasts
npm install complete-react-toast
```

## 💡 Ejemplos de uso

### 🔗 URL State - Filtros de búsqueda

```tsx
import { useUrlState } from 'complete-react-url-state';

function SearchPage() {
  const [filters, setFilters] = useUrlState({
    q: '',
    category: 'all',
    page: 1
  });

  return (
    <div>
      <input
        value={filters.q}
        onChange={(e) => setFilters({ q: e.target.value, page: 1 })}
        placeholder="Buscar..."
      />
      {/* URL se actualiza automáticamente: ?q=react&category=all&page=1 */}
    </div>
  );
}
```

### 💾 Storage - Configuración persistente

```tsx
import { useStorage } from 'complete-react-storage';

function UserSettings() {
  const [theme, setTheme] = useStorage('theme', 'light', {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 días
    crossTab: true // Sincroniza entre pestañas
  });

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Tema: {theme}
    </button>
  );
}
```

### 👁️ Intersection - Lazy loading

```tsx
import { useInView } from 'complete-react-intersect';

function LazyImage({ src, alt }) {
  const [ref, inView] = useInView({ once: true });

  return (
    <div ref={ref}>
      {inView ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="skeleton" />
      )}
    </div>
  );
}
```

### 🍞 Toast - Notificaciones

```tsx
import { ToastProvider, useToast } from 'complete-react-toast';

function App() {
  return (
    <ToastProvider>
      <MyComponent />
    </ToastProvider>
  );
}

function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('¡Guardado exitosamente!');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  return <button onClick={handleSave}>Guardar</button>;
}
```

## 🎯 ¿Por qué Complete React Primitives?

### 📊 Comparación con alternativas

| Característica | Complete React   | Otras librerías     |
| -------------- | ---------------- | ------------------- |
| Bundle size    | <3KB por package | 5-15KB típico       |
| Dependencies   | ❌ Zero deps     | ⚠️ Múltiples deps   |
| TypeScript     | ✅ Nativo        | ⚠️ Tipos opcionales |
| Tree-shaking   | ✅ Completo      | ⚠️ Parcial          |
| SSR Support    | ✅ First-class   | ⚠️ Problemático     |
| API Design     | ✅ Consistente   | ⚠️ Fragmentado      |

### 🎨 Filosofía de diseño

- **Simplicidad**: APIs intuitivas que siguen las convenciones de React
- **Composabilidad**: Cada hook hace una cosa y la hace bien
- **Performance**: Optimizaciones internas para minimizar re-renders
- **Flexibilidad**: Headless por defecto, personalizable al 100%

## 🛠️ Desarrollo

### Configuración del monorepo

```bash
# Instalar dependencias
pnpm install

# Build todos los packages
pnpm -r build

# Ejecutar tests
pnpm -r test

# Ejecutar tests en modo watch
pnpm -r test:watch

# Linting
pnpm -r lint
```

### Estructura del proyecto

```
packages/
├── react-url-state/     # Sincronización con URL
├── react-storage/       # Persistencia en storage
├── react-intersect/     # Intersection Observer
└── react-toast/         # Sistema de toasts

demos/                   # Ejemplos de uso
├── demo-url-state/
├── demo-storage/
├── demo-intersect/
└── demo-toast/
```

## 🔗 Recursos

- 📚 **Documentación completa**: Cada package incluye README detallado
- 🎮 **Demos interactivos**: Ejemplos funcionando en `/demos`
- 🐛 **Issues**: [GitHub Issues](https://github.com/nachorsanz/complete-react-primitives/issues)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/nachorsanz/complete-react-primitives/discussions)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una branch feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guidelines

- Añade tests para nuevas funcionalidades
- Mantén la cobertura de tests >90%
- Sigue las convenciones de TypeScript
- Actualiza la documentación correspondiente

## 📄 Licencia

MIT © [Nacho Rodríguez Sanz](https://github.com/nachorsanz)

## 🌟 ¿Te gusta el proyecto?

Si estos packages te son útiles, considera:

- ⭐ Dar una estrella al repositorio
- 🐛 Reportar bugs o sugerir mejoras
- 📢 Compartir con la comunidad
- 🤝 Contribuir con código

---

<div align="center">
  <strong>Hecho con ❤️ para la comunidad React</strong>
</div>
