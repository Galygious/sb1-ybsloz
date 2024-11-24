import React from 'react';
import { motion } from 'framer-motion';

interface OrbitingDotsProps {
  scale?: number;
}

const OrbitingDots: React.FC<OrbitingDotsProps> = ({ scale = 1 }) => {
  return (
    <div className="absolute inset-0">
      {/* First dot pair */}
      <motion.div
        className="absolute w-full h-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-blue-400"
          style={{
            top: '50%',
            left: `${-4 * scale}px`,
            transform: `translateY(-50%) scale(${scale})`,
          }}
        />
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-rose-400"
          style={{
            top: '50%',
            right: `${-4 * scale}px`,
            transform: `translateY(-50%) scale(${scale})`,
          }}
        />
      </motion.div>

      {/* Second dot pair */}
      <motion.div
        className="absolute w-full h-full"
        animate={{ rotate: -360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-rose-400"
          style={{
            left: '50%',
            top: `${-4 * scale}px`,
            transform: `translateX(-50%) scale(${scale})`,
          }}
        />
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-blue-400"
          style={{
            left: '50%',
            bottom: `${-4 * scale}px`,
            transform: `translateX(-50%) scale(${scale})`,
          }}
        />
      </motion.div>
    </div>
  );
};

export default OrbitingDots;