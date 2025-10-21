export enum GameColor {
  BLACK = 0,
  DARK_GRAY = 1,
  LIGHT_GRAY = 2,
  WHITE = 3,
  RED = 4,
  YELLOW = 5,
}
export class Position {
  public x: number = 0;
  public y: number = 0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
