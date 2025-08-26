# complete-react-toast

[![npm](https://img.shields.io/npm/v/complete-react-toast?logo=npm)](https://www.npmjs.com/package/complete-react-toast) [![bundlephobia](https://img.shields.io/bundlephobia/minzip/complete-react-toast)](https://bundlephobia.com/package/complete-react-toast) ![types](https://img.shields.io/badge/types-included-blue) ![tree-shaking](https://img.shields.io/badge/tree--shaking-true-success)

Sistema de **toasts dinámico y versátil** para React. API funcional y declarativa, totalmente accesible y personalizable.

## 🚀 Instalación

```bash
npm install complete-react-toast
# o
pnpm add complete-react-toast
# o
yarn add complete-react-toast
```

## 📖 Uso básico

### 1. Configurar el Provider

```tsx
import { ToastProvider, Toaster } from 'complete-react-toast';

function App() {
  return (
    <ToastProvider>
      <MyApplication />
      <Toaster /> {/* Renderiza los toasts automáticamente */}
    </ToastProvider>
  );
}
```

### 2. Usar toasts en componentes

```tsx
import { useToast } from 'complete-react-toast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('¡Operación exitosa!');
  };

  const handleError = () => {
    toast.error('Algo salió mal', {
      duration: 5000,
      action: {
        label: 'Reintentar',
        onClick: () => console.log('Reintentando...')
      }
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Éxito</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

## 🔧 API

### `useToast()`

Hook principal que retorna la API completa:

```tsx
const toast = useToast();

// Tipos básicos
toast.success('Mensaje de éxito');
toast.error('Mensaje de error');
toast.warning('Mensaje de advertencia');
toast.info('Mensaje informativo');
toast.loading('Cargando...');

// Toast personalizado
toast.custom('Mensaje personalizado', {
  type: 'info',
  position: 'bottom-center',
  duration: 3000
});

// Gestión
toast.dismiss('toast-id');
toast.dismissAll();
toast.update('toast-id', 'Nuevo mensaje', { type: 'success' });
```

### Opciones de Toast

| Propiedad     | Tipo                  | Default       | Descripción                                   |
| ------------- | --------------------- | ------------- | --------------------------------------------- |
| `type`        | `ToastType`           | `"info"`      | Tipo de toast (success, error, warning, etc.) |
| `duration`    | `number`              | `4000`        | Duración en ms (0 = no auto-dismiss)          |
| `dismissible` | `boolean`             | `true`        | Si se puede cerrar manualmente                |
| `position`    | `ToastPosition`       | `"top-right"` | Posición en pantalla                          |
| `variant`     | `ToastVariant`        | `"filled"`    | Variante de estilo                            |
| `icon`        | `ReactNode`           | `auto`        | Icono personalizado                           |
| `action`      | `{ label, onClick }`  | `undefined`   | Botón de acción                               |
| `data`        | `Record<string, any>` | `undefined`   | Datos adicionales                             |
| `onClose`     | `() => void`          | `undefined`   | Callback al cerrar                            |

### Posiciones disponibles

```tsx
type ToastPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";
```

### Variantes de estilo

```tsx
type ToastVariant = "filled" | "outlined" | "minimal";
```

## 📋 Ejemplos avanzados

### Manejo de errores automático

```tsx
import { useToast, useToastError } from 'complete-react-toast';

function ApiComponent() {
  const toast = useToast();
  const withToastError = useToastError();

  // Método manual
  const handleSave = async () => {
    try {
      await api.saveData(data);
      toast.success('Datos guardados');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // Método automático con wrapper
  const handleSaveAuto = withToastError(
    async () => {
      await api.saveData(data);
      return 'Datos guardados correctamente';
    },
    {
      successMessage: (result) => result,
      errorMessage: (error) => `Error al guardar: ${error.message}`,
      loadingMessage: 'Guardando datos...'
    }
  );

  return (
    <div>
      <button onClick={handleSave}>Guardar (manual)</button>
      <button onClick={handleSaveAuto}>Guardar (automático)</button>
    </div>
  );
}
```

### Toast de progreso/loading

```tsx
function UploadComponent() {
  const toast = useToast();

  const handleUpload = async () => {
    const id = toast.loading('Subiendo archivo...', {
      duration: 0, // No auto-dismiss
      dismissible: false
    });

    try {
      // Simular progreso
      setTimeout(() => {
        toast.update(id, 'Procesando archivo...', {
          icon: '⚙️'
        });
      }, 1000);

      await uploadFile();

      toast.update(id, '¡Archivo subido exitosamente!', {
        type: 'success',
        duration: 3000,
        dismissible: true
      });
    } catch (error) {
      toast.update(id, `Error: ${error.message}`, {
        type: 'error',
        duration: 5000,
        dismissible: true
      });
    }
  };

  return <button onClick={handleUpload}>Subir archivo</button>;
}
```

### Configuración personalizada

```tsx
function CustomToastApp() {
  return (
    <ToastProvider
      config={{
        defaultPosition: 'bottom-center',
        defaultVariant: 'outlined',
        maxToasts: 3,
        defaultDuration: 6000,
        pauseOnHover: true,
        gap: 12,
        offset: { x: 20, y: 20 }
      }}
    >
      <App />
      <Toaster />
    </ToastProvider>
  );
}
```

### Toasts con configuración predefinida

```tsx
function NotificationComponent() {
  const apiToast = useToastWithDefaults({
    position: 'top-left',
    variant: 'minimal',
    duration: 8000
  });

  return (
    <button onClick={() => apiToast.info('Notificación de API')}>
      Toast personalizado
    </button>
  );
}
```

### Containers específicos

```tsx
function MultiPositionApp() {
  return (
    <ToastProvider>
      <App />

      {/* Containers individuales para control específico */}
      <ToastContainer position="top-right" className="notifications" />
      <ToastContainer position="bottom-center" className="alerts" />
    </ToastProvider>
  );
}
```

### Toast con JSX personalizado

```tsx
function CustomContentToast() {
  const toast = useToast();

  const showCustom = () => {
    toast.custom(
      <div>
        <strong>¡Nueva actualización!</strong>
        <p>La versión 2.0 está disponible</p>
      </div>,
      {
        duration: 0,
        action: {
          label: 'Actualizar',
          onClick: () => window.location.reload()
        },
        icon: '🎉'
      }
    );
  };

  return <button onClick={showCustom}>Mostrar actualización</button>;
}
```

## ✨ Características

- ✅ **API Dual**: Componentes y hooks funcionales
- ✅ **TypeScript**: Tipado completo y extensible
- ✅ **Accesible**: ARIA labels, roles y live regions
- ✅ **Animaciones**: Transiciones suaves CSS-in-JS
- ✅ **Sin dependencias**: CSS embebido, sin hojas de estilo externas
- ✅ **Configurable**: Posiciones, duraciones, límites, estilos
- ✅ **Performante**: Render optimizado y gestión de memoria
- ✅ **SSR Safe**: Compatible con Next.js, Gatsby, etc.
- ✅ **Tree-shakeable**: Solo importa lo que usas
- ✅ **Minimalista**: < 3KB gzipped

## 🎨 Personalización

### Estilos CSS personalizados

```tsx
// Los toasts usan estilos en línea, pero puedes sobrescribirlos
<ToastContainer
  className="my-custom-toasts"
  style={{
    // Estilos del container
  }}
/>
```

### Iconos personalizados

```tsx
const toast = useToast();

toast.success('¡Éxito!', {
  icon: <CustomSuccessIcon />
});

toast.error('Error', {
  icon: '🚨'
});
```

## 🌐 Compatibilidad

- React ≥18
- TypeScript ≥4.7
- Navegadores modernos (ES2020+)
- SSR/SSG compatible

## 🤝 Comparación con alternativas

| Característica       | complete-react-toast | react-hot-toast | react-toastify |
| -------------------- | -------------------- | --------------- | -------------- |
| Tamaño               | ~3KB                 | ~4KB            | ~8KB           |
| TypeScript nativo    | ✅                   | ✅              | ⚠️             |
| API funcional        | ✅                   | ✅              | ⚠️             |
| Sin dependencias CSS | ✅                   | ❌              | ❌             |
| Múltiples posiciones | ✅                   | ❌              | ✅             |
| Wrapper de errores   | ✅                   | ❌              | ❌             |
| Configuración global | ✅                   | ⚠️              | ✅             |

## 💡 Casos de uso

- 🔔 **Notificaciones**: Mensajes de sistema y usuario
- ⚠️ **Alertas**: Errores, advertencias y confirmaciones
- 📊 **Feedback**: Resultado de operaciones CRUD
- 🔄 **Loading**: Estados de carga y progreso
- 🎯 **Onboarding**: Guías y tips contextuales
- 📱 **Mobile-first**: Notificaciones responsivas
