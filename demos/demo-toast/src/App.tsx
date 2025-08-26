import React, { useState } from "react";
import { useToast, useToastError, useToastWithDefaults } from "@complete/react-toast";

function App() {
  const toast = useToast();
  const withToastError = useToastError();
  const customToast = useToastWithDefaults({
    position: "bottom-left",
    variant: "outlined",
    duration: 6000,
  });

  const [counter, setCounter] = useState(0);

  // Funciones de ejemplo
  const simulateAsyncOperation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (Math.random() > 0.7) {
      throw new Error("Operación falló aleatoriamente");
    }
    return `Operación #${counter + 1} completada`;
  };

  const handleAsyncWithToast = withToastError(simulateAsyncOperation, {
    successMessage: (result) => result,
    errorMessage: (error) => `Error: ${error.message}`,
    loadingMessage: "Procesando...",
  });

  const handleProgressToast = async () => {
    const id = toast.loading("Iniciando proceso...", {
      duration: 0,
      dismissible: false,
    });

    // Paso 1
    setTimeout(() => {
      toast.update(id, "Descargando archivos...", { icon: "📥" });
    }, 1000);

    // Paso 2
    setTimeout(() => {
      toast.update(id, "Procesando datos...", { icon: "⚙️" });
    }, 2500);

    // Completado
    setTimeout(() => {
      toast.update(id, "¡Proceso completado exitosamente!", {
        type: "success",
        duration: 3000,
        dismissible: true,
        icon: "✅",
      });
    }, 4000);
  };

  const showCustomJSX = () => {
    toast.custom(
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <strong>🎉 ¡Nueva función disponible!</strong>
        <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Ahora puedes usar JSX personalizado en tus toasts</p>
      </div>,
      {
        duration: 0,
        action: {
          label: "Ver más",
          onClick: () => alert("¡Más información!"),
        },
        variant: "minimal",
        position: "top-center",
      },
    );
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>🍞 Demo @complete/react-toast</h1>
      <p>Librería completa de toasts para React con API funcional y declarativa.</p>

      <div style={{ display: "grid", gap: "20px", marginTop: "40px" }}>
        {/* Toasts básicos */}
        <section>
          <h2>📢 Toasts básicos</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => toast.success("¡Operación exitosa!")}>✅ Success</button>
            <button onClick={() => toast.error("Algo salió mal")}>❌ Error</button>
            <button onClick={() => toast.warning("Cuidado con esto")}>⚠️ Warning</button>
            <button onClick={() => toast.info("Información útil")}>ℹ️ Info</button>
            <button onClick={() => toast.loading("Cargando datos...")}>⏳ Loading</button>
          </div>
        </section>

        {/* Posiciones */}
        <section>
          <h2>📍 Posiciones</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <button onClick={() => toast.info("Top Left", { position: "top-left" })}>↖️ Top Left</button>
            <button onClick={() => toast.info("Top Center", { position: "top-center" })}>⬆️ Top Center</button>
            <button onClick={() => toast.info("Top Right", { position: "top-right" })}>↗️ Top Right</button>
            <button onClick={() => toast.info("Bottom Left", { position: "bottom-left" })}>↙️ Bottom Left</button>
            <button onClick={() => toast.info("Bottom Center", { position: "bottom-center" })}>⬇️ Bottom Center</button>
            <button onClick={() => toast.info("Bottom Right", { position: "bottom-right" })}>↘️ Bottom Right</button>
          </div>
        </section>

        {/* Variantes */}
        <section>
          <h2>🎨 Variantes de estilo</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => toast.success("Filled style", { variant: "filled" })}>🎨 Filled</button>
            <button onClick={() => toast.success("Outlined style", { variant: "outlined" })}>📦 Outlined</button>
            <button onClick={() => toast.success("Minimal style", { variant: "minimal" })}>✨ Minimal</button>
          </div>
        </section>

        {/* Características avanzadas */}
        <section>
          <h2>⚙️ Características avanzadas</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => toast.info("No se cierra automáticamente", { duration: 0 })}>
              ♾️ Sin auto-close
            </button>
            <button onClick={() => toast.warning("No se puede cerrar", { dismissible: false, duration: 3000 })}>
              🔒 No dismissible
            </button>
            <button
              onClick={() =>
                toast.success("Con acción", {
                  action: { label: "Hacer algo", onClick: () => alert("¡Acción ejecutada!") },
                })
              }
            >
              🎯 Con acción
            </button>
            <button onClick={showCustomJSX}>🧩 JSX personalizado</button>
          </div>
        </section>

        {/* Toast de progreso */}
        <section>
          <h2>📊 Toast de progreso</h2>
          <button onClick={handleProgressToast} style={{ padding: "12px 24px" }}>
            🚀 Simular proceso largo
          </button>
        </section>

        {/* Manejo de errores automático */}
        <section>
          <h2>🔄 Manejo automático de errores</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => {
                setCounter((c) => c + 1);
                handleAsyncWithToast();
              }}
            >
              🎲 Operación aleatoria (70% éxito)
            </button>
            <span>Intentos: {counter}</span>
          </div>
        </section>

        {/* Toasts con configuración personalizada */}
        <section>
          <h2>⚙️ Configuración personalizada</h2>
          <button onClick={() => customToast.info("Toast con configuración predefinida")}>
            🛠️ Toast personalizado
          </button>
        </section>

        {/* Control de toasts */}
        <section>
          <h2>🎛️ Control de toasts</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                for (let i = 0; i < 5; i++) {
                  toast.info(`Toast múltiple #${i + 1}`, {
                    duration: 8000,
                    position: i % 2 === 0 ? "top-right" : "bottom-right",
                  });
                }
              }}
            >
              📦 Crear 5 toasts
            </button>
            <button onClick={toast.dismissAll}>🧹 Cerrar todos</button>
          </div>
        </section>

        {/* Información */}
        <section
          style={{
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3>ℹ️ Información del demo</h3>
          <p>Este demo muestra las principales características del package @complete/react-toast:</p>
          <ul>
            <li>✅ API funcional con useToast()</li>
            <li>🎨 Múltiples posiciones y variantes</li>
            <li>⚙️ Configuración flexible</li>
            <li>🔄 Manejo automático de errores</li>
            <li>📊 Toasts de progreso dinámicos</li>
            <li>🧩 Contenido JSX personalizado</li>
            <li>🎯 Acciones y callbacks</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;
