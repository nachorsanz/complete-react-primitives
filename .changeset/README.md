
# Changesets

Usa `pnpm changeset` para crear cambios y versionar paquetes. Flujo típico:

```bash
pnpm dlx changesets init        # (ya hecho)
pnpm changeset                  # crea un changeset (elige paquetes y tipo)
pnpm changeset version          # aplica versiones en package.json
pnpm -r build                   # build de todos
pnpm -r publish --access public # publica a npm (requiere NPM_TOKEN)
```
