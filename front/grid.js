import { BLACK } from './constants.js';

class Grid
{
  rows;
  cols;
  color;
  gridContainer;
  blockSize;
  borderWidth;
  crossWidth;

  constructor(rows, cols, blockSize, borderWidth, crossWidth, color)
  {
    // console.log("Grid::constructor");
  
    this.rows        = rows;
    this.cols        = cols;
    this.blockSize   = blockSize;
    this.color       = color;
    this.borderWidth = borderWidth;
    this.crossWidth  = crossWidth;
  }

  // returns container with grid
  getGrid()
  {
    const gridContainer = new PIXI.Container();

    const border = new PIXI.Graphics();
    border.beginFill(BLACK);
    border.lineStyle(this.borderWidth, this.color, 1);

    const sizeX = this.borderWidth + this.blockSize * this.cols + this.crossWidth * (this.cols - 1);
    const sizeY = this.borderWidth + this.blockSize * this.rows + this.crossWidth * (this.rows - 1);
    border.drawRect(0, 0, sizeX, sizeY);

    gridContainer.addChild(border);

    for (let y = 1; y < this.rows; y++) {
      for (let x = 1; x < this.cols; x++) {
        gridContainer.addChild(this.getPlus(this.borderWidth / 2 + this.blockSize * x + this.crossWidth * (x - 1) + this.crossWidth / 2,
                                            this.borderWidth / 2 + this.blockSize * y + this.crossWidth * (y - 1) + this.crossWidth / 2,
                                            this.crossWidth * 4, this.crossWidth));
      }
    }

    this.gridContainer = gridContainer;

    return gridContainer;
  }

  getPlus(startX, startY, distance, width)
  {
    const line = new PIXI.Graphics();

    line.lineStyle(width, this.color, 1);

    line.moveTo(startX - distance, startY);
    line.lineTo(startX + distance, startY);

    line.moveTo(startX, startY + distance);
    line.lineTo(startX, startY - distance);

    return line;
  }

  getBlocks(arr2d)
  {
    const container = new PIXI.Container();
    
    arr2d.forEach((arr, y) => {
      arr.forEach((val, x) => {
        const color = this.pickColor(val);
        const positionX = this.borderWidth / 2 + this.blockSize * x + this.crossWidth * x;
        const positionY = this.borderWidth / 2 + this.blockSize * y + this.crossWidth * y;

        const block = new PIXI.Graphics();

        block.beginFill(color);
        block.drawRect(0, 0, this.blockSize, this.blockSize);
        block.position.set(positionX, positionY);
        
        container.addChild(block);
      });
    });

    return container;
  }

  getGridWithBlocks(arr2d)
  {
    const container = new PIXI.Container();

    container.addChild(this.getGrid());
    container.addChild(this.getBlocks(arr2d));

    return container;
  }

  // returns hex code of color
  pickColor(char)
  {
    switch (char) {
      case 'I': // LONG
        return 0x79B7B8;
      case 'Q': // SQUARE
        return 0xC4C225;
      case 'T': // T_SPINS
        return 0x893EB5;
      case 'S': // RIGHT_SNAKE
        return 0x35AB78;
      case 'Z': // LEFT_SNAKE
        return 0xA62D35;
      case 'J': // LEFT_GUN
        return 0x3C228A;
      case 'L': // RIGHT_GUN
        return 0xBD7524;
      default:
        return BLACK;
    }
  }
}

export { Grid };