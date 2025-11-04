import { GamePhase, useGameStore } from "../../GameStore";
import Instructions from "./Instructions";

export default function LeftPanel() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  if (gamePhase == GamePhase.START) {
    return <div></div>;
  } else {
    return <Instructions></Instructions>;
  }
}
