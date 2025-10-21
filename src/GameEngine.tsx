import { useEffect, useRef } from "react";
import litecanvas from "litecanvas";
import { Position } from "./Shared";
import { GamePhase, useGameStore } from "./GameStore";
const gameStore = useGameStore();
export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = litecanvas({
      canvas: canvasRef.current,
      loop: { init, update, draw },
      width: 200,
      height: 400,
    });

    const CELL_SIZE = engine.W / gameStore.COLS;
    // this function runs once at the beginning
    function init() {
      gameStore.startGame();
    }
    function updateActive(dt: number) {
      gameStore.activeShape.mainPosition.y += dt * gameStore.level;
      if (engine.iskeydown) {
        if (engine && engine.iskeydown("s")) {
          gameStore.activeShape.mainPosition.y += dt * 10;
        }
        const currentPositions =
          gameStore.activeShape.generateCurrentPositions();
        const currentPositionsY = currentPositions.map((pos) => {
          return pos.y;
        });
        const currentMinY = Math.min(...currentPositionsY);
        if (gameStore.grid.hasCollided(currentPositions)) {
          if (currentMinY < 0) {
            gameStore.startGame();
          } else {
            gameStore.moveToNextShape(
              currentPositions,
              gameStore.activeShape.color
            );
          }
        }

        // rotate logic
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("w")
        ) {
          if (!gameStore.grid.hasCollided(gameStore.activeShape.peekRotate()))
            gameStore.activeShape.rotate();
        }

        // x logic
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("a")
        ) {
          if (
            !gameStore.grid.hasCollided(gameStore.activeShape.peekXMovement(-1))
          )
            gameStore.activeShape.mainPosition.x -= 1;
        }
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("d")
        ) {
          if (
            !gameStore.grid.hasCollided(gameStore.activeShape.peekXMovement(1))
          )
            gameStore.activeShape.mainPosition.x += 1;
        }
      }
    }
    function drawActive() {
      const currentPositions = gameStore.activeShape.generateCurrentPositions();
      engine.cls(gameStore.grid.bg_color);
      for (let x = 0; x < gameStore.grid.width; x++) {
        for (let y = 0; y < gameStore.grid.height; y++) {
          const x_pos = 0 + x * CELL_SIZE;
          const y_pos = 0 + y * CELL_SIZE;
          engine.rect(x_pos, y_pos, CELL_SIZE, CELL_SIZE, 3);
          engine.rectfill(
            x_pos,
            y_pos,
            CELL_SIZE,
            CELL_SIZE,
            gameStore.grid.getPosition(x, y)
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
            gameStore.activeShape.color
          );
        }
      }
    }
    function update(dt: number) {
      // auto move down movement
      if (gameStore.gamePhase == GamePhase.ACTIVE) updateActive(dt);
    }

    function draw() {
      if (gameStore.gamePhase == GamePhase.ACTIVE) drawActive();
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
