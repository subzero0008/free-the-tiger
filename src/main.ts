import { Application, Assets } from 'pixi.js';
import { Game } from './game/Game';
import { CONFIG } from './config';
import './style.css';

async function init() {
  const app = new Application();
  
  await app.init({
    width: window.innerWidth,   // Manually set the width
    height: window.innerHeight, // Manually set the height
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x000000,
    antialias: true,
  });

  document.body.appendChild(app.canvas);

  try {
    await Assets.load(Object.values(CONFIG.ASSETS));
  } catch (error) {
    console.error("ERROR LOADING ASSETS:", error);
    return;
  }
  
  const game = new Game(app);
  
  // On window resize (or phone rotation), manually resize the renderer and update the layout
  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    game.layout();
  });
}

init();