"use client";

import { useMouse } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { getColorFromPercentage } from "./nyc/live/locations/utils";

type DotType = {
  x: number;
  y: number;
  size: number;
  color: string;
};

export const CursorAnimation = () => {
  const [mouse, ref] = useMouse();
  const [dots, setDots] = useState<DotType[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDot = {
        x: mouse.x + Math.random() * 80 - 40,
        y: mouse.y + Math.random() * 80 - 40,
        size: Math.random() * 20 + 5,
        color: getColorFromPercentage({
          percentage: Math.random(),
          minHue: 195,
          maxHue: 260,
        }),
      };
      setDots((prev) => [newDot, ...prev].slice(0, 10));
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, [mouse]);

  return (
    <div
      className="absolute left-1/2 top-1/2 z-20 flex h-[100vh] w-[100vw] -translate-x-1/2 -translate-y-1/2"
      // @ts-expect-error
      ref={ref}
    >
      {dots.map((dot, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            borderRadius: "50%",
            outline: "1px solid white",
          }}
        />
      ))}
    </div>
  );
};
