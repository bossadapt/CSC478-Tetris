import { useGameStore } from "../../GameStore";

export default function StateBoard() {
  const level = useGameStore((s) => s.level);
  const lines = useGameStore((s) => s.linesCleared);
  const score = useGameStore((s) => s.score);
  return (
    <div className="insert-coin" style={{ textAlign: "center" }}>
      <h1>LEVEL</h1>
      <h1>{level}</h1>
      <h1>LINES</h1>
      <h1>{lines}</h1>
      <h1>SCORE</h1>
      <h1>{score}</h1>
    </div>
  );
}
