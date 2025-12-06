import React, { useMemo } from 'react';

const ChristmasLights: React.FC = () => {
  // Generate lights for each edge
  const lights = useMemo(() => {
    const colors = ['#ff0000', '#00ff00', '#ffcc00', '#0099ff', '#ff66cc', '#ffffff'];
    const allLights: { x: number; y: number; color: string; delay: number }[] = [];
    
    // Top edge
    for (let i = 0; i < 30; i++) {
      allLights.push({
        x: (i / 29) * 100,
        y: 0,
        color: colors[i % colors.length],
        delay: i * 0.15
      });
    }
    
    // Right edge
    for (let i = 0; i < 20; i++) {
      allLights.push({
        x: 100,
        y: (i / 19) * 100,
        color: colors[(i + 2) % colors.length],
        delay: (30 + i) * 0.15
      });
    }
    
    // Bottom edge
    for (let i = 0; i < 30; i++) {
      allLights.push({
        x: 100 - (i / 29) * 100,
        y: 100,
        color: colors[(i + 4) % colors.length],
        delay: (50 + i) * 0.15
      });
    }
    
    // Left edge
    for (let i = 0; i < 20; i++) {
      allLights.push({
        x: 0,
        y: 100 - (i / 19) * 100,
        color: colors[i % colors.length],
        delay: (80 + i) * 0.15
      });
    }
    
    return allLights;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Wreath garland effect - top */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-green-900/40 to-transparent" 
           style={{ 
             backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(34, 139, 34, 0.3) 20px, rgba(34, 139, 34, 0.3) 40px)',
             boxShadow: 'inset 0 2px 8px rgba(34, 139, 34, 0.4)'
           }} />
      
      {/* Wreath garland effect - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-green-900/40 to-transparent"
           style={{ 
             backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(34, 139, 34, 0.3) 20px, rgba(34, 139, 34, 0.3) 40px)',
             boxShadow: 'inset 0 -2px 8px rgba(34, 139, 34, 0.4)'
           }} />
      
      {/* Wreath garland effect - left */}
      <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-green-900/40 to-transparent"
           style={{ 
             backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 20px, rgba(34, 139, 34, 0.3) 20px, rgba(34, 139, 34, 0.3) 40px)',
             boxShadow: 'inset 2px 0 8px rgba(34, 139, 34, 0.4)'
           }} />
      
      {/* Wreath garland effect - right */}
      <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-green-900/40 to-transparent"
           style={{ 
             backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 20px, rgba(34, 139, 34, 0.3) 20px, rgba(34, 139, 34, 0.3) 40px)',
             boxShadow: 'inset -2px 0 8px rgba(34, 139, 34, 0.4)'
           }} />

      {/* Corner wreaths with berries */}
      {[
        { top: '0', left: '0' },
        { top: '0', right: '0' },
        { bottom: '0', left: '0' },
        { bottom: '0', right: '0' }
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-12 h-12"
          style={{
            ...pos,
            background: 'radial-gradient(circle, rgba(34, 139, 34, 0.6) 30%, transparent 70%)',
          }}
        >
          {/* Red berries */}
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-red-600 shadow-lg" style={{ boxShadow: '0 0 6px #ff0000' }} />
          <div className="absolute top-5 left-5 w-1.5 h-1.5 rounded-full bg-red-600 shadow-lg" style={{ boxShadow: '0 0 4px #ff0000' }} />
          <div className="absolute top-2 left-6 w-1.5 h-1.5 rounded-full bg-red-600 shadow-lg" style={{ boxShadow: '0 0 4px #ff0000' }} />
        </div>
      ))}

      {/* Christmas lights */}
      {lights.map((light, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: light.x === 100 ? 'auto' : `${light.x}%`,
            right: light.x === 100 ? '0' : 'auto',
            top: light.y === 100 ? 'auto' : `${light.y}%`,
            bottom: light.y === 100 ? '0' : 'auto',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Light wire */}
          <div 
            className="absolute w-4 h-0.5 bg-gray-800"
            style={{
              transform: light.x === 0 || light.x === 100 ? 'rotate(90deg)' : 'rotate(0deg)',
              top: '50%',
              left: '50%',
              marginLeft: '-8px',
              marginTop: '-1px'
            }}
          />
          {/* Light bulb */}
          <div
            className="w-3 h-4 rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${light.color}, ${light.color}88)`,
              boxShadow: `0 0 8px ${light.color}, 0 0 16px ${light.color}88, 0 0 24px ${light.color}44`,
              animation: `twinkle 1.5s ease-in-out infinite`,
              animationDelay: `${light.delay}s`,
            }}
          />
        </div>
      ))}

      {/* CSS Animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export default ChristmasLights;
