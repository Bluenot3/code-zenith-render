
## Refined Liquid Glass Particles — Fine, Smooth, Performance-Safe

### Goal
Make all particles finer, more uniform in size, visually liquid-glass in quality, while adding elegant new ambient design detail — without increasing load time, without slowing the animation loop, and with full mobile adaptation.

---

### What's Wrong Now

- **Particle sizes are uneven** — the current size rolls (`0.4–2.2`) create a mix of fine and sloppy-large particles at inconsistent ratios, causing the "sloppy" look.
- **SoftPointsMaterial shader** — the current rim + core + glow combo is good but lacks the smooth internal refraction and surface tension that makes glass look liquid. The highlight is offset (gives a faceted feel, not liquid).
- **SpaceDust velocities are too varied** — fast particles look coarse and choppy. The range `1.5–2.5` z-velocity causes size/speed inconsistency that reads as glitchy.
- **CosmicFireflies** use a basic `pointsMaterial` (not the crystal shader), which looks inconsistent next to the rest.
- **No new design element** without touching load time.

---

### Changes Planned

#### 1. `src/components/materials/SoftPointsMaterial.tsx` — Liquid Glass Shader Rewrite

Replace the current fragment shader with a true **liquid glass** look:

- **Smooth radial gradient** with no harsh core boundary — the entire disc softly fades like a droplet of water.
- **Fresnel-style rim** — brightens at the edge exactly like light bending around a glass sphere.
- **Internal caustic ring** — a single thin bright ring 60–70% out from centre, simulating the internal refraction line of a glass bead.
- **Specular highlight** — one clean, sharp, small white spot at upper-left (like a light source reflecting off liquid glass). No multiple sparkles (which cause the sloppy look).
- **Colour bleed** — the particle colour gently shifts toward white at the specular point, like glass refracting.
- **Alpha shaped as a smooth lens** — not a flat disc; the alpha itself is shaped like a convex lens profile (`1 - dist^1.5`) so edges feather beautifully.
- **Remove** the `vSize` varying (unused in fragment shader, saves a register).
- Add `uTime` uniform driving a subtle shimmer in the caustic ring (adds life without flickering).

This is a GPU-side change only — zero CPU cost.

#### 2. `src/components/Particles.tsx` — Finer, Uniform, Smoother

- **Size distribution**: Remove the three-tier roll. Replace with a tight bell-curve range: `0.2 + Math.random() * 0.4` (max `0.6`). Every particle is small and fine, none blow up large.
- **SoftPointsMaterial props**: Reduce `baseSize` to `0.8` desktop / `0.5` mobile. Reduce `maxSize` to `5` desktop / `3` mobile. Reduce `attenuation` to `80` desktop / `55` mobile. This ensures particles stay fine as they approach camera.
- **Flow speed**: Lower `flowSpeed` multiplier from `2.5` to `1.4` — slower, calmer, more liquid feel.
- **Spread**: Tighten from 40 units to 30 units X/Y so particles feel more concentrated and atmospheric rather than scattered.

#### 3. `src/components/SpaceDust.tsx` — Finer Dust, Calmer Drift

- **Sizes**: All dust reduced to `0.15 + Math.random() * 0.25` (max `0.4`). Makes these feel like micro-particles and clearly distinguishable from the main particles.
- **Z velocity range**: Narrow from `1.5–2.5` to `0.8–1.3` — much smoother, consistent drift speed eliminates the "some fast, some slow" choppiness.
- **SoftPointsMaterial props**: `baseSize` → `0.6` desktop / `0.4` mobile. `maxSize` → `3` desktop / `2` mobile. `attenuation` → `70` desktop / `45` mobile. Extremely fine micro-dust.
- **Count**: Keep `1200` desktop / `200` mobile (no change — density is fine, it's the sizes that need fixing).

#### 4. `src/components/CosmicFireflies.tsx` — Switch to Crystal Shader

Currently uses a basic `pointsMaterial`. Swap to `SoftPointsMaterial` to match the liquid glass aesthetic of the rest. Also:
- Reduce sizes to `0.1 + Math.random() * 0.08` (very fine, like distant firefly sparks).
- SoftPointsMaterial: `baseSize=0.7`, `opacity=0.7`, `attenuation=60`, `maxSize=4` desktop; halved on mobile.
- This unifies the visual language of all particle types.

#### 5. New Ambient Detail: `src/components/LiquidRings.tsx` — Zero-Cost Atmospheric Rings

A new lightweight component using **instanced ring geometry** (not a particle system, so zero per-frame CPU particle loop):
- 3 large thin torus rings slowly rotating at different tilts in the deep background (Z: -30 to -50).
- `MeshBasicMaterial` with `AdditiveBlending`, transparent, very low opacity (~0.04–0.07).
- Colors match theme palette (ice blue, violet, mint).
- Rotation driven by `useFrame` with a single `group.rotation` update (1 line per ring per frame — negligible cost).
- Desktop only (inside the `!isMobile && backgroundEffectsReady` block in CanvasStage).
- Mobile excluded entirely.

This adds elegant depth and visual sophistication with near-zero performance cost.

---

### Files to Edit

| File | Change |
|---|---|
| `src/components/materials/SoftPointsMaterial.tsx` | Liquid glass fragment shader rewrite |
| `src/components/Particles.tsx` | Finer sizes, slower speed, tighter spread |
| `src/components/SpaceDust.tsx` | Much finer sizes, calmer velocity |
| `src/components/CosmicFireflies.tsx` | Switch to SoftPointsMaterial for unified look |
| `src/components/CanvasStage.tsx` | Add LiquidRings lazy import + render in background block |

### New File

| File | Purpose |
|---|---|
| `src/components/LiquidRings.tsx` | Desktop-only ambient rotating torus rings (near-zero cost) |

---

### Performance Guarantee

- No new particle loops on mobile.
- `LiquidRings` excluded on mobile and deferred 500ms behind `backgroundEffectsReady` gate.
- Shader change is GPU-only — no CPU impact.
- Particle count unchanged — only sizes and speeds adjusted.
- `CosmicFireflies` frame-skip (`% 2`) already in place and preserved.
- No new dependencies — uses existing Three.js primitives only.
