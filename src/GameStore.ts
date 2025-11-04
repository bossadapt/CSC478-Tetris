import { create } from "zustand";
import { Grid } from "./Grid";
import { ActiveShape } from "./Shape";
import { GameColor, Position } from "./Shared";

const SCORING_BY_LINE = [100, 300, 500, 800] as const;

const COLS = 10 as const;
const ROWS = 20 as const;

export enum GamePhase {
  PAUSED,
  OVER,
  ACTIVE,
  START,
}

type GameState = {
  COLS: typeof COLS;
  ROWS: typeof ROWS;
  gamePhase: GamePhase;
  level: number;
  score: number;
  linesCleared: number;
  grid: Grid;
  activeShape: ActiveShape;
  boardVersion: number;
};

type GameStore = GameState & {
  startGame: (level?: number) => void;
  endGame: () => void;
  pauseGame: () => void;
  moveToNextShape: (currentPositions: Position[], color: number) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  COLS,
  ROWS,
  gamePhase: GamePhase.START,
  level: 1,
  score: 0,
  linesCleared: 0,
  grid: new Grid(COLS, ROWS, GameColor.BLACK),
  activeShape: new ActiveShape(),
  boardVersion: 0,

  startGame: (level?: number) => {
    if (!level) {
      level = 1;
    }
    set({
      gamePhase: GamePhase.ACTIVE,
      grid: new Grid(COLS, ROWS, GameColor.BLACK),
      activeShape: new ActiveShape(),
      score: 0,
      level: level,
      linesCleared: 0,
      boardVersion: 0,
    });
  },

  endGame: () => set({ gamePhase: GamePhase.OVER }),

  pauseGame: () =>
    set((s) => ({
      gamePhase:
        s.gamePhase === GamePhase.PAUSED ? GamePhase.ACTIVE : GamePhase.PAUSED,
    })),

  moveToNextShape: (currentPositions, color) => {
    const grid = get().grid;

    // mutate the current grid…
    grid.drawPositions2Grid(currentPositions, color);
    const cleared = grid.clearFinishedRows();

    // …then compute and set derived state via set()
    set((s) => {
      let score = s.score;
      let linesCleared = s.linesCleared;
      let level = s.level;

      if (cleared > 0) {
        score += (SCORING_BY_LINE[cleared - 1] ?? 0) * level;
        linesCleared += cleared;
        level = Math.floor(linesCleared / 10) + 1;
      }

      return {
        score,
        linesCleared,
        level,
        activeShape: new ActiveShape(),
        boardVersion: s.boardVersion + 1, //to force a rerender
      };
    });
  },
}));
