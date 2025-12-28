
import React, { useState, useRef, useEffect } from 'react';

export const IconButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  active?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, active = false }) => {
  const themes = {
    primary: active ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/60 backdrop-blur-md border-white/10 text-slate-400 hover:text-white',
    secondary: 'bg-indigo-600 border-indigo-400 text-white shadow-lg',
    danger: 'bg-red-500/20 border-red-500/20 text-red-400',
    success: 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
  };

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all active:scale-90 disabled:opacity-30 ${themes[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, onChange }) => (
  <div className="w-full space-y-4">
    <div className="flex justify-between items-center px-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{label}</span>
      <span className="text-[10px] font-mono font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">{value}%</span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
    />
  </div>
);

export const ComparisonSlider: React.FC<{
  before: string;
  after: string;
  className?: string;
}> = ({ before, after, className = "" }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none touch-none overflow-hidden flex items-center justify-center ${className}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img src={before} style={{imageRendering:'pixelated'}} className="opacity-30 max-h-[90%] max-w-[90%] object-contain" alt="Original" />
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={after} style={{imageRendering:'pixelated'}} className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" alt="Synthesized" />
      </div>
      <div className="absolute inset-y-4 w-0.5 bg-indigo-500/50 z-20 pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center border border-white/20 shadow-xl">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7l-4 4m0 0l4 4m-4-4h16m-4-4l4 4m0 0l-4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const PixelCanvas: React.FC<{
  imageUrl: string;
  tool: 'brush' | 'eraser';
  onSave: (dataUrl: string) => void;
  color?: string;
}> = ({ imageUrl, tool, onSave, color = '#FF00FF' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) onSave(canvas.toDataURL());
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    
    const x = (('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left) * (canvas.width / rect.width);
    const y = (('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top) * (canvas.height / rect.height);

    ctx.fillStyle = tool === 'eraser' ? color : '#FFFFFF'; // Simple brush
    // Using simple rects for pixel-art feel
    ctx.fillRect(Math.floor(x), Math.floor(y), 2, 2);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseMove={draw}
      onTouchStart={startDrawing}
      onTouchEnd={stopDrawing}
      onTouchMove={draw}
      className="max-h-[85%] max-w-[85%] object-contain cursor-crosshair touch-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export const NeuralLog: React.FC<{ active: boolean }> = ({ active }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const allLogs = [
    "> ACCESSING NEURAL GATE...",
    "> MAPPING BIOMETRICS...",
    "> STABILIZING PIXELS...",
    "> SYNC COMPLETE."
  ];

  useEffect(() => {
    if (!active) { setLogs([]); return; }
    let i = 0;
    const interval = setInterval(() => {
      if (i < allLogs.length) {
        setLogs(prev => [...prev.slice(-2), allLogs[i]]);
        i++;
      }
    }, 800);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute bottom-32 left-6 right-6 z-[160] font-mono text-[8px] text-indigo-400 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-indigo-500/20 shadow-2xl animate-in fade-in">
      {logs.map((log, idx) => (
        <div key={idx} className={idx === logs.length - 1 ? 'text-white' : 'opacity-30'}>{log}</div>
      ))}
    </div>
  );
};

export const Tag: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
  >
    {label}
  </button>
);

export const Loader: React.FC<{ message?: string }> = ({ message = 'Sintetizando...' }) => (
  <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-300">
    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white mt-6 animate-pulse">{message}</span>
  </div>
);
