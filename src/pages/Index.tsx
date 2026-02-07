import { Suspense, lazy, useEffect, useState, useTransition, startTransition } from "react";
import { useStore } from "@/state/useStore";

// Lazy load heavy components with chunked imports to reduce main-thread blocking
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

// Yield to main thread to prevent long tasks
const yieldToMain = (): Promise<void> => {
  return new Promise((resolve) => {
    if ('scheduler' in window && 'yield' in (window as any).scheduler) {
      (window as any).scheduler.yield().then(resolve);
    } else {
      setTimeout(resolve, 0);
    }
  });
};

const Index = () => {
  const store = useStore();
  const [levaHidden, setLevaHidden] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [, startUITransition] = useTransition();

  // Staged initialization to break up main-thread work
  useEffect(() => {
    let mounted = true;
    
    const initializeStaged = async () => {
      // Stage 1: Wait for browser idle time before starting heavy work
      await new Promise<void>((resolve) => {
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback(() => resolve(), { timeout: 300 });
        } else {
          setTimeout(resolve, 150);
        }
      });
      
      if (!mounted) return;
      
      // Stage 2: Initialize canvas in a non-blocking transition
      await yieldToMain();
      if (!mounted) return;
      
      startTransition(() => {
        setCanvasReady(true);
      });
      
      // Stage 3: Delay UI controls to further reduce initial blocking
      await yieldToMain();
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      
      if (!mounted) return;
      startUITransition(() => {
        setUiReady(true);
      });
    };
    
    initializeStaged();
    
    return () => {
      mounted = false;
    };
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

      {/* Stage 1: Canvas loads first after idle */}
      {canvasReady && (
        <Suspense fallback={null}>
          <CanvasStage />
        </Suspense>
      )}
      
      {/* Stage 2: UI controls load after canvas is ready */}
      {uiReady && (
        <Suspense fallback={null}>
          <CodeSettings
            onToggleLeva={() => setLevaHidden(!levaHidden)}
            levaHidden={levaHidden}
          />
          <AutoplayController />
        </Suspense>
      )}

      {/* Stage 3: Leva only when explicitly requested */}
      {uiReady && !levaHidden && (
        <Suspense fallback={null}>
          <LevaPanel />
        </Suspense>
      )}

    </div>
  );
};

export default Index;
