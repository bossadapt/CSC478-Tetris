import { useEffect, useRef } from "react";
import litecanvas from "litecanvas";
import { GameColor } from "./Shared";
import { GamePhase, useGameStore } from "./GameStore";
export default function GameEngine() {
  const get = useGameStore.getState;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = litecanvas({
      canvas: canvasRef.current,
      loop: { init, update, draw },
      width: 200,
      height: 400,
    });

    const CELL_SIZE = engine.W / get().COLS;
    // this function runs once at the beginning
    function init() {}
    function updateActive(dt: number) {
      if (engine.iskeypressed && engine.iskeypressed("escape")) {
        get().pauseGame();
        return;
      }
      get().activeShape.mainPosition.y += dt * get().level;
      if (engine.iskeydown) {
        // accelerate piece down if s or arrowdown key is pressed (requirements: 3.1.3 \ 3.4.2)
        if (
          engine &&
          (engine.iskeydown("s") || engine.iskeydown("arrowdown"))
        ) {
          get().activeShape.mainPosition.y += dt * 10;
        }
        const currentPositions = get().activeShape.generateCurrentPositions();
        const currentPositionsY = currentPositions.map((pos) => {
          return pos.y;
        });
        const currentMinY = Math.min(...currentPositionsY);
        // detect piece position and trigger end game if needed (requirement: 3.1.6)
        if (get().grid.hasCollided(currentPositions)) {
          if (currentMinY < 0) {
            get().endGame();
          } else {
            get().moveToNextShape(currentPositions, get().activeShape.color);
          }
        }
        // rotate piece if w or arrowup is pressed (requirements: 3.1.2 \ 3.4.3)
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          (engine.iskeypressed("w") || engine.iskeypressed("arrowup"))
        ) {
          if (!get().grid.hasCollided(get().activeShape.peekRotate()))
            get().activeShape.rotate();
        }

        // x logic
        // move piece left if a or arrowleft key is pressed (requirements: 3.1.1 \ 3.4.0)  
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          (engine.iskeypressed("a") || engine.iskeypressed("arrowleft"))
        ) {
          if (!get().grid.hasCollided(get().activeShape.peekXMovement(-1)))
            get().activeShape.mainPosition.x -= 1;
        }
        // move piece right if d or arrowright key is pressed (requirements: 3.1.1 \ 3.4.1)
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          (engine.iskeypressed("d") || engine.iskeypressed("arrowright"))
        ) {
          if (!get().grid.hasCollided(get().activeShape.peekXMovement(1)))
            get().activeShape.mainPosition.x += 1;
        }
      }
    }
    
    // pause game if esc key is pressed (requirements: 3.1.7 \ 3.4.4)
    function updatePause(dt: number) {
      if (engine.iskeypressed && engine.iskeypressed("escape")) {
        get().pauseGame();
        return;
      }
    }
    function updateOver(dt: number) {
      if (engine.iskeypressed && engine.iskeypressed("enter")) {
        get().startGame();
        return;
      }
    }
    function updateStart(dt: number) {
      if (engine.lastkey) console.log(engine.lastkey());
      if (engine.iskeypressed && engine.iskeypressed("enter")) {
        get().startGame();
        return;
      }
    }
    function update(dt: number) {
      switch (get().gamePhase) {
        case GamePhase.ACTIVE:
          updateActive(dt);
          break;
        case GamePhase.PAUSED:
          updatePause(dt);
          break;
        case GamePhase.OVER:
          updateOver(dt);
          break;
        case GamePhase.START:
          updateStart(dt);
          break;
      }
    }
    function drawActive() {
      const currentPositions = get().activeShape.generateCurrentPositions();
      engine.cls(get().grid.bg_color);
      for (let x = 0; x < get().grid.width; x++) {
        for (let y = 0; y < get().grid.height; y++) {
          const x_pos = 0 + x * CELL_SIZE;
          const y_pos = 0 + y * CELL_SIZE;
          engine.rect(x_pos, y_pos, CELL_SIZE, CELL_SIZE, 3);
          engine.rectfill(
            x_pos,
            y_pos,
            CELL_SIZE,
            CELL_SIZE,
            get().grid.getPosition(x, y)
          );
        }
        for (let i = 0; i < 4; i++) {
          engine.rect(
            currentPositions[i].x * CELL_SIZE,
            currentPositions[i].y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE,
            0
          );
          engine.rectfill(
            currentPositions[i].x * CELL_SIZE,
            currentPositions[i].y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE,
            get().activeShape.color
          );
        }
      }
    }
    //display "paused" screen when conditions are met (requirements: 3.3.2)
    function drawPaused() {
      engine.cls(get().grid.bg_color);
      engine.text(62, 150, "PAUSED", GameColor.WHITE, "bold");
      engine.text(0, 180, "press esc to continue", GameColor.WHITE);
    }
    //display "game over" screen when conditions are met (requirements: 3.3.1)
    function drawOver() {
      engine.cls(get().grid.bg_color);

      engine.text(40, 160, "GAME OVER", GameColor.WHITE, "bold");
    }
    //display "start game" message (or similar) when first loaded up (requirements: 3.3.3)
    function drawStart() {
      engine.text(62, 150, "TETRIS", GameColor.WHITE, "bold");
      engine.text(5, 180, "press enter to begin", GameColor.WHITE);
    }

    function draw() {
      switch (get().gamePhase) {
        case GamePhase.ACTIVE:
          drawActive();
          break;
        case GamePhase.PAUSED:
          drawPaused();
          break;
        case GamePhase.OVER:
          drawOver();
          break;
        case GamePhase.START:
          drawStart();
          break;
      }
    }

    return () => {
      engine.quit();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", margin: 0, width: "20vw", height: "100vh" }}
    />
  );
}
