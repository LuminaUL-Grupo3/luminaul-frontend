import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "@/features/auth";
import { AppRoutes } from "@/routes";

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  );
}

// Re-exports for backward compatibility
export { Layout } from "@/components/layout";
