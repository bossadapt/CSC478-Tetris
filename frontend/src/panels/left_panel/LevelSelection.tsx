import { useGameStore } from "../../GameStore";

const LEVEL_COUNT = 15;
const LEVELS_PER_ROW = 3;

const levels = Array.from({ length: LEVEL_COUNT }, (_, idx) => idx + 1);

export default function LevelSelection() {
  const startGame = useGameStore((s) => s.startGame);
  return (
    <div className="level-selection">
      <div
        className="level-selection__grid"
        style={{
          gridTemplateColumns: `repeat(${LEVELS_PER_ROW}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(
            LEVEL_COUNT / LEVELS_PER_ROW
          )}, minmax(3rem, auto))`,
        }}
      >
        {levels.map((levelNumber) => (
          <button
            key={levelNumber}
            className="level-selection__button insert-coin"
            type="button"
            onClick={() => startGame(levelNumber)}
          >
            Level {levelNumber}
          </button>
        ))}
      </div>
    </div>
  );
}
