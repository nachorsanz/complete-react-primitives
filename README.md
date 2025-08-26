# Complete React Primitives

![types](https://img.shields.io/badge/types-included-blue) ![tree-shaking](https://img.shields.io/badge/tree--shaking-true-success)

Primitivas **headless**, **ultra‑ligeras** y **tipadas** para React.

- ✅ ESM/CJS + types · `sideEffects:false`
- ✅ SSR‑safe · sin dependencias
- ✅ Foco en rendimiento y DX

## Paquetes

| Paquete | Descripción | Gzip aprox. |
|---|---|---|
| `@complete/react-url-state` | Estado sincronizado con la URL (querystring) | <2 kB |
| `@complete/react-storage`   | Estado sincronizado con local/sessionStorage (TTL, cross‑tab) | <1.5 kB |
| `@complete/react-intersect` | Hook `IntersectionObserver` simple (con `once`) | <1 kB |

## Monorepo

```bash
pnpm i
pnpm -r build
pnpm -r test
```

## Enlaces

- 🌐 Utils base: https://www.complete-js-utils.com
- GitHub (monorepo): https://github.com/nachorsanz/complete-react-primitives
