import React, { useState } from 'react';
import SubBoard from './SubBoard';
import { BoardState, SubBoardState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import OrbitingDots from './OrbitingDots';

interface BoardProps {
  board: BoardState;
  currentBoard: number | null;
  onMove: (boardIndex: number, cellIndex: number) => void;
  winners: (string | null)[];
}

const Board: React.FC<BoardProps> = ({ board, currentBoard, onMove, winners }) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-3 gap-4 bg-slate-800 p-4 rounded-xl shadow-2xl w-fit relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-rose-500/10"
        animate={{
          background: [
            "linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(244, 63, 94, 0.1))",
            "linear-gradient(to bottom right, rgba(244, 63, 94, 0.1), rgba(59, 130, 246, 0.1))",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Large board hover indicator */}
      <AnimatePresence>
        {hoveredCell !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute"
            style={{
              top: `${Math.floor(hoveredCell / 3) * 33.33}%`,
              left: `${(hoveredCell % 3) * 33.33}%`,
              width: '33.33%',
              height: '33.33%',
              pointerEvents: 'none',
            }}
          >
            <OrbitingDots scale={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {board.map((subBoard: SubBoardState, boardIndex: number) => (
        <motion.div
          key={boardIndex}
          animate={{
            opacity: currentBoard === null || currentBoard === boardIndex ? 1 : 0.4,
          }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <SubBoard
            board={subBoard}
            onMove={(cellIndex) => onMove(boardIndex, cellIndex)}
            winner={winners[boardIndex]}
            isActive={currentBoard === null || currentBoard === boardIndex}
            onHoverCell={setHoveredCell}
            highlightIndex={hoveredCell}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Board;