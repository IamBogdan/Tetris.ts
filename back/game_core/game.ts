import seedrandom from 'seedrandom';
import { Tetromino } from './tetromino';
import { LEFT, DOWN, RIGHT, Playfield } from './constants';

class Game
{
  static scoreByLines = [0, 50, 200, 800, 1600]; // index = lines

  private cols   = 10; // the standard number of columns in Tetris
  private rows   = 22; // the standard number of rows in Tetris
  private score  = 0;
  private lines  = 0;
  private isLost = false;
  private playfield: Playfield;
  private randomGenerator: seedrandom.PRNG;
  private currentTetromino?: Tetromino;
  
  /**
   * Creates an instance of Game.
   * @param seed - seed for generating the tetrominos
   * @param rows - number of rows of the playfield that will be created (min val - 23, std val - 22)
   * @param cols - number of cols of the playfield that will be created (min val - 11, std val - 10)
   * @memberof Game
   */
  constructor(seed: string, rows = 0, cols = 0)
  {
    this.rows = (rows > this.rows) ? rows : this.rows;
    this.cols = (cols > this.cols) ? cols : this.cols;
    
    this.playfield = Array.from(Array(this.rows), () => new Array(this.cols).fill(0));

    this.randomGenerator = seedrandom(seed);
    
    this.spawnNewTetromino();
  }

  getScore(): number
  {
    return this.score;
  }

  getLines(): number
  {
    return this.lines;
  }

  getIsLostGame(): boolean
  {
    return this.isLost;
  }

  /**
   * Counts and returns the current level relative to the number of lines destroyed 
   * @returns the current level relative to the number of lines destroyed
   * @memberof Game
   */
  getLevel(): number
  {
    const numLinesForNextLevel = 5;
    return Math.floor(1 + this.lines / numLinesForNextLevel);
  }

  /**
   * Returns the copy of the playfield
   * @returns the copy of the playfield
   * @memberof Game
   */
   getPlayfield(): Playfield
   {
     return structuredClone(this.playfield);
   }

  /**
   * Moves the tetromino and inserts it into the playfield, if it is possible
   * @param direction - the direction in which the tetramino will be moved
   * @memberof Game
   */
  moveTetromino(direction: number)
  {
    if (!this.currentTetromino || this.isLost) {
      console.log('Game::moveTetromino');
      return;
    }

    this.clearTetrominoOnPlayfield();

    if (direction === RIGHT) {
      this.currentTetromino.x += Number(this.allowNextPosition(1, 0));
    }
    else if (direction === LEFT) {
      this.currentTetromino.x -= Number(this.allowNextPosition(-1, 0));
    }
    else if (direction === DOWN) {
      const allow = this.allowNextPosition(0, 1);
      this.currentTetromino.y += Number(allow);

      if (!allow) { // next is the block or the floor
        this.insertTetrominoIntoPlayfield();
        this.changeStats(this.clearLines());
        
        if (this.checkLost()) {
          return;
        }

        this.spawnNewTetromino();
        return;
      }
    }
    
    this.insertTetrominoIntoPlayfield();
  }

  /**
   * Performs a hard drop
   * @memberof Game
   */
  dropHard()
  {
    if (this.isLost || !this.currentTetromino) {
      return;
    }

    this.clearTetrominoOnPlayfield();

    while(this.allowNextPosition(0, 1)) {
      this.currentTetromino.y += 1;
    }

    this.moveTetromino(DOWN);
    // while (!this.moveTetromino(DOWN)) {}
  }

  /**
   * Checks the "vanish zone". Sets isLost to true if there is a block of the tetromino in the "vanish zone"
   * @returns if the game is lost or not (isLost)
   * @memberof Game
   */
  checkLost(): boolean
  {
    const vanishZone = this.playfield[1];

    for (let block of vanishZone) {
      if (block) {
        this.isLost = true;
        return this.isLost;
      }
    }
    return this.isLost;
  }

  /**
   * Spawns the tetromino and if it cannot be placed on the playfield, sets isLost to true
   * @private
   * @memberof Game
   */
  private spawnNewTetromino()
  {
    if (this.isLost) {
      console.log('Game::spawnNewTetromino');
      return;
    }

    this.currentTetromino = new Tetromino(this.randomGenerator.int32());

    if (!this.allowNextPosition(0, 0)) { // game over
      this.isLost = true;
      return;
    }
    
    this.insertTetrominoIntoPlayfield();
  }

  /**
   * Checks for free space relative to the current tetromino
   * @private
   * @param offsetX - offset relative to the current tetromino's x position
   * @param offsetY - offset relative to the current tetromino's y position
   * @returns false - if collision is detected, true - if it is free space
   * @memberof Game
   */
  private allowNextPosition(offsetX: number, offsetY: number): boolean
  {
    if (!this.currentTetromino) {
      console.log('Game::allowNextPosition');
      return false;
    }

    const posX = this.currentTetromino.x;
    const posY = this.currentTetromino.y;
    const shape = this.currentTetromino.shape;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const nextX = posX + x;
        const nextY = posY + y;

        if (shape[y][x] &&
            ((this.playfield[nextY + offsetY] === undefined || this.playfield[nextY + offsetY][nextX + offsetX] === undefined)
            || this.playfield[nextY + offsetY][nextX + offsetX])
            ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Rotates the current tetromino with the wallkick and inserts it into the playfield, if it is possible
   * @param direction - the direction in which the tetramino will be rotated
   * @memberof Game
   */
  rotateTetrominoWallkick(direction: number)
  {
    if (this.isLost || !this.currentTetromino) {
      console.log('Game::rotateTetrominoWallkick');
      return;
    }

    const shape = this.currentTetromino.shape;
    const x = Math.floor(shape.length / 2);
    const y = shape.length - 1;
    const tests = this.currentTetromino.getRotationTests(direction);

    const oldShape = shape.map((arr) => { // copy
      return arr.slice();
    });

    this.clearTetrominoOnPlayfield();

    // TODO: Move to the Tetromino class?
    for (let i = 0; i < x; i++) {
       for (let j = i; j < y - i; j++) {
          const temp = shape[i][j];
          if (direction === RIGHT) {
            shape[i][j] = shape[y - j][i];
            shape[y - j][i] = shape[y - i][y - j];
            shape[y - i][y - j] = shape[j][y - i];
            shape[j][y - i] = temp;
          }
          else {
            shape[i][j] = shape[j][y - i];
            shape[j][y - i] = shape[y - i][y - j];
            shape[y - i][y - j] = shape[y - j][i];
            shape[y - j][i] = temp;
          }
       }
    }
    
    for (let test of tests) {
      if (this.allowNextPosition(test.x, test.y)) {
        this.currentTetromino.x += test.x;
        this.currentTetromino.y += test.y;
        
        this.currentTetromino.changeRotationState(direction);

        this.insertTetrominoIntoPlayfield();
        return;
      }
    }

    this.currentTetromino.shape = oldShape;
    
    this.insertTetrominoIntoPlayfield();
  }

  /**
   * Removes the current tetromino from the playfield
   * @private
   * @memberof Game
   */
  private clearTetrominoOnPlayfield()
  {
    if (!this.currentTetromino) {
      console.log('Game::clearTetrominoOnPlayfield');
      return;
    }

    const posX = this.currentTetromino.x;
    const posY = this.currentTetromino.y;
    const shape = this.currentTetromino.shape;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && 
            this.playfield[posY + y] !== undefined && 
            this.playfield[posY + y][posX + x] !== undefined) {
          this.playfield[posY + y][posX + x] = 0;
        }
      }
    }
  }


  /**
   * Inserts the current tetromino into the playfield
   * @private
   * @memberof Game
   */
  private insertTetrominoIntoPlayfield()
  {
    if (!this.currentTetromino){
      console.log('Game::insertTetrominoIntoPlayfield');
      return;
    }

    const posX = this.currentTetromino.x;
    const posY = this.currentTetromino.y;
    const shape = this.currentTetromino.shape;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] &&
            this.playfield[posY] !== undefined && 
            this.playfield[posY][posX + x] !== undefined) {
          this.playfield[posY + y][posX + x] = shape[y][x];
        }
      }
    }
  }

  /**
   * Clears rows in the current tetromino's location range
   * @private
   * @returns the number of deleted lines
   * @memberof Game
   */
  private clearLines(): number
  {
    if (!this.currentTetromino) {
      console.log('Game::clearLines');
      return 0;
    }

    const topY = this.currentTetromino.y;
    const bottomY = topY + this.currentTetromino.shape.length;
    const lines = [];

    for (let y = topY; y < bottomY; y++) {
      if (this.playfield[y] === undefined)
        break;

      const len = this.playfield[y].length;
      let count = 0;
      for (let x = 0; x < len; x++) {
        if (this.playfield[y][x] === 0)
          break;

        if (++count >= len) {
          lines.push(y);
          break;
        }
      }
    }

    for (let line of lines) {
      this.playfield.splice(line, 1); // removes the line
      this.playfield.unshift(new Array(this.cols).fill(0)); // adds a new line with zeros
    }

    return lines.length;
  }

  /**
   * Changes the score depending on the level, changes the number of deleted lines
   * @private
   * @param lineCount - the number of deleted lines 
   * @memberof Game
   */
  private changeStats(lineCount: number)
  {
    if (lineCount >= 0 && lineCount < Game.scoreByLines.length) {
      this.lines += lineCount;
      this.score += Game.scoreByLines[lineCount] * this.getLevel();
    }
  } 
}

export { Game, Playfield };