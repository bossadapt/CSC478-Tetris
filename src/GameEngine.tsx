import { useEffect, useRef } from "react";
import litecanvas from "litecanvas";
import { Position } from "./Shared";
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
    function init() {
      get().startGame();
    }
    function updateActive(dt: number) {
      get().activeShape.mainPosition.y += dt * get().level;
      if (engine.iskeydown) {
        if (engine && engine.iskeydown("s")) {
          get().activeShape.mainPosition.y += dt * 10;
        }
        const currentPositions = get().activeShape.generateCurrentPositions();
        const currentPositionsY = currentPositions.map((pos) => {
          return pos.y;
        });
        const currentMinY = Math.min(...currentPositionsY);
        if (get().grid.hasCollided(currentPositions)) {
          if (currentMinY < 0) {
            get().startGame();
          } else {
            get().moveToNextShape(currentPositions, get().activeShape.color);
          }
        }

        // rotate logic
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("w")
        ) {
          if (!get().grid.hasCollided(get().activeShape.peekRotate()))
            get().activeShape.rotate();
        }

        // x logic
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("a")
        ) {
          if (!get().grid.hasCollided(get().activeShape.peekXMovement(-1)))
            get().activeShape.mainPosition.x -= 1;
        }
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("d")
        ) {
          if (!get().grid.hasCollided(get().activeShape.peekXMovement(1)))
            get().activeShape.mainPosition.x += 1;
        }
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
    function update(dt: number) {
      // auto move down movement
      if (get().gamePhase == GamePhase.ACTIVE) updateActive(dt);
    }

    function draw() {
      if (get().gamePhase == GamePhase.ACTIVE) drawActive();
      //engine.text(10, 10, "Tap anywhere");
    }

    return () => {
      engine.quit();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", margin: 0, width: "20vw", height: "40vw" }}
    />
  );
}
