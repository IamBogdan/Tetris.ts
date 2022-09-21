import { LEFT, RIGHT, LONG, SQUARE, T_SPINS, RIGHT_SNAKE, LEFT_SNAKE, LEFT_GUN, RIGHT_GUN, Playfield } from './constants';

class Tetromino
{
  public x = 0;
  public y = 0;
  public shape: Playfield;
  
  public rotationState = 0; // [0; 3]
  public type: string = '';
  
  constructor(random: number)
  {
    const variations = [
      {type: LONG,        getter: Tetromino.getLong},
      {type: SQUARE,      getter: Tetromino.getSquare},
      {type: T_SPINS,     getter: Tetromino.getTSpins},
      {type: RIGHT_SNAKE, getter: Tetromino.getRightSnake},
      {type: LEFT_SNAKE,  getter: Tetromino.getLeftSnake},
      {type: LEFT_GUN,    getter: Tetromino.getLeftGun},
      {type: RIGHT_GUN,   getter: Tetromino.getRightGun}
    ];

    random = Math.abs(random) % variations.length;

    const variation = variations[random];

    this.type = variation.type;
    this.shape = variation.getter();
  }
  
  static getLong(): Playfield
  {
    let c = LONG;
    return [
      [0,0,0,0],
      [c,c,c,c],
      [0,0,0,0],
      [0,0,0,0]
    ];
  }

  static getSquare(): Playfield
  {
    const c = SQUARE;
    return [
      [c, c],
      [c, c],
    ];
  }

  static getTSpins(): Playfield
  {
    const c = T_SPINS;
    return [
      [0, c, 0],
      [c, c, c],
      [0, 0, 0],
    ];
  }

  static getRightSnake(): Playfield
  {
    const c = RIGHT_SNAKE;
    return [
      [0, c, c],
      [c, c, 0],
      [0, 0, 0],
    ];
  }

  static getLeftSnake(): Playfield
  {
    const c = LEFT_SNAKE;
    return [
      [c, c, 0],
      [0, c, c],
      [0, 0, 0],
    ];
  }

  static getLeftGun(): Playfield
  {
    const c = LEFT_GUN;
    return [
      [0, 0, 0],
      [c, c, c],
      [0, 0, c],
    ];
  }

  static getRightGun(): Playfield
  {
    const c = RIGHT_GUN;
    return [
      [0, 0, 0],
      [c, c, c],
      [c, 0, 0],
    ];
  }

  // direction: -1 - left, +1 - right
  changeRotationState(direction: number)
  {
    const m = 4; // 4 rotation options

    this.rotationState += direction;
    this.rotationState = ((this.rotationState % m) + m) % m; // modulo for negative
  }
  
  // direction: -1 - left, +1 - right
  getRotationTests(direction: number)
  {
    if (this.type === LONG && direction === RIGHT) {
      switch (this.rotationState) {
        case 0: // 0->R
          return [{x: 0, y: 0}, {x: -2, y: 0}, {x: +1, y: 0}, {x: -2, y: +1}, {x: +1, y: -2}];
        case 1: // R->2
          return [{x: 0, y: 0}, {x: -1, y: 0}, {x: +2, y: 0}, {x: -1, y: -2}, {x: +2, y: +1}];
        case 2: // 2->R
          return [{x: 0, y: 0}, {x: +1, y: 0}, {x: -2, y: 0}, {x: +1, y: +2}, {x: -2, y: -1}];
        case 3: // R->0
          return [{x: 0, y: 0}, {x: +2, y: 0}, {x: -1, y: 0}, {x: +2, y: -1}, {x: -1, y: +2}];
        default:
          return [{x: 0, y: 0}];
      }
    }
    else if (this.type === LONG && direction === LEFT) {
      switch (this.rotationState) {
        case 0: // 0->L
          return [{x: 0, y: 0}, {x: -1, y: 0}, {x: +2, y: 0}, {x: -1, y: -2}, {x: +2, y: +1}];
        case 3: // L->2
          return [{x: 0, y: 0}, {x: -2, y: 0}, {x: +1, y: 0}, {x: -2, y: +1}, {x: +1, y: -2}];
        case 2: // 2->L
          return [{x: 0, y: 0}, {x: +2, y: 0}, {x: -1, y: 0}, {x: +2, y: -1}, {x: -1, y: +2}];
        case 1: // L->0
          return [{x: 0, y: 0}, {x: +1, y: 0}, {x: -2, y: 0}, {x: +1, y: +2}, {x: -2, y: -1}];
        default:
          return [{x: 0, y: 0}];
      }
    }

    // for J, L, S, T, Z:

    if (direction === RIGHT) {
      switch (this.rotationState) {
        case 0: // 0->R
          return [{x: 0, y: 0},	{x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: +2},	{x: -1, y: +2}];
        case 1: // R->2
          return [{x: 0, y: 0}, {x: +1, y: 0}, {x: +1, y: +1}, {x: 0, y: -2}, {x: +1, y: -2}];
        case 2: // 2->R
          return [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: +2}, {x: -1, y: +2}];
        case 3: // R->0
          return [{x: 0, y: 0}, {x: +1, y: 0}, {x: +1, y: +1}, {x: 0, y: -2}, {x: +1, y: -2}, {x: -1, y: 0}];
        default:
          return [{x: 0, y: 0}];
      }
    }
    else if (direction === LEFT) {
      switch (this.rotationState) {
        case 0: // 0->L
          return [{x: 0, y: 0}, {x: +1, y: 0}, {x: +1, y: -1}, {x: 0, y: +2}, {x: +1, y: +2}]; 
        case 3: // L->2
          return [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: +1}, {x: 0, y: -2}, {x: -1, y: -2}];
        case 2: // 2->L
          return [{x: 0, y: 0}, {x: +1, y: 0}, {x: +1, y: -1}, {x: 0, y: +2}, {x: +1, y: +2}];
        case 1: // L->0
          return [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: +1}, {x: 0, y: -2}, {x: -1, y: -2}, {x: 1, y: 0}];
        default:
          return [{x: 0, y: 0}];
      }
    }
    return [{x: 0, y: 0}];
  }
}

export { Tetromino };


