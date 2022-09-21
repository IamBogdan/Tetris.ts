import { Grid } from './grid.js';
import { GREY, WHITE, FONT } from './constants.js';
import { Statistics } from './statistics.js';
import { initSocket } from './socket.js';

window.addEventListener("load", () => {
  document.fonts.load(`14px ${FONT}`).then((data) => {
    main();
  });
});

function main()
{
  const app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
  const rows = 22;
  const cols = 10;
  const blockSize = 35;
  const borderWidth = 3;
  const crossWidth = 2;

  const grid  = new Grid(rows, cols, blockSize, borderWidth, crossWidth, GREY);
  const stats = new Statistics(FONT, 30, borderWidth, WHITE, 2);

  initSocket(app, grid, stats);
  
  document.body.appendChild(app.view);
  
  // window.addEventListener('resize', resize);

  // function resize() {
  //   app.renderer.resize(window.innerWidth, window.innerHeight);
  //   // gridWithBlocks.position.set(window.innerWidth / 4 - gridWithBlocks.width / 2, window.innerHeight / 2 - gridWithBlocks.height / 2);
  //   // stat.position.set(window.innerWidth * 0.75, window.innerHeight / 4 - stat.height / 2);
  // }

  // resize();
}