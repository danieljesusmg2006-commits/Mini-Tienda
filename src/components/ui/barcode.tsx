"use client";

import { useMemo } from "react";

interface BarcodeProps {
  value: string;
  name?: string;
  price?: number;
  className?: string;
}

export function Barcode({ value, name, price, className = "" }: BarcodeProps) {
  // Generación algorítmica de barras para simular Code128 en SVG de alta resolución
  const bars = useMemo(() => {
    const cleanValue = value.replace(/[^A-Za-z0-9_-]/g, "");
    const generated: { width: number; space: number }[] = [];

    for (let i = 0; i < cleanValue.length; i++) {
      const code = cleanValue.charCodeAt(i);
      const w1 = (code % 3) + 1;
      const s1 = ((code >> 1) % 2) + 1;
      const w2 = ((code >> 2) % 3) + 1;
      const s2 = (code % 2) + 1;

      generated.push({ width: w1, space: s1 });
      generated.push({ width: w2, space: s2 });
    }

    return generated;
  }, [value]);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-3 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xs select-none ${className}`}
    >
      {name && (
        <span className="text-[11px] font-semibold truncate max-w-[200px] mb-1">
          {name}
        </span>
      )}

      {/* SVG de Código de Barras */}
      <svg
        className="w-48 h-12"
        viewBox="0 0 160 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="currentColor">
          {/* Barra de inicio */}
          <rect x="0" y="0" width="3" height="50" />
          <rect x="5" y="0" width="2" height="50" />

          {/* Barras calculadas */}
          {(() => {
            let currentX = 9;
            return bars.map((bar, idx) => {
              const rectX = currentX;
              currentX += bar.width + bar.space;
              if (rectX > 148) return null;
              return (
                <rect
                  key={idx}
                  x={rectX}
                  y="0"
                  width={bar.width}
                  height="45"
                />
              );
            });
          })()}

          {/* Barra de parada */}
          <rect x="150" y="0" width="3" height="50" />
          <rect x="155" y="0" width="4" height="50" />
        </g>
      </svg>

      {/* Valor numérico del código de barras */}
      <span className="font-mono text-xs tracking-widest mt-1 font-medium">
        {value}
      </span>

      {price !== undefined && (
        <span className="text-xs font-bold text-indigo-700 mt-0.5">
          RD$ {price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </span>
      )}
    </div>
  );
}
