import { useState } from 'react';
import { useStore } from '@/state/useStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, X } from 'lucide-react';

export const CodeSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const code = useStore((state) => state.code);
  const setCode = useStore((state) => state.setCode);
  const particles = useStore((state) => state.particles);
  const setParticles = useStore((state) => state.setParticles);
  const geometry = useStore((state) => state.geometry);
  const setGeometry = useStore((state) => state.setGeometry);
  const material = useStore((state) => state.material);
  const setMaterial = useStore((state) => state.setMaterial);
  
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
        size="lg"
      >
        <Settings className="w-5 h-5" />
      </Button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Code Animation</h3>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Code Input</Label>
          <Textarea
            value={code.inputText}
            onChange={(e) => setCode({ inputText: e.target.value })}
            className="mt-1 font-mono text-xs"
            rows={4}
          />
        </div>
        
        <div>
          <Label>Font Family</Label>
          <Select value={code.fontFamily} onValueChange={(v) => setCode({ fontFamily: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
              <SelectItem value="Fira Code">Fira Code</SelectItem>
              <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
              <SelectItem value="Consolas">Consolas</SelectItem>
              <SelectItem value="Monaco">Monaco</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Font Size: {code.fontSize}px</Label>
          <Slider
            value={[code.fontSize]}
            onValueChange={([v]) => setCode({ fontSize: v })}
            min={6}
            max={48}
            step={1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Line Height: {code.lineHeight.toFixed(1)}</Label>
          <Slider
            value={[code.lineHeight]}
            onValueChange={([v]) => setCode({ lineHeight: v })}
            min={1}
            max={3}
            step={0.1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Type Speed: {code.typeSpeed}</Label>
          <Slider
            value={[code.typeSpeed]}
            onValueChange={([v]) => setCode({ typeSpeed: v })}
            min={1}
            max={500}
            step={10}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Scroll Speed: {code.scrollSpeed.toFixed(1)}</Label>
          <Slider
            value={[code.scrollSpeed]}
            onValueChange={([v]) => setCode({ scrollSpeed: v })}
            min={0.1}
            max={10}
            step={0.1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Background Mix: {(code.bgMix * 100).toFixed(0)}%</Label>
          <Slider
            value={[code.bgMix]}
            onValueChange={([v]) => setCode({ bgMix: v })}
            min={0}
            max={1}
            step={0.01}
            className="mt-2"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Syntax Coloring</Label>
          <Switch
            checked={code.syntaxColoring}
            onCheckedChange={(v) => setCode({ syntaxColoring: v })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Show Stats</Label>
          <Switch
            checked={code.proofOverlay}
            onCheckedChange={(v) => setCode({ proofOverlay: v })}
          />
        </div>
        
        <hr className="border-border" />
        
        <h4 className="font-semibold">Material & Geometry</h4>
        
        <div>
          <Label>Material Preset</Label>
          <Select value={material.preset} onValueChange={(v: any) => setMaterial({ preset: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="glass">Glass</SelectItem>
              <SelectItem value="hologram">Hologram</SelectItem>
              <SelectItem value="crystal">Crystal</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="metal">Metal</SelectItem>
              <SelectItem value="matte">Matte</SelectItem>
              <SelectItem value="neon">Neon</SelectItem>
              <SelectItem value="carbon">Carbon</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>3D Font Family</Label>
          <Select value={geometry.fontFamily} onValueChange={(v: any) => setGeometry({ fontFamily: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
              <SelectItem value="Orbitron">Orbitron</SelectItem>
              <SelectItem value="Anton">Anton</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
              <SelectItem value="Bebas Neue">Bebas Neue</SelectItem>
              <SelectItem value="Unbounded">Unbounded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <hr className="border-border" />
        
        <h4 className="font-semibold">Particles</h4>
        
        <div className="flex items-center justify-between">
          <Label>Enable Particles</Label>
          <Switch
            checked={particles.enabled}
            onCheckedChange={(v) => setParticles({ enabled: v })}
          />
        </div>
        
        <div>
          <Label>Drift Speed: {particles.driftSpeed.toFixed(1)}</Label>
          <Slider
            value={[particles.driftSpeed]}
            onValueChange={([v]) => setParticles({ driftSpeed: v })}
            min={0.1}
            max={2}
            step={0.1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Density: {particles.density}</Label>
          <Slider
            value={[particles.density]}
            onValueChange={([v]) => setParticles({ density: v })}
            min={100}
            max={2000}
            step={100}
            className="mt-2"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Orbit Mode</Label>
          <Switch
            checked={particles.orbitMode}
            onCheckedChange={(v) => setParticles({ orbitMode: v })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Twinkle</Label>
          <Switch
            checked={particles.twinkle}
            onCheckedChange={(v) => setParticles({ twinkle: v })}
          />
        </div>
        
        <hr className="border-border" />
        
        <h4 className="font-semibold">Autoplay Tour</h4>
        
        <div className="flex items-center justify-between">
          <Label>Enable Autoplay</Label>
          <Switch
            checked={useStore((state) => state.autoplay.enabled)}
            onCheckedChange={(v) => useStore.getState().setAutoplay({ enabled: v })}
          />
        </div>
        
        <div>
          <Label>Transition Time: {useStore((state) => state.autoplay.transitionTime)}s</Label>
          <Slider
            value={[useStore((state) => state.autoplay.transitionTime)]}
            onValueChange={([v]) => useStore.getState().setAutoplay({ transitionTime: v })}
            min={3}
            max={20}
            step={1}
            className="mt-2"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Loop</Label>
          <Switch
            checked={useStore((state) => state.autoplay.loop)}
            onCheckedChange={(v) => useStore.getState().setAutoplay({ loop: v })}
          />
        </div>
      </div>
    </div>
  );
};
