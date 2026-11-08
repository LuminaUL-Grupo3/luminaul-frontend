import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { FeedbackProvider } from "./components/feedback";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FeedbackProvider>
      <App />
    </FeedbackProvider>
  </StrictMode>,
);

if ("serviceWorker" in navigator && !import.meta.env.DEV) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("[PWA] Service Worker registration failed:", err));
  });
}

