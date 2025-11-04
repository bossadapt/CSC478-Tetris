import { GamePhase, useGameStore } from "../../GameStore";
import Leaderboard from "./Leaderboard";
import StateBoard from "./StateBoard";
export default function RightPanel() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  if (gamePhase == GamePhase.START) {
    return <div></div>;
  } else if (gamePhase == GamePhase.ACTIVE || gamePhase == GamePhase.PAUSED) {
    return <StateBoard></StateBoard>;
  } else {
    return <Leaderboard></Leaderboard>;
  }
}
