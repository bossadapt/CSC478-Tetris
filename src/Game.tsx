import { useEffect, useRef } from "react";
import litecanvas from "litecanvas";
// Tip: litecanvas can render into your own <canvas>
// instead of creating one globally.
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
    let bg: number, grid: number[][];
    const cols = 10,
      rows = 20;
    // this function runs once at the beginning
    function init() {
      bg = 0; // the color #0 (black)
      grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.floor(Math.random() * 5))
      );
      // radius = engine.W / 10; // canvas.width / 10
      //   posx = engine.W / 2; // center X or canvas.width / 2
      //   posy = engine.H / 2; // center Y or canvas.height / 2
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
      // make the circle falls 200 pixels per second
      //TODO
    }

    // put the game rendering in this function
    function draw() {
      let cell_size = engine.W / cols;
      engine.cls(bg);
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const x_pos = 0 + x * cell_size;
          const y_pos = 0 + y * cell_size;
          engine.rect(x_pos, y_pos, cell_size, cell_size, 3);
          engine.rectfill(x_pos, y_pos, cell_size, cell_size, grid[y][x]);
        }
      }

      //engine.text(10, 10, "Tap anywhere");
    }

    // cleanup on unmount
    return () => {
      engine.quit();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", margin: 0, width: "20vw", height: "40vw" }}
      // you can also control CSS size independently of the internal width/height
    />
  );
}
