import React, { useMemo } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "../lib/utils";

export function SpaceBackground({ isDark }: { isDark: boolean }) {
  const { scrollY } = useScroll();

  // Parallax layers based on scroll
  const y1 = useTransform(scrollY, [0, 2000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -250]);
  const y3 = useTransform(scrollY, [0, 2000], [0, -400]);

  // Generate random star/dust particles
  const particles = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // 0 to 100vw
      y: Math.random() * 80, // mostly upper area (0 to 80vh)
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1, // more visible
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Dust/Particles Layer */}
      {!isDark && (
        <motion.div style={{ y: y1 }} className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={`p-${p.id}`}
              className={cn(
                "absolute rounded-full",
                "bg-black/20 mix-blend-multiply",
              )}
              style={{
                left: `${p.x}vw`,
                top: `${p.y}vh`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
