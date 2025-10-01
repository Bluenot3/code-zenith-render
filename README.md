# ZEN 3D Code Generator

A production-ready web application that maps streaming, visibly-generated code onto interactive 3D geometry with rich materials, themes, and an autoplay tour mode.

![ZEN 3D Code Generator](https://img.shields.io/badge/Status-Production%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Three.js%20%7C%20TypeScript-blue)

## ✨ Features

### Core Functionality
- **Default Scene**: 3D "ZEN" text with streaming code texture
- **10 Geometry Types**: Text, Cube, Sphere, Torus, Cylinder, Plane, Pyramid, TorusKnot, Icosahedron, Dodecahedron
- **9 Material Presets**: Code, Glass, Hologram, Crystal, Water, Metal, Matte Ceramic, Neon Acrylic, Carbon Weave
- **10+ Theme Presets**: Dark, Light (with black code text), Neon, Cyberpunk, Crystal, Glass, Holo, Aqua, Dusk, Midnight, ZEN Brand

### Advanced Features
- **Streaming Code Texture**: Real-time typing animation with syntax highlighting
- **Interactive Click/Tap**: 
  - Click → Pulse animation + emissive flare
  - Double-click → Cycle materials
  - Shift+G → Cycle geometries
  - Alt+P → Pause/resume code stream
- **Glowing Particles**: GPU-instanced particle field with theme-aware colors
- **Autoplay Tour Mode**: Smooth transitions between configurations
- **LocalStorage Persistence**: Save and restore your defaults
- **Export Tools**: PNG snapshot, GLB export, JSON presets

### Multiple ZEN Fonts
10 impactful font families for 3D text:
- JetBrains Mono (code)
- Orbitron (tech)
- Anton (bold)
- Montserrat Black
- Saira Extra Condensed
- Bebas Neue
- Unbounded Black
- Exo 2 ExtraBold
- Russo One
- Audiowide

### Themes with Proper Contrast
All 11 themes optimized for readability:
- **Light Theme**: White scene, black code text (maximum contrast)
- **Dark Theme**: Deep tech black with cyan accents (default)
- **Neon**: Electric pink and purple vibes
- **Cyberpunk**: Yellow/magenta dystopian future
- **Crystal**: Ice blue refractive clarity
- **Glass**: Smooth blue glass morphism
- **Hologram**: Sci-fi holographic projection
- **Aqua**: Deep ocean cyan and teal
- **Dusk**: Warm sunset orange glow
- **Midnight**: Deep blue night sky
- **ZEN Brand**: Official cyan signature (#00FFD5)

## 🎮 Controls

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Pause code stream |
| `T` | Cycle themes |
| `G` | Cycle geometries |
| `M` | Cycle materials |
| `R` | Reset camera |
| `A` | Toggle autoplay tour |
| `Shift+G` | Cycle geometry (alternative) |
| `Alt+P` | Pause/resume stream (alternative) |

### Mouse/Touch
- **Click mesh**: Pulse + glow effect
- **Double-click mesh**: Cycle material
- **Drag**: Rotate camera (OrbitControls)
- **Scroll**: Zoom in/out

### Control Panel (Leva)
Collapsible panel with organized folders:
- **Geometry**: Type, text, font, size, depth, bevel, wireframe
- **Material**: Preset, roughness, metalness, tint, emissive gain
- **Code Stream**: Font size, type speed, scroll speed, syntax coloring, proof overlay
- **Theme**: Preset selector, save/reset defaults
- **Camera**: FOV, auto-rotate, speed, damping
- **Animation**: Spin, float, orbit, speed
- **Particles**: Enable, density, twinkle, drift, orbit mode
- **Post FX**: Bloom, strength, threshold
- **Autoplay Tour**: Enable, transition time, loop

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) to view in your browser.

### Build for Production
```bash
npm run build
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Engine**: Three.js via react-three-fiber + drei
- **State**: Zustand with persist middleware
- **Controls**: Leva (collapsible panel)
- **Styling**: TailwindCSS with custom design system
- **Validation**: Zod schemas
- **Build**: Vite

## 📁 Project Structure

```
src/
├── components/
│   ├── CanvasStage.tsx      # Main 3D canvas + R3F setup
│   ├── GeometrySwitcher.tsx # Geometry type renderer
│   ├── Particles.tsx         # GPU particle system
│   └── HUD.tsx               # FPS + info overlay
├── state/
│   └── useStore.ts           # Zustand store + persistence
├── utils/
│   ├── themes.ts             # Theme configurations
│   └── codeTexture.ts        # Offscreen canvas → texture
└── pages/
    └── Index.tsx             # Main page + Leva controls
```

## 🎨 Design System

All colors use HSL and are defined in `src/index.css`:
- **Primary**: ZEN cyan (#00FFD5)
- **Semantic tokens**: `--scene-bg`, `--code-text`, `--particle-glow`
- **Theme classes**: `.dark`, `.light`, `.neon`, etc.

Fonts loaded via Google Fonts CDN with display=swap for optimal loading.

## 🌟 Material Presets

Each material has unique characteristics:

1. **Code**: Emissive code map with token tints
2. **Glass**: High transmission, clearcoat, env map
3. **Hologram**: Fresnel rim, scanlines, chromatic offset
4. **Crystal**: High specular IOR, clearcoat
5. **Water**: Normal map ripples, refractive look
6. **Metal**: Metallic PBR workflow
7. **Matte Ceramic**: Low roughness, no metalness
8. **Neon Acrylic**: Glow + transparency
9. **Carbon Weave**: Textured, industrial

## 📊 Performance

- **60 FPS target** on mid-tier hardware
- GPU instancing for particles
- Texture caching and reuse
- Efficient state updates (Zustand)
- Tree-shaken R3F/drei imports

## 🔗 ZEN Brand Links

- [ZEN Arena](https://zenarena.ai) - Placeholder
- [AI Pioneer Program](https://aipioneer.zen.ai) - Placeholder

## 📝 Persistence

Settings auto-save to LocalStorage:
- Theme, geometry, material
- Code stream settings
- Camera, lighting, particles
- Animation preferences

**Controls:**
- "Set as Default" button: Save current state
- "Reset to Factory" button: Restore baseline

## 🎥 Autoplay Tour

Autoplay smoothly cycles through:
- Geometries
- Materials  
- Themes
- Camera positions
- Code parameters

**Configurable:**
- Transition time (5-30s)
- Properties to cycle
- Loop on/off
- Order: curated vs random

## 📤 Export

- **Snapshot PNG**: Current viewport render
- **Export GLB**: 3D model with embedded textures
- **Save Preset JSON**: Full configuration (Zod validated)
- **Load Preset JSON**: Restore saved settings

## 🐛 Troubleshooting

### Text not rendering?
Ensure `/fonts/helvetiker_regular.typeface.json` is accessible in public folder.

### Code texture not updating?
Check browser console for canvas errors. Verify syntax highlighting is enabled.

### Low FPS?
- Reduce particle density
- Disable bloom
- Lower code texture resolution
- Switch to simpler geometries

### Light theme code not visible?
Verify `--code-text` CSS variable is `0 0% 0%` (black) in `.light` theme.

## 📄 License

MIT License - Built with Lovable

## 🙏 Credits

- Three.js community
- react-three-fiber ecosystem
- Leva for beautiful controls
- ZEN brand guidelines

---

**Built with ❤️ using Lovable**
