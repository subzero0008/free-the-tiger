import { Application, Assets } from 'pixi.js';
import { Game } from './game/Game';
import { CONFIG } from './config';
import './style.css';

/**
 * Entry point of the application.
 * Initializes the PIXI application, loads all required assets,
 * creates the Game instance, and sets up responsive resizing.
 */
async function init() {
  // Create the PIXI application instance
  const app = new Application();
  
  // Initialize PIXI with settings from the config file.
  // We use window dimensions manually to ensure proper sizing on mobile devices.
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || CONFIG.APP_SETTINGS.FALLBACK_RESOLUTION,
    autoDensity: true,
    backgroundColor: CONFIG.APP_SETTINGS.BACKGROUND_COLOR,
    antialias: CONFIG.APP_SETTINGS.ANTIALIAS,
  });

  // Attach the PIXI canvas to the DOM
  document.body.appendChild(app.canvas);

  try {
    // Preload all game assets (images) before starting the game
    await Assets.load(Object.values(CONFIG.ASSETS));
  } catch (error) {
    // If any asset fails to load, log the error and abort initialization
    console.error("ERROR LOADING ASSETS:", error);
    return;
  }
  
  // Create the main Game instance, passing the PIXI application
  const game = new Game(app);
  
  // Handle window resizing (e.g., resizing the browser or rotating a phone).
  // We manually resize the renderer and update the game layout to keep everything responsive.
  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    game.layout();
  });
}

// Start the application
init();