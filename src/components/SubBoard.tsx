import React from 'react';
import { SubBoardState } from '../types';
import { X, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrbitingDots from './OrbitingDots';

interface SubBoardProps {
  board: SubBoardState;
  onMove: (index: number) => void;
  winner: string | null;
  isActive: boolean;
  onHoverCell: (index: number | null) => void;
  highlightIndex: number | null;
}

const SubBoard: React.FC<SubBoardProps> = ({ 
  board, 
  onMove, 
  winner, 
  isActive,
  onHoverCell,
  highlightIndex 
}) => {
  if (winner) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-32 h-32 bg-slate-700 rounded-lg flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
        >
          {winner === 'X' ? (
            <X className="w-24 h-24 text-blue-400" />
          ) : (
            <Circle className="w-24 h-24 text-rose-400" />
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-3 gap-1 bg-slate-700 p-1 rounded-lg relative"
    >
      {board.map((cell, index) => (
        <motion.button
          key={index}
          onClick={() => isActive && !cell && onMove(index)}
          onMouseEnter={() => isActive && !cell && onHoverCell(index)}
          onMouseLeave={() => onHoverCell(null)}
          disabled={!isActive || !!cell}
          whileHover={!cell && isActive ? { scale: 0.95 } : {}}
          whileTap={!cell && isActive ? { scale: 0.9 } : {}}
          className={`w-10 h-10 flex items-center justify-center rounded relative overflow-hidden
            ${!cell && isActive
              ? 'bg-slate-600 hover:bg-slate-500 transition-colors'
              : 'bg-slate-600'
            }`}
        >
          <AnimatePresence mode="wait">
            {cell && (
              <motion.div
                key={cell}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative z-10"
              >
                {cell === 'X' ? (
                  <X className="w-8 h-8 text-blue-400" />
                ) : (
                  <Circle className="w-8 h-8 text-rose-400" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Hover indicator for individual cell */}
          <AnimatePresence>
            {!cell && isActive && index === highlightIndex && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <OrbitingDots />
                </motion.div>
                {/* Preview of next player's move */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 0.8, opacity: 0.3 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {board.filter(Boolean).length % 2 === 0 ? (
                    <X className="w-8 h-8 text-blue-400" />
                  ) : (
                    <Circle className="w-8 h-8 text-rose-400" />
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default SubBoard;