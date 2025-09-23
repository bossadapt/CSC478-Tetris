class Position {
  public x: number = 0;
  public y: number = 0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
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

export class Player {
  public mainPosition: Position = new Position(5, 5);
  private shapeChosenIdx: number = 0;
  private rotationIdx: number = 0;
  constructor() {
    this.shapeChosenIdx = Math.floor(
      Math.random() * GENERIC_SHAPE_OFFSETS.length
    );
    console.log(`Shape Chosen:${this.shapeChosenIdx}`);
  }
  rotate() {
    this.rotationIdx = (this.rotationIdx + 1) % 4;
  }
  generateCurrentPositions(): Position[] {
    let poses: Position[] = [];
    for (let i = 0; i < 4; i++) {
      let rotatedOffset = rotateOffset(
        this.rotationIdx,
        GENERIC_SHAPE_OFFSETS[this.shapeChosenIdx][i].x,
        GENERIC_SHAPE_OFFSETS[this.shapeChosenIdx][i].y
      );

      poses.push(
        new Position(
          rotatedOffset.x + this.mainPosition.x,
          rotatedOffset.y + this.mainPosition.y
        )
      );
    }
    return poses;
  }
}
