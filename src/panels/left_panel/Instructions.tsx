import { GamePhase, useGameStore } from "../../GameStore";
import LevelSelection from "./LevelSelection";

export default function Instructions() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const restartGame = useGameStore((s) => s.startGame);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const endGame = useGameStore((s) => s.endGame);
  if (gamePhase == GamePhase.START) {
    return <div></div>;
  } else if (gamePhase == GamePhase.ACTIVE) {
    return (
      <div className="insert-coin">
        <div style={{ width: "100%", display: "flex", flexDirection: "row" }}>
          <button
            className="insert-coin main-button"
            onClick={() => pauseGame()}
          >
            Pause
          </button>
          <button
            className="insert-coin main-button"
            onClick={() => restartGame()}
          >
            Restart
          </button>
          <button className="insert-coin main-button" onClick={() => endGame()}>
            End
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <h2>You may use WASD or arrow keys to play</h2>
          <h2>W / up : Rotate Right</h2>
          <h2>A / left : Move Left</h2>
          <h2>S / right: Move Right</h2>
          <h2>D / down : Move Downward</h2>
        </div>
        <LevelSelection></LevelSelection>
      </div>
    );
  } else if (gamePhase == GamePhase.PAUSED) {
    return (
      <div className="insert-coin">
        <div style={{ display: "flex" }}>
          <button
            className="insert-coin main-button"
            onClick={() => pauseGame()}
          >
            unpause
          </button>
          <button
            className="insert-coin main-button"
            onClick={() => restartGame()}
          >
            Restart
          </button>
          <button className="insert-coin main-button" onClick={() => endGame()}>
            End
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <h2>You may use WASD or arrow keys to play</h2>
          <h2>W / up : Rotate Right</h2>
          <h2>A / left : Move Left</h2>
          <h2>S / right: Move Right</h2>
          <h2>D / down : Move Downward</h2>
        </div>
        <LevelSelection></LevelSelection>
      </div>
    );
  } else {
    return (
      <div className="insert-coin">
        <div style={{ display: "flex" }}>
          <button
            className="insert-coin main-button"
            onClick={() => restartGame()}
          >
            Restart
          </button>
        </div>
        <h1>Please Enter a name into the leaderboard on the the right</h1>
        <h1>OR</h1>
        <h1>Restart</h1>
        <LevelSelection></LevelSelection>
      </div>
    );
  }
}
