import { Suspense, lazy, useEffect, useState } from "react";
import { useStore } from "@/state/useStore";
import { MechButton } from "@/components/ui/MechButton";

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
      <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 sm:gap-4">
        <MechButton href="https://zenarena.ai">
          ZEN Arena
        </MechButton>
        <MechButton href="https://aipioneer.zen.ai">
          AI Pioneer Program
        </MechButton>
      </div>
    </div>
  );
};

export default Index;
