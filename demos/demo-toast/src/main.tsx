import React from "react";
import ReactDOM from "react-dom/client";
import { ToastProvider, Toaster } from "@complete/react-toast";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider
      config={{
        maxToasts: 4,
        defaultDuration: 4000,
        pauseOnHover: true,
        pauseOnFocusLoss: true,
        gap: 12,
        offset: { x: 16, y: 16 },
      }}
    >
      <App />
      <Toaster />
    </ToastProvider>
  </React.StrictMode>,
);
