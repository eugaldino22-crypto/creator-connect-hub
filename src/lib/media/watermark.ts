import type { CSSProperties } from "react";

export type WatermarkOptions = {
  viewerLabel: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  opacity?: number;
};

export function createWatermarkLabel(viewerLabel: string, sessionId?: string) {
  const sessionSuffix = sessionId ? ` · ${sessionId.slice(-8)}` : "";

  return `SECRET · ${viewerLabel}${sessionSuffix}`;
}

/**
 * Posicionamento da camada visual do watermark.
 *
 * O watermark é uma medida de mitigação contra redistribuição
 * e não impede captura de tela ou gravação por meios externos.
 */
export function getWatermarkClassName(position: WatermarkOptions["position"] = "bottom-right") {
  const positions = {
    "top-left": "left-3 top-3",
    "top-right": "right-3 top-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "right-3 bottom-3",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return `pointer-events-none absolute z-20 ${positions[position]}`;
}

export function getWatermarkStyle(opacity = 0.58): CSSProperties {
  return {
    opacity,
    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
  };
}
