import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { Box, Typography, useTheme } from "@mui/material";

import { WheelItem } from "../../../hooks/useWheelStore";

export interface WheelHandle {
  spin: () => void;
}

type Props = {
  items: WheelItem[];
  /** Voláno po zastavení kola s vylosovanou položkou. */
  onResult: (item: WheelItem) => void;
  /** Voláno při spuštění losování. */
  onSpinStart?: () => void;
  emptyLabel: string;
};

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = CENTER - 4;
const FULL_TURNS = 6;
const SPIN_MS = 4500;

// barva segmentu rovnoměrně rozloženým odstínem
const segmentColor = (index: number, total: number) => `hsl(${Math.round((index / total) * 360)}, 70%, 55%)`;

// úhel měřený od horního bodu (12 hodin) po směru hodinových ručiček → kartézská souřadnice
const polarToCartesian = (angleDeg: number, radius: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) };
};

const segmentPath = (startAngle: number, endAngle: number) => {
  const start = polarToCartesian(startAngle, RADIUS);
  const end = polarToCartesian(endAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
};

const truncate = (text: string, max = 14) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const Wheel = forwardRef<WheelHandle, Props>(({ items, onResult, onSpinStart, emptyLabel }, ref) => {
  const theme = useTheme();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const resultRef = useRef<WheelItem | null>(null);

  const count = items.length;
  const segAngle = count > 0 ? 360 / count : 0;

  useImperativeHandle(ref, () => ({
    spin: () => {
      if (spinning || count === 0) return;

      const index = Math.floor(Math.random() * count);
      resultRef.current = items[index];

      // střed vylosovaného segmentu přivedeme pod ukazatel (12 hodin)
      const segmentCenter = (index + 0.5) * segAngle;
      const base = (360 - segmentCenter) % 360;
      const current = rotation % 360;
      const target = rotation - current + base + FULL_TURNS * 360;

      setSpinning(true);
      onSpinStart?.();
      setRotation(target);
    },
  }));

  const handleTransitionEnd = () => {
    if (!resultRef.current) return;
    setSpinning(false);
    const winner = resultRef.current;
    resultRef.current = null;
    onResult(winner);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 640,
        aspectRatio: "1 / 1",
        margin: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ukazatel nahoře */}
      <Box
        sx={{
          position: "absolute",
          top: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderTop: "26px solid #d32f2f",
          zIndex: 2,
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
        }}
      />

      {/* ořez rotujícího čtverce – brání horizontálnímu přetečení stránky (rohy mimo vepsaný kruh) */}
      <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
        <Box
          onTransitionEnd={handleTransitionEnd}
          sx={{
            width: "100%",
            height: "100%",
            transformOrigin: "50% 50%",
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : "none",
          }}
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill={theme.palette.action.hover}
            stroke={theme.palette.divider}
            strokeWidth={2}
          />

          {count > 0 &&
            items.map((item, index) => {
              const startAngle = index * segAngle;
              const endAngle = (index + 1) * segAngle;
              const centerAngle = startAngle + segAngle / 2;
              const labelPos = polarToCartesian(centerAngle, RADIUS * 0.62);
              return (
                <g key={item.id}>
                  <path d={segmentPath(startAngle, endAngle)} fill={segmentColor(index, count)} stroke="#fff" strokeWidth={2} />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#fff"
                    fontSize={count > 16 ? 10 : 14}
                    fontWeight={600}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${centerAngle} ${labelPos.x} ${labelPos.y})`}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {truncate(item.label)}
                  </text>
                </g>
              );
            })}

          {/* středový knoflík */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={18}
            fill={theme.palette.background.paper}
            stroke={theme.palette.divider}
            strokeWidth={2}
          />
        </svg>
        </Box>
      </Box>

      {count === 0 && (
        <Typography
          sx={{ position: "absolute", textAlign: "center", color: "text.secondary", px: 4, pointerEvents: "none" }}
        >
          {emptyLabel}
        </Typography>
      )}
    </Box>
  );
});

Wheel.displayName = "Wheel";

export default Wheel;
