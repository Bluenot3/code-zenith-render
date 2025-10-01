import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useStore } from '@/state/useStore';
import { PresetSchema, PresetExport } from '@/state/schema';

export const exportSnapshot = async (canvas: HTMLCanvasElement): Promise<void> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob');
        resolve();
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `zen-3d-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    });
  });
};

export const exportGLB = async (scene: THREE.Scene): Promise<void> => {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    
    exporter.parse(
      scene,
      (result) => {
        const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `zen-3d-${Date.now()}.glb`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      },
      (error) => {
        console.error('GLB export error:', error);
        reject(error);
      },
      { binary: true }
    );
  });
};

export const exportPreset = (): void => {
  const store = useStore.getState();
  
  const preset: PresetExport = {
    name: `ZEN Preset ${Date.now()}`,
    description: 'Custom ZEN 3D configuration',
    geometry: store.geometry,
    material: store.material,
    code: store.code,
    theme: store.theme,
    timestamp: new Date().toISOString(),
  };
  
  try {
    PresetSchema.parse(preset);
    
    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `zen-preset-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Preset validation error:', error);
  }
};

export const importPreset = (file: File): Promise<PresetExport | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const preset = PresetSchema.parse(json);
        
        const store = useStore.getState();
        store.setGeometry(preset.geometry);
        store.setMaterial(preset.material);
        store.setCode(preset.code);
        store.setTheme(preset.theme);
        
        resolve(preset);
      } catch (error) {
        console.error('Preset import error:', error);
        resolve(null);
      }
    };
    
    reader.readAsText(file);
  });
};