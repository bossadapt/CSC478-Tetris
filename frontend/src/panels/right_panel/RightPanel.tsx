import { useState } from "react";
import { GamePhase, useGameStore } from "../../GameStore";
import AddScore from "./AddScore";
import Leaderboard from "./Leaderboard";
import StateBoard from "./StateBoard";

export default function RightPanel() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleScoreSubmitted = () => {
    setRefreshToken((token) => token + 1);
  };

  if (gamePhase == GamePhase.START) {
    return <div></div>;
  } else if (gamePhase == GamePhase.ACTIVE || gamePhase == GamePhase.PAUSED) {
    return <StateBoard></StateBoard>;
  } else {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          gap: "0.75rem",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <Leaderboard refreshToken={refreshToken}></Leaderboard>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <AddScore onScoreSubmitted={handleScoreSubmitted}></AddScore>
        </div>
      </div>
    );
  }
}
