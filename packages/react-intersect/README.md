# @complete/react-intersect

[![npm](https://img.shields.io/npm/v/@complete/react-intersect?logo=npm)](https://www.npmjs.com/package/@complete/react-intersect) [![bundlephobia](https://img.shields.io/bundlephobia/minzip/%40complete%2Freact-intersect)](https://bundlephobia.com/package/%40complete%2Freact-intersect) ![types](https://img.shields.io/badge/types-included-blue) ![tree-shaking](https://img.shields.io/badge/tree--shaking-true-success)

Hook `IntersectionObserver` minimalista para saber si un elemento está **en viewport**.

## 🚀 Instalación

```bash
npm install @complete/react-intersect
# o
pnpm add @complete/react-intersect
# o
yarn add @complete/react-intersect
```

## 📖 Uso básico

```tsx
import { useInView } from '@complete/react-intersect';

function MyComponent() {
  const [ref, inView, entry] = useInView();

  return (
    <div ref={ref}>
      {inView ? '👀 Visible' : '🙈 No visible'}
    </div>
  );
}
```

## 🔧 API

### `useInView(options?)`

Retorna una tupla `[ref, inView, entry]`:

- **`ref`**: RefCallback para asignar al elemento a observar
- **`inView`**: boolean que indica si el elemento está visible
- **`entry`**: IntersectionObserverEntry actual (o null)

### Opciones

| Propiedad    | Tipo                 | Default | Descripción                                                  |
| ------------ | -------------------- | ------- | ------------------------------------------------------------ |
| `once`       | `boolean`            | `false` | Si es true, se desconecta después de la primera intersección |
| `threshold`  | `number \| number[]` | `0`     | Umbral de visibilidad (0-1)                                  |
| `rootMargin` | `string`             | `"0px"` | Margen del área raíz                                         |
| `root`       | `Element \| null`    | `null`  | Elemento raíz (null = viewport)                              |

## 📋 Ejemplos

### Trigger único

```tsx
const [ref, inView] = useInView({ once: true });

return (
  <div ref={ref}>
    {inView && <img src="image.jpg" alt="Lazy loaded" />}
  </div>
);
```

### Umbral personalizado

```tsx
const [ref, inView] = useInView({
  threshold: 0.5  // 50% visible
});

return (
  <div ref={ref} className={inView ? 'animate-in' : 'animate-out'}>
    Contenido
  </div>
);
```

### Múltiples umbrales

```tsx
const [ref, inView, entry] = useInView({
  threshold: [0, 0.25, 0.5, 0.75, 1]
});

const percentage = entry ? Math.round(entry.intersectionRatio * 100) : 0;

return (
  <div ref={ref}>
    Visible al {percentage}%
  </div>
);
```

### Margen personalizado

```tsx
const [ref, inView] = useInView({
  rootMargin: '100px'  // Trigger 100px antes
});
```

## ✨ Características

- ✅ **SSR Safe**: Funciona en servidor sin errores
- ✅ **TypeScript**: Tipado completo incluido
- ✅ **Minimalista**: < 1KB gzipped
- ✅ **Tree-shakeable**: Solo importa lo que usas
- ✅ **Fallback**: Funciona en navegadores sin IntersectionObserver
- ✅ **Cleanup automático**: Limpia observers al desmontar

## 🌐 Compatibilidad

- React ≥18
- Navegadores modernos con IntersectionObserver
- Fallback automático para navegadores sin soporte
