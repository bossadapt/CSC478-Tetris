import { GamePhase, useGameStore } from "../../GameStore";
import InteractiveMenu from "./InteractiveMenu";

export default function LeftPanel() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  if (gamePhase === GamePhase.START) {
    return <div></div>;
  } else {
    return <InteractiveMenu></InteractiveMenu>;
  }
}
