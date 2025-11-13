import * as THREE from 'three';

export class CodeTextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private lines: string[] = [];
  private currentLine = 0;
  private currentChar = 0;
  private scrollOffset = 0;
  private cursorBlink = 0;
  private lastUpdate = 0;
  private animationFrame: number | null = null;
  
  private config = {
    width: 2048,
    height: 2048,
    fontFamily: 'JetBrains Mono',
    fontSize: 20,
    lineHeight: 1.6,
    inkColor: '#FFFFFF',
    bgColor: '#000000',
    bgMix: 0.0,
    typeSpeed: 50,
    scrollSpeed: 1,
    syntaxColoring: true,
    direction: 'down' as 'down' | 'right' | 'spiral',
    generationStyle: 'standard' as 'standard' | 'dense' | 'sparse' | 'matrix' | 'minimal',
  };
  
  constructor(inputText: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.anisotropy = 16;
    this.texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = true;
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    
    this.setInputText(inputText);
    this.lastUpdate = Date.now();
    this.render(); // Initial render to make code immediately visible
    this.start();
  }
  
  setInputText(text: string) {
    const style = this.config.generationStyle;
    let processedText = text;
    
    // Apply DRAMATIC generation style transformations
    if (style === 'dense') {
      // Triple the lines, super compressed
      const lines = text.split('\n');
      processedText = lines.flatMap(line => [
        line,
        line.replace(/\s+/g, ''),
        line.toUpperCase()
      ]).join('\n');
    } else if (style === 'sparse') {
      // Triple spacing between lines
      processedText = text.split('\n').join('\n\n\n');
    } else if (style === 'matrix') {
      // Heavy glitch effect with random chars
      processedText = text.split('\n').flatMap(line => {
        const glitched = line.split('').map(char => 
          Math.random() > 0.7 ? String.fromCharCode(33 + Math.random() * 93) : char
        ).join('');
        return [line, glitched];
      }).join('\n');
    } else if (style === 'minimal') {
      // Only keep non-comment, non-empty lines
      processedText = text.split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('//') && trimmed !== '{' && trimmed !== '}';
        })
        .join('\n');
    }
    
    this.lines = processedText.split('\n');
    if (this.lines.length === 0) {
      this.lines = ['// Empty code'];
    }
  }
  
  updateConfig(config: Partial<typeof this.config>) {
    Object.assign(this.config, config);
  }
  
  private drawBackground() {
    // Pure black background for maximum contrast
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  private highlightSyntax(text: string): { text: string; color: string }[] {
    if (!this.config.syntaxColoring) {
      return [{ text, color: this.config.inkColor }];
    }
    
    const tokens: { text: string; color: string }[] = [];
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'while', 'for', 'async', 'await', 'export', 'import', 'class', 'extends', 'new', 'this', 'super'];
    const words = text.split(/(\s+|[{}()[\];,.])/);
    
    words.forEach(word => {
      if (keywords.includes(word)) {
        tokens.push({ text: word, color: '#FF80C0' }); // Bright keywords pink
      } else if (word.match(/^["'].*["']$/)) {
        tokens.push({ text: word, color: '#C0FFB0' }); // Bright strings green
      } else if (word.match(/^\/\/.*/)) {
        tokens.push({ text: word, color: '#A0C8FF' }); // Bright comments blue
      } else if (word.match(/^\d+$/)) {
        tokens.push({ text: word, color: '#FFBB80' }); // Bright numbers orange
      } else {
        tokens.push({ text: word, color: '#FFFFFF' }); // Pure white for maximum visibility
      }
    });
    
    return tokens;
  }
  
  private render() {
    const now = Date.now();
    const delta = Math.max(16, now - this.lastUpdate); // Ensure minimum delta
    this.lastUpdate = now;
    
    // Clear and draw background
    this.drawBackground();
    
    const { fontSize, lineHeight, fontFamily, typeSpeed, scrollSpeed, generationStyle } = this.config;
    
    // Adjust parameters based on generation style
    let adjustedFontSize = fontSize;
    let adjustedLineHeight = lineHeight;
    let adjustedTypeSpeed = typeSpeed;
    
    if (generationStyle === 'dense') {
      adjustedFontSize = fontSize * 0.6; // Much smaller
      adjustedLineHeight = lineHeight * 0.6; // Much tighter
      adjustedTypeSpeed = typeSpeed * 3; // Much faster
    } else if (generationStyle === 'sparse') {
      adjustedFontSize = fontSize * 1.5; // Much larger
      adjustedLineHeight = lineHeight * 2.5; // Much more spacing
      adjustedTypeSpeed = typeSpeed * 0.4; // Much slower
    } else if (generationStyle === 'matrix') {
      adjustedTypeSpeed = typeSpeed * 4; // Super fast
      adjustedLineHeight = lineHeight * 0.8;
    } else if (generationStyle === 'minimal') {
      adjustedFontSize = fontSize * 1.3;
      adjustedLineHeight = lineHeight * 1.6;
      adjustedTypeSpeed = typeSpeed * 0.6;
    }
    
    const lineHeightPx = adjustedFontSize * adjustedLineHeight;
    const maxLines = Math.floor(this.canvas.height / lineHeightPx);
    
    this.ctx.font = `${adjustedFontSize}px ${fontFamily}, monospace`;
    this.ctx.textBaseline = 'top';
    
    // Continuous scroll animation
    this.scrollOffset += (scrollSpeed / 10) * (delta / 16);
    if (this.scrollOffset > lineHeightPx) {
      this.scrollOffset = 0;
    }
    
    // Draw lines - ALWAYS show ALL text fully visible
    const startLine = Math.floor(this.scrollOffset / lineHeightPx);
    for (let i = 0; i < maxLines + 2; i++) {
      const lineIndex = (startLine + i) % this.lines.length;
      const y = i * lineHeightPx - (this.scrollOffset % lineHeightPx);
      
      if (y > this.canvas.height) break;
      if (y + lineHeightPx < 0) continue;
      
      const line = this.lines[lineIndex];
      
      // Syntax highlighting - ALWAYS show full line
      const tokens = this.highlightSyntax(line);
      let x = 10;
      
      tokens.forEach(token => {
        // Add subtle glow for better visibility
        this.ctx.shadowColor = token.color;
        this.ctx.shadowBlur = 3;
        this.ctx.fillStyle = token.color;
        this.ctx.fillText(token.text, x, y + 10);
        this.ctx.shadowBlur = 0;
        x += this.ctx.measureText(token.text).width;
      });
    }
    
    // CPS/LPS overlay (if enabled)
    if (this.config.syntaxColoring) {
      const cps = Math.round(typeSpeed / 16);
      const lps = scrollSpeed.toFixed(1);
      this.ctx.font = `10px ${fontFamily}, monospace`;
      this.ctx.fillStyle = this.config.inkColor;
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillText(`CPS: ${cps} | LPS: ${lps}`, 10, this.canvas.height - 20);
      this.ctx.globalAlpha = 1;
    }
    
    this.texture.needsUpdate = true;
  }
  
  start() {
    const animate = () => {
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.lastUpdate = Date.now();
    animate();
  }
  
  stop() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  getTexture() {
    return this.texture;
  }
  
  dispose() {
    this.stop();
    this.texture.dispose();
  }
}