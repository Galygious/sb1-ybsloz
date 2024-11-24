export type Player = 'X' | 'O' | null;
export type SubBoardState = Player[];
export type BoardState = SubBoardState[];

export interface GameState {
  board: BoardState;
  currentPlayer: 'X' | 'O';
  currentBoard: number | null;
  winners: (Player)[];
  winner: Player;
}