import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "@/features/auth";
import { AppRoutes } from "@/routes";
import { PwaInstallBanner } from "./components/pwa";

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
        <PwaInstallBanner />
      </SessionProvider>
    </BrowserRouter>
  );
}

// Re-exports for backward compatibility
export { Layout } from "@/components/layout";
