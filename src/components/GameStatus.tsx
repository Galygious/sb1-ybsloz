import React from 'react';
import { GameState } from '../types';
import { X, Circle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameStatusProps {
  gameState: GameState;
  onReset: () => void;
  playerSymbol: 'X' | 'O' | null;
  isWaiting: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameState,
  onReset,
  playerSymbol,
  isWaiting,
}) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col items-center gap-4 mb-8"
    >
      <motion.div
        className="flex items-center gap-3"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <h1 className="text-3xl font-bold text-white">Ultimate Tic-Tac-Toe</h1>
      </motion.div>

      {isWaiting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-white"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Waiting for opponent...</span>
        </motion.div>
      ) : playerSymbol && (
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              scale: gameState.currentPlayer === 'X' ? 1.05 : 1,
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full 
              ${playerSymbol === 'X' ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-slate-700'}
              ${gameState.currentPlayer === 'X' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <X className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">
              {playerSymbol === 'X' ? 'You' : 'Opponent'}
            </span>
          </motion.div>
          <motion.div
            animate={{
              scale: gameState.currentPlayer === 'O' ? 1.05 : 1,
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full
              ${playerSymbol === 'O' ? 'bg-rose-500/20 ring-2 ring-rose-500' : 'bg-slate-700'}
              ${gameState.currentPlayer === 'O' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <Circle className="w-5 h-5 text-rose-400" />
            <span className="text-rose-400 font-semibold">
              {playerSymbol === 'O' ? 'You' : 'Opponent'}
            </span>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {gameState.winner && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl font-bold text-white flex items-center gap-2"
            >
              {gameState.winner === playerSymbol ? 'You Won!' : 'Opponent Won!'}
              {gameState.winner === 'X' ? (
                <X className="w-8 h-8 text-blue-400" />
              ) : (
                <Circle className="w-8 h-8 text-rose-400" />
              )}
            </motion.div>
            <motion.button
              onClick={onReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameStatus;