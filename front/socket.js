const initSocket = (app, grid, stats) => {
  const socket = io('/');

  const LEFT  = -1;
  const RIGHT = 1;
  const DOWN  = 2;

  socket.on('connect', () => {
    const renderedPlayfields = [];
    let renderedStats = null;
    
    socket.emit('findGame');

    socket.on('returnWin', () => {
      console.log('win!');
    });

    socket.on('returnStatistics', (statistics) => {
      if (renderedStats) {
        app.stage.removeChild(renderedStats);
        renderedStats.destroy();
      }
      
      renderedStats = stats.getStatistics(statistics);
      renderedStats.position.set(window.innerWidth * 0.75, window.innerHeight / 4 - renderedStats.height / 2);
      app.stage.addChild(renderedStats);
    });

    socket.on('returnPlayfields', (playfields) => {
      while(renderedPlayfields.length) {
        const tmpContainer = renderedPlayfields.pop();
        app.stage.removeChild(tmpContainer);
        tmpContainer.destroy({children:true, texture:true, baseTexture:true});
      }

      playfields.forEach((playfield, index) => {
        const container = grid.getGridWithBlocks(playfield);

        // container.position.x = window.innerWidth / 4 - gridWithBlocks.width / 2 + 400 * index;
        container.position.x += 100 + 400 * index;
        container.position.y = window.innerHeight / 2 - container.height / 2;

        app.stage.addChild(container);
        renderedPlayfields.push(container);
      });
    });
  });

  const keyState = {};    
  window.addEventListener('keydown', (event) => {
    if (event.repeat && (event.code === 'KeyQ' || event.code === 'KeyE' || event.code === 'Space'))
      return;
    keyState[event.code] = true;
  });

  window.addEventListener('keyup', (event) => {
    keyState[event.code] = false;
  });

  function controlLoop() {
    if (keyState['KeyA']) {
      socket.emit('moveTetromino', LEFT);
    }
    else if (keyState['KeyD']) {
      socket.emit('moveTetromino', RIGHT);
    }
    else if (keyState['KeyS']) {
      socket.emit('moveTetromino', DOWN);
    }
    else if (keyState['KeyQ']) {
      socket.emit('rotateTetromino', LEFT);
      keyState['KeyQ'] = false;
    }
    else if (keyState['KeyE']) {
      socket.emit('rotateTetromino', RIGHT);
      keyState['KeyE'] = false;
    }
    else if (keyState['Space']) {
      socket.emit('dropHard');
      keyState['Space'] = false;
    }
    
    setTimeout(controlLoop, 70);
  } 
  controlLoop();

  /*
  document.addEventListener('keydown', (event) => {
    if (event.code == 'KeyA') {
      socket.emit('moveTetromino', LEFT);
    }
    else if (event.code == 'KeyD') {
      socket.emit('moveTetromino', RIGHT);
    }
    else if (event.code == 'KeyS') {
      socket.emit('moveTetromino', DOWN);
      socket.emit('moveTetromino', DOWN);
    }
    else if (event.code == 'KeyQ') {
      socket.emit('rotateTetromino', LEFT);
    }
    else if (event.code == 'KeyE') {
      socket.emit('rotateTetromino', RIGHT);
    }
  });*/
}

export { initSocket };