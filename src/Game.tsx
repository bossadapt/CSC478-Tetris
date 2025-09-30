import { useEffect, useRef } from "react";
import litecanvas from "litecanvas";
import { ControlledShape as ControledShape, Position } from "./localTypes";
// instead of creating one globally.'
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
    let bg: number, grid: number[][], currentShape: ControledShape;
    const COLS = 10,
      ROWS = 20;

    const CELL_SIZE = engine.W / COLS;
    // this function runs once at the beginning
    function init() {
      bg = 0; // the color #0 (black)
      currentShape = new ControledShape();
      grid = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => 3)
      );
    }
    function moveToNextShape(currentPositions: Position[], color: number) {
      //draw shape to board
      for (let i = 0; i < currentPositions.length; i++) {
        const x = currentPositions[i].x;
        const y = Math.ceil(currentPositions[i].y) - 1;
        //check if it's even entered the board
        if (y > 0) {
          // there is something becides an empty space in that grid
          grid[y][x] = color;
        }
      }
      // clear out lines that are done
      // TODO: go line by line and drop the blocks down if a line is cleared
      // for (let y = 0; y < ROWS; y++) {
      //   for(let x = )
      // }
      // spawn in the next one
      currentShape = new ControledShape();
    }

    function hasCollided(currentPositions: Position[]): boolean {
      const currentPositionsY = currentPositions.map((pos) => {
        return pos.y;
      });
      const currentPositionsX = currentPositions.map((pos) => {
        return pos.x;
      });
      const currentMinX = Math.min(...currentPositionsX);
      const currentMaxY = Math.ceil(Math.max(...currentPositionsY));
      const currentMaxX = Math.max(...currentPositionsX);
      // boundaries check
      if (currentMaxX > COLS - 1 || currentMinX < 0 || currentMaxY > ROWS - 1) {
        return true;
      }

      // other shapes check
      for (let i = 0; i < currentPositions.length; i++) {
        const x = currentPositions[i].x;
        const y = Math.ceil(currentPositions[i].y);
        //check if it's even entered the board
        if (y > 0) {
          // there is something becides an empty space in that grid
          if (grid[y][x] !== 3) {
            return true;
          }
        }
      }
      return false;
    }
    // this function detect clicks/touches
    // function tapped(x: number, y: number) {
    //   // changes the circle position
    //   // based on the position of the tap
    //   posx = x;
    //   posy = y;
    // }
    // put the game logic in this function
    function update(dt: number) {
      // y logic
      currentShape.mainPosition.y += dt * 1;
      if (
        engine &&
        typeof engine.iskeydown === "function" &&
        engine.iskeydown("s")
      ) {
        currentShape.mainPosition.y += dt * 5;
      }
      const currentPositions = currentShape.generateCurrentPositions();
      if (hasCollided(currentPositions)) {
        moveToNextShape(currentPositions, currentShape.color);
      }

      // rotate logic
      if (
        engine &&
        typeof engine.iskeypressed === "function" &&
        engine.iskeypressed("w")
      ) {
        if (!hasCollided(currentShape.peekRotate())) currentShape.rotate();
      }

      // x logic
      if (
        engine &&
        typeof engine.iskeypressed === "function" &&
        engine.iskeypressed("a")
      ) {
        if (!hasCollided(currentShape.peekXMovement(-1)))
          currentShape.mainPosition.x -= 1;
      }
      if (
        engine &&
        typeof engine.iskeypressed === "function" &&
        engine.iskeypressed("d")
      ) {
        if (!hasCollided(currentShape.peekXMovement(1)))
          currentShape.mainPosition.x += 1;
      }
    }

    function draw() {
      const currentPositions = currentShape.generateCurrentPositions();
      engine.cls(bg);
      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          const x_pos = 0 + x * CELL_SIZE;
          const y_pos = 0 + y * CELL_SIZE;
          engine.rect(x_pos, y_pos, CELL_SIZE, CELL_SIZE, 3);
          engine.rectfill(x_pos, y_pos, CELL_SIZE, CELL_SIZE, grid[y][x]);
        }
        for (let i = 0; i < 4; i++) {
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
