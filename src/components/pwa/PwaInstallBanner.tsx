import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"chromium" | "ios" | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // 1. Si ya se ejecuta en modo standalone (instalada), no mostrar nada
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Si el usuario cerró el banner recientemente (menos de 7 días), no insistir
    const dismissedAt = localStorage.getItem("luminaul_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        return;
      }
    }

    // 3. Detección de Android / Chromium (soporta beforeinstallprompt)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("chromium");
      setDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Detección de iOS Safari (Apple no soporta beforeinstallprompt)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = ua.includes("safari") && !ua.includes("crios") && !ua.includes("fxios");

    if (isIos && isSafari && !isStandalone) {
      setPlatform("ios");
      setDismissed(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("luminaul_pwa_dismissed", String(Date.now()));
    setDismissed(true);
  };

  if (dismissed || !platform) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Instalar LuminaUL"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "440px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "14px 16px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e9ebef",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      <img
        src="/icons/icon-192.png"
        alt="LuminaUL Logo"
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          flexShrink: 0,
          objectFit: "cover",
          boxShadow: "0 2px 6px rgba(230, 83, 35, 0.3)",
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1f26", lineHeight: 1.2 }}>
          Instala LuminaUL
        </div>
        {platform === "chromium" ? (
          <div style={{ fontSize: "12px", color: "#667085", marginTop: "2px" }}>
            Acceso rápido sin abrir navegador
          </div>
        ) : (
          <div
            style={{
              fontSize: "12px",
              color: "#667085",
              marginTop: "2px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexWrap: "wrap",
            }}
          >
            Toca <Share size={13} style={{ display: "inline" }} /> y luego{" "}
            <strong>"Añadir a inicio"</strong>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        {platform === "chromium" && (
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              backgroundColor: "#e85b1f",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Download size={14} />
            Instalar
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar sugerencia de instalación"
          style={{
            background: "none",
            border: "none",
            color: "#98a2b3",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
