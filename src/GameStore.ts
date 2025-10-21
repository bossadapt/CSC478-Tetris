import { create } from "zustand";
import { Grid } from "./Grid";
import { ActiveShape } from "./Shape";
import { GameColor, Position } from "./Shared";
const SCORING_BY_LINE = [100, 300, 500, 800];
export enum GamePhase {
  PAUSED,
  OVER,
  ACTIVE,
  START,
}
type GameState = {
  COLS: 10;
  ROWS: 20;
  gamePhase: GamePhase;
  level: number;
  score: number;
  linesCleared: number;
  grid: Grid;
  activeShape: ActiveShape;
};

type GameStore = GameState & {
  startGame: () => void;
  endGame: () => void;
  pauseGame: () => void;
  moveToNextShape: (currentPositions: Position[], color: number) => void;
};
export const useGameStore = create<GameStore>((set, get) => ({
  COLS: 10,
  ROWS: 20,
  level: 1,
  score: 0,
  linesCleared: 0,
  gamePhase: GamePhase.START,
  grid: new Grid(get().COLS, get().ROWS, GameColor.BLACK),
  activeShape: new ActiveShape(),
  startGame: () => {
    const newGrid = new Grid(get().COLS, get().ROWS, GameColor.BLACK);
    set({
      grid: newGrid,
      score: 0,
      level: 1,
      linesCleared: 0,
    });
  },
  endGame: () => {},
  pauseGame: () => {},
  moveToNextShape(currentPositions: Position[], color: number) {
    get().grid.drawPositions2Grid(currentPositions, color);
    const linesCleared = get().grid.clearFinishedRows();

    if (linesCleared > 0) {
      get().score += SCORING_BY_LINE[linesCleared - 1] * get().level;
      get().linesCleared += linesCleared;
      get().level = Math.floor(get().linesCleared / 10) + 1;
      console.log("LINES_CLEARED:", get().linesCleared);
      console.log("level:", get().level);
      console.log("SCORE:", get().score);
    }
    get().activeShape = new ActiveShape();
  },
}));
