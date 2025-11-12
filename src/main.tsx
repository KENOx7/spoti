// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// YENİ: ThemeProvider-i burada import edirik
import { ThemeProvider } from "./context/theme-provider.tsx"; 

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* ThemeProvider-i App komponentinin xaricinə, 
      bura yerləşdirmək daha doğrudur.
    */}
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);