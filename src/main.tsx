import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { FeedbackProvider } from "./feedback";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FeedbackProvider>
      <App />
    </FeedbackProvider>
  </StrictMode>,
);
