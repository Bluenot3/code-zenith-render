import { Suspense, lazy, useEffect, useState } from "react";
import { useStore } from "@/state/useStore";

// Lazy load heavy components to reduce initial JS execution time
const CanvasStage = lazy(() =>
  import("@/components/CanvasStage").then((m) => ({ default: m.CanvasStage }))
);
const CodeSettings = lazy(() =>
  import("@/components/CodeSettings").then((m) => ({ default: m.CodeSettings }))
);
const AutoplayController = lazy(() =>
  import("@/components/AutoplayController").then((m) => ({
    default: m.AutoplayController,
  }))
);

// Leva (and its heavy useControls setup) is lazy-loaded only when user opens settings.
const LevaPanel = lazy(() =>
  import("@/components/LevaPanel").then((m) => ({ default: m.LevaPanel }))
);

const Index = () => {
  const store = useStore();
  const [levaHidden, setLevaHidden] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);

  // Defer Canvas initialization to improve TTI
  useEffect(() => {
    const initCanvas = () => setCanvasReady(true);

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(initCanvas, { timeout: 100 });
    } else {
      setTimeout(initCanvas, 100);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        // Pause handled in CanvasStage
      } else if (e.key.toLowerCase() === "t") {
        const themes: typeof store.theme.preset[] = [
          "dark",
          "light",
          "neon",
          "cyberpunk",
          "crystal",
          "glass",
          "holo",
          "aqua",
          "dusk",
          "midnight",
          "zen",
        ];
        const currentIndex = themes.indexOf(store.theme.preset);
        const nextIndex = (currentIndex + 1) % themes.length;
        store.setTheme({ preset: themes[nextIndex] });
      } else if (e.key.toLowerCase() === "g") {
        const geometries: typeof store.geometry.type[] = [
          "text",
          "cube",
          "sphere",
          "torus",
          "cylinder",
          "plane",
          "pyramid",
          "torusKnot",
          "icosahedron",
          "dodecahedron",
        ];
        const currentIndex = geometries.indexOf(store.geometry.type);
        const nextIndex = (currentIndex + 1) % geometries.length;
        store.setGeometry({ type: geometries[nextIndex] });
      } else if (e.key.toLowerCase() === "m") {
        const materials: typeof store.material.preset[] = [
          "code",
          "glass",
          "hologram",
          "crystal",
          "water",
          "metal",
          "matte",
          "neon",
          "carbon",
        ];
        const currentIndex = materials.indexOf(store.material.preset);
        const nextIndex = (currentIndex + 1) % materials.length;
        store.setMaterial({ preset: materials[nextIndex] });
      } else if (e.key.toLowerCase() === "r") {
        store.setCamera({ fov: 75 });
      } else if (e.key.toLowerCase() === "a") {
        store.setAutoplay({ enabled: !store.autoplay.enabled });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [store]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Lightweight placeholder shown immediately for fast TTI */}
      {!canvasReady && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#1a1a3e] to-[#0d0d1f] flex items-center justify-center">
          <div className="text-primary text-2xl font-bold animate-pulse">
            ZEN
          </div>
        </div>
      )}

      {/* Defer heavy components until page is interactive */}
      {canvasReady && (
        <>
          <Suspense fallback={null}>
            <CanvasStage />
            <CodeSettings
              onToggleLeva={() => setLevaHidden(!levaHidden)}
              levaHidden={levaHidden}
            />
            <AutoplayController />
          </Suspense>

          {!levaHidden && (
            <Suspense fallback={null}>
              <LevaPanel />
            </Suspense>
          )}
        </>
      )}

      {/* Footer - always visible for immediate interactivity */}
      <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 font-code text-xs">
        <div className="bg-card/80 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded border border-border flex flex-col sm:flex-row items-center gap-1 sm:gap-4">
          <a
            href="https://zenarena.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors text-[10px] sm:text-xs touch-manipulation"
          >
            ZEN Arena
          </a>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <a
            href="https://aipioneer.zen.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors text-[10px] sm:text-xs touch-manipulation"
          >
            AI Pioneer Program
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
