import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bee {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export function FlyingBees({ trigger }: { trigger: number }) {
  const [bees, setBees] = useState<Bee[]>([]);

  useEffect(() => {
    if (trigger > 0) {
      // Spawn 5 bees from the center of the screen (or roughly around where the button is usually located)
      const newBees: Bee[] = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 100,
        targetX: (Math.random() - 0.5) * window.innerWidth * 1.5,
        targetY: (Math.random() - 0.5) * window.innerHeight * 1.5 - 200,
      }));
      
      setBees(prev => [...prev, ...newBees]);
      
      // Clean up bees after animation
      setTimeout(() => {
        setBees(prev => prev.filter(b => !newBees.find(nb => nb.id === b.id)));
      }, 2500);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {bees.map(bee => (
          <motion.div
            key={bee.id}
            initial={{ opacity: 0, scale: 0, x: bee.x, y: bee.y }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.5, 1, 0.8],
              x: bee.x + bee.targetX,
              y: bee.y + bee.targetY,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute text-2xl"
            style={{ textShadow: '0 0 10px rgba(251,191,36,0.8)' }}
          >
            🐝
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
