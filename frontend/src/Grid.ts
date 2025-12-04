import { Position } from "./Shared";

export class Grid {
  public width: number = 0;
  public height: number = 0;
  public bg_color: number = 0;
  private internalArray: number[][] = [];
  constructor(width: number, height: number, bg_color: number) {
    this.bg_color = bg_color;
    this.width = width;
    this.height = height;
    this.internalArray = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => bg_color)
    );
  }
  getPosition(x: number, y: number): number {
    return this.internalArray[y][x];
  }
  setPosition(x: number, y: number, color: number) {
    this.internalArray[y][x] = color;
  }
  drawPositions2Grid(currentPositions: Position[], color: number) {
    for (let i = 0; i < currentPositions.length; i++) {
      const x = currentPositions[i].x;
      const y = currentPositions[i].y - 1;
      //check if it's even entered the board
      if (y >= 0) {
        // there is something besides an empty space in that grid
        this.internalArray[y][x] = color;
      }
    }
  }
  clearRow(y: number) {
    for (let x = 0; x < this.width; x++) {
      this.setPosition(x, y, this.bg_color);
    }
  }
  clearFinishedRows(): number {
    let rows_cleared = 0;
    for (let y = this.height - 1; y >= 0; y--) {
      let items_in_row = 0;
      for (let x = 0; x < this.width; x++) {
        // check if all are cleared
        if (this.getPosition(x, y) === this.bg_color) {
          break;
        } else {
          items_in_row += 1;
        }
      }
      if (items_in_row === this.width) {
        rows_cleared += 1;
        this.clearRow(y);
      } else {
        // off set the rows not cleared downward
        if (rows_cleared > 0) {
          for (let x = 0; x < this.width; x++) {
            this.setPosition(x, y + rows_cleared, this.getPosition(x, y));
          }
          this.clearRow(y);
        }
      }
    }
    return rows_cleared;
  }
  hasCollided(currentPositions: Position[]): boolean {
    const currentPositionsY = currentPositions.map((pos) => {
      return pos.y;
    });
    const currentPositionsX = currentPositions.map((pos) => {
      return pos.x;
    });
    const currentMinX = Math.min(...currentPositionsX);
    const currentMaxY = Math.max(...currentPositionsY);
    const currentMaxX = Math.max(...currentPositionsX);
    // boundaries check
    if (
      currentMaxX > this.width - 1 ||
      currentMinX < 0 ||
      currentMaxY > this.height - 1
    ) {
      return true;
    }

    // other shapes check
    for (let i = 0; i < currentPositions.length; i++) {
      const x = currentPositions[i].x;
      const y = currentPositions[i].y;
      //check if it's even entered the board
      if (y >= 0) {
        // there is something besides an empty space in that grid
        if (this.getPosition(x, y) !== this.bg_color) {
          return true;
        }
      }
    }
    return false;
  }
}
