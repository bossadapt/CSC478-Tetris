import { GameColor, Position } from "./Shared";

const GENERIC_SHAPE_OFFSETS: Position[][] = [
  // #
  // #
  //[#]
  // #
  [
    new Position(0, 1),
    new Position(0, 0),
    new Position(0, -1),
    new Position(0, 2),
  ],
  //  # #
  // [#]#
  [
    new Position(0, 0),
    new Position(1, 0),
    new Position(0, 1),
    new Position(1, 1),
  ],
  // #
  // #
  //[#]#
  [
    new Position(0, 0),
    new Position(0, 1),
    new Position(0, 2),
    new Position(1, 0),
  ],
  //   #
  //[#]#
  // #
  [
    new Position(0, 0),
    new Position(0, 1),
    new Position(0, -1),
    new Position(1, 1),
  ],
  //  #
  //  #
  //#[#]
  [
    new Position(-1, 0),
    new Position(0, 0),
    new Position(0, 1),
    new Position(0, 2),
  ],
  // #
  //[#]#
  // #
  [
    new Position(0, 1),
    new Position(0, 0),
    new Position(1, 0),
    new Position(0, -1),
  ],
  // #
  //[#]#
  //   #
  [
    new Position(0, 0),
    new Position(1, 0),
    new Position(0, 1),
    new Position(1, -1),
  ],
];

function rotateOffset(rotationIdx: number, x: number, y: number): Position {
  switch (rotationIdx) {
    case 0:
      return new Position(x, y);
    case 1:
      return new Position(y, -x);
    case 2:
      return new Position(-x, -y);
    case 3:
      return new Position(-y, x);
    default:
      return new Position(x, y);
  }
}
// yellow seems to be any color thats not in the range [0-4]
const POSSIBLE_SHAPE_COLORS = [
  GameColor.DARK_GRAY,
  GameColor.LIGHT_GRAY,
  GameColor.RED,
  GameColor.YELLOW,
];
export class ActiveShape {
  public mainPosition: Position = new Position(4, -2);
  public color = -1;
  private shapeChosenIdx: number = 0;
  private rotationIdx: number = 0;
  constructor() {
    this.color =
      POSSIBLE_SHAPE_COLORS[
        Math.floor(Math.random() * POSSIBLE_SHAPE_COLORS.length)
      ].valueOf();
    this.rotationIdx = Math.floor(Math.random() * 4);
    this.shapeChosenIdx = Math.floor(
      Math.random() * GENERIC_SHAPE_OFFSETS.length
    );
    console.log(`Shape Chosen:${this.shapeChosenIdx}`);
  }
  rotate() {
    this.rotationIdx = (this.rotationIdx + 1) % 4;
  }
  peekRotate() {
    const tempRot = (this.rotationIdx + 1) % 4;
    return this.generateCurrentPositions(tempRot);
  }
  peekXMovement(xOffset: number) {
    return this.generateCurrentPositions(undefined, xOffset);
  }
  generateCurrentPositions(rotation?: number, xOffset: number = 0): Position[] {
    let poses: Position[] = [];
    if (rotation === undefined) {
      rotation = this.rotationIdx;
    }
    for (let i = 0; i < 4; i++) {
      let rotatedOffset = rotateOffset(
        rotation,
        GENERIC_SHAPE_OFFSETS[this.shapeChosenIdx][i].x,
        GENERIC_SHAPE_OFFSETS[this.shapeChosenIdx][i].y
      );

      poses.push(
        new Position(
          rotatedOffset.x + this.mainPosition.x + xOffset,
          Math.floor(rotatedOffset.y + this.mainPosition.y)
        )
      );
    }
    return poses;
  }
}
