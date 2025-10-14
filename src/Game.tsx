import { useEffect, useRef } from "react";
import litecanvas from "litecanvas";
import { Position } from "./Shared";
import { ControlledShape as ControledShape } from "./Shape";
import { Grid } from "./Grid";
export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = litecanvas({
      canvas: canvasRef.current,
      loop: { init, update, draw },
      width: 200,
      height: 400,
    });
    // local game state
    let grid: Grid, currentShape: ControledShape;
    let totalLinesCleared: number, level: number, score: number;
    const COLS = 10,
      ROWS = 20;

    const CELL_SIZE = engine.W / COLS;
    const SCORING_BY_LINE = [100, 300, 500, 800];
    // this function runs once at the beginning
    function init() {
      currentShape = new ControledShape();
      grid = new Grid(COLS, ROWS, 0);
      totalLinesCleared = 0;
      level = 1;
      score = 0;
    }

    function moveToNextShape(currentPositions: Position[], color: number) {
      grid.drawPositions2Grid(currentPositions, color);
      const linesCleared = grid.clearFinishedRows();

      if (linesCleared > 0) {
        score += SCORING_BY_LINE[linesCleared - 1] * level;
        totalLinesCleared += linesCleared;
        level = Math.floor(totalLinesCleared / 10) + 1;
        console.log("LINES_CLEARED:", totalLinesCleared);
        console.log("LEVEL:", level);
        console.log("SCORE:", score);
      }
      currentShape = new ControledShape();
    }
    // this function detect clicks/touches
    // function tapped(x: number, y: number) {
    //   // changes the circle position
    //   // based on the position of the tap
    //   posx = x;
    //   posy = y;
    // }
    function gameOver() {
      grid.reset();
      score = 0;
      level = 1;
      totalLinesCleared = 0;
    }
    function update(dt: number) {
      // auto move down movement
      currentShape.mainPosition.y += dt * level;
      if (engine.iskeydown) {
        if (engine && engine.iskeydown("s")) {
          currentShape.mainPosition.y += dt * 10;
        }
        const currentPositions = currentShape.generateCurrentPositions();
        const currentPositionsY = currentPositions.map((pos) => {
          return pos.y;
        });
        const currentMinY = Math.min(...currentPositionsY);
        if (grid.hasCollided(currentPositions)) {
          if (currentMinY < 0) {
            gameOver();
          } else {
            moveToNextShape(currentPositions, currentShape.color);
          }
        }

        // rotate logic
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("w")
        ) {
          if (!grid.hasCollided(currentShape.peekRotate()))
            currentShape.rotate();
        }

        // x logic
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("a")
        ) {
          if (!grid.hasCollided(currentShape.peekXMovement(-1)))
            currentShape.mainPosition.x -= 1;
        }
        if (
          engine &&
          typeof engine.iskeypressed === "function" &&
          engine.iskeypressed("d")
        ) {
          if (!grid.hasCollided(currentShape.peekXMovement(1)))
            currentShape.mainPosition.x += 1;
        }
      }
    }

    function draw() {
      const currentPositions = currentShape.generateCurrentPositions();
      engine.cls(grid.bg_color);
      for (let x = 0; x < grid.width; x++) {
        for (let y = 0; y < grid.height; y++) {
          const x_pos = 0 + x * CELL_SIZE;
          const y_pos = 0 + y * CELL_SIZE;
          engine.rect(x_pos, y_pos, CELL_SIZE, CELL_SIZE, 3);
          engine.rectfill(
            x_pos,
            y_pos,
            CELL_SIZE,
            CELL_SIZE,
            grid.getPosition(x, y)
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
            currentShape.color
          );
        }
      }

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
