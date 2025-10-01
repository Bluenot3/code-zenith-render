import { z } from 'zod';

export const GeometrySchema = z.object({
  type: z.enum(['text', 'cube', 'sphere', 'torus', 'cylinder', 'plane', 'pyramid', 'torusKnot', 'icosahedron', 'dodecahedron']),
  text: z.string(),
  fontFamily: z.enum(['JetBrains Mono', 'Orbitron', 'Anton', 'Montserrat', 'Saira Extra Condensed', 'Bebas Neue', 'Unbounded', 'Exo 2', 'Russo One', 'Audiowide']),
  fontWeight: z.number().min(100).max(900),
  size: z.number().min(0.1).max(10),
  depth: z.number().min(0.1).max(2),
  bevel: z.boolean(),
  curveSegments: z.number().min(1).max(50),
  letterSpacing: z.number(),
  wordSpacing: z.number(),
  wireframe: z.boolean(),
});

export const MaterialSchema = z.object({
  preset: z.enum(['code', 'glass', 'hologram', 'crystal', 'water', 'metal', 'matte', 'neon', 'carbon']),
  roughness: z.number().min(0).max(1),
  metalness: z.number().min(0).max(1),
  transmission: z.number().min(0).max(1),
  ior: z.number().min(1).max(3),
  clearcoat: z.number().min(0).max(1),
  tint: z.string(),
  fresnelPower: z.number().min(0).max(10),
  emissiveGain: z.number().min(0).max(5),
  normalStrength: z.number().min(0).max(5),
  scanlineDensity: z.number().min(1).max(100),
  neonGlow: z.number().min(0).max(5),
});

export const CodeSchema = z.object({
  inputText: z.string(),
  charSet: z.string(),
  fontFamily: z.string(),
  fontSize: z.number().min(6).max(48),
  lineHeight: z.number().min(1).max(3),
  inkColor: z.string(),
  bgMix: z.number().min(0).max(1),
  direction: z.enum(['down', 'right', 'spiral']),
  typeSpeed: z.number().min(1).max(500),
  scrollSpeed: z.number().min(0.1).max(10),
  syntaxColoring: z.boolean(),
  seed: z.number(),
  proofOverlay: z.boolean(),
});

export const ThemeSchema = z.object({
  preset: z.enum(['dark', 'light', 'neon', 'cyberpunk', 'crystal', 'glass', 'holo', 'aqua', 'dusk', 'midnight', 'zen']),
  background: z.string(),
  iblIntensity: z.number().min(0).max(5),
  uiContrast: z.number().min(0).max(2),
});

export const PresetSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  geometry: GeometrySchema,
  material: MaterialSchema,
  code: CodeSchema,
  theme: ThemeSchema,
  timestamp: z.string(),
});

export type PresetExport = z.infer<typeof PresetSchema>;