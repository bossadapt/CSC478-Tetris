import { GamePhase, useGameStore } from "../../GameStore";
import LevelSelection from "./LevelSelection";

export default function InteractiveMenu() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const restartGame = useGameStore((s) => s.startGame);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const endGame = useGameStore((s) => s.endGame);
  function mainButtons(
    unpause_active: boolean,
    pause_active: boolean,
    restart_active: boolean,
    end_active: boolean
  ) {
    const pause_button = (
      <button className="insert-coin main-button" onClick={() => pauseGame()}>
        pause
      </button>
    );
    const unpause_button = (
      <button className="insert-coin main-button" onClick={() => pauseGame()}>
        unpause
      </button>
    );
    const restart_button = (
      <button className="insert-coin main-button" onClick={() => restartGame()}>
        Restart
      </button>
    );
    const end_button = (
      <button className="insert-coin main-button" onClick={() => endGame()}>
        End
      </button>
    );
    return (
      <div className="interactive-menu__buttons">
        {unpause_active ? unpause_button : null}
        {pause_active ? pause_button : null}
        {restart_active ? restart_button : null}
        {end_active ? end_button : null}
      </div>
    );
  }

  const controls = (
    <div className="interactive-menu__center-block">
      <h2>You may use WASD or arrow keys to play</h2>
      <h2>W / up : Rotate Right</h2>
      <h2>A / left : Move Left</h2>
      <h2>S / right: Move Right</h2>
      <h2>D / down : Move Downward</h2>
    </div>
  );

  const namePrompt = (
    <div className="interactive-menu__center-block">
      <h1>Please Enter a name into the leaderboard on the the right</h1>
      <h1>OR</h1>
      <h1>Press Enter to Restart</h1>
    </div>
  );

  let buttonsRow = null;
  let bodyContent = controls;
  switch (gamePhase) {
    case GamePhase.START: {
      return null;
    }
    case GamePhase.ACTIVE: {
      buttonsRow = mainButtons(false, true, true, true);
      break;
    }
    case GamePhase.PAUSED: {
      buttonsRow = mainButtons(true, false, true, true);
      break;
    }
    default: {
      buttonsRow = mainButtons(false, false, true, false);
      bodyContent = namePrompt;
    }
  }

  return (
    <div className="insert-coin interactive-menu">
      {buttonsRow}
      {bodyContent}
      <LevelSelection></LevelSelection>
    </div>
  );
}
