import React, { useState, useCallback } from 'react';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import { GameState } from './types';
import { checkWinner, createEmptyBoard, isBoardFull } from './utils/gameLogic';
import { motion } from 'framer-motion';
import { useP2P } from './hooks/useP2P';
import toast, { Toaster } from 'react-hot-toast';
import { Copy } from 'lucide-react';

const initialGameState: GameState = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  currentBoard: null,
  winners: Array(9).fill(null),
  winner: null,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [gameCode, setGameCode] = useState('');

  const handleGameStart = useCallback((symbol: 'X' | 'O') => {
    setPlayerSymbol(symbol);
    setIsWaiting(false);
    setIsConnected(true);
    toast.success(`Game started! You are playing as ${symbol}`);
  }, []);

  const handleGameUpdate = useCallback((newGameState: GameState) => {
    setGameState(newGameState);
  }, []);

  const handleOpponentDisconnect = useCallback(() => {
    toast.error('Opponent disconnected');
    setIsConnected(false);
    setPlayerSymbol(null);
  }, []);

  const handleWaitingForOpponent = useCallback(() => {
    setIsWaiting(true);
  }, []);

  const { hostGame, joinGame, sendGameMove, disconnect, gameCode: hostGameCode } = useP2P({
    onGameStart: handleGameStart,
    onGameUpdate: handleGameUpdate,
    onOpponentDisconnect: handleOpponentDisconnect,
    onWaitingForOpponent: handleWaitingForOpponent,
  });

  const handleMove = (boardIndex: number, cellIndex: number) => {
    // Check if it's the player's turn and they're connected
    if (gameState.currentPlayer !== playerSymbol || !isConnected) {
      return;
    }

    // Check if the cell is already taken
    if (gameState.board[boardIndex][cellIndex]) {
      return;
    }

    // Check if the board is won
    if (gameState.winners[boardIndex]) {
      return;
    }

    // Check if we're restricted to a specific board and if that board is still playable
    if (gameState.currentBoard !== null) {
      const isCurrentBoardCompleted = gameState.winners[gameState.currentBoard] !== null;
      const isCurrentBoardFull = isBoardFull(gameState.board[gameState.currentBoard]);
      
      // If the current board is still playable, enforce playing in that board
      if (!isCurrentBoardCompleted && !isCurrentBoardFull && boardIndex !== gameState.currentBoard) {
        return;
      }
    }

    const newBoard = gameState.board.map((subBoard, idx) =>
      idx === boardIndex
        ? subBoard.map((cell, i) =>
            i === cellIndex ? gameState.currentPlayer : cell
          )
        : subBoard
    );

    const newWinners = [...gameState.winners];
    newWinners[boardIndex] = checkWinner(newBoard[boardIndex]);

    const gameWinner = checkWinner(newWinners);

    // Determine next board: if the target board is won or full, set to null (any board)
    const targetBoardCompleted = gameState.winners[cellIndex] !== null;
    const targetBoardFull = isBoardFull(newBoard[cellIndex]);
    const nextBoard = targetBoardCompleted || targetBoardFull ? null : cellIndex;

    const newGameState = {
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
      currentBoard: nextBoard,
      winners: newWinners,
      winner: gameWinner,
    };

    setGameState(newGameState);
    sendGameMove(newGameState);

    if (gameWinner) {
      toast.success(`Game Over! ${gameWinner} wins!`);
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setPlayerSymbol(null);
    setIsConnected(false);
    disconnect();
  };

  const copyGameCode = () => {
    if (hostGameCode) {
      navigator.clipboard.writeText(hostGameCode);
      toast.success('Game code copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      <Toaster position="top-center" />
      
      <motion.div
        className="absolute inset-0 opacity-50"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #f43f5e 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, #3b82f6 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, #f43f5e 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="relative z-10">
        <GameStatus
          gameState={gameState}
          onReset={resetGame}
          playerSymbol={playerSymbol}
          isWaiting={isWaiting}
        />

        {!isConnected && !isWaiting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 mb-8"
          >
            <div className="flex gap-4">
              <motion.button
                onClick={hostGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Host Game
              </motion.button>
              <motion.button
                onClick={() => joinGame(gameCode)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Join Game
              </motion.button>
            </div>

            {hostGameCode ? (
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
                <span className="text-white">Game Code: {hostGameCode}</span>
                <button
                  onClick={copyGameCode}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Copy size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  placeholder="Enter game code"
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </motion.div>
        )}

        <Board
          board={gameState.board}
          currentBoard={gameState.currentBoard}
          onMove={handleMove}
          winners={gameState.winners}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-slate-400 text-center max-w-md"
        >
          <p className="mb-2">Rules:</p>
          <ul className="text-sm">
            <li>• Win three smaller boards in a row to win the game</li>
            <li>• Your move sends your opponent to the corresponding board</li>
            <li>• If sent to a completed board, you can play in any open board</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default App;