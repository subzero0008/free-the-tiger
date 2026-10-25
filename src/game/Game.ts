import { Application, Container, Sprite, Assets, Text } from 'pixi.js';
import { CONFIG } from '../config';
import { Cage } from './Cage';
import { PipManager } from './PipManager';
import { generateCode } from '../utils/codeGenerator';
import { wait } from '../utils/wait';
import { Bar } from './Bar';

/**
 * Game is the main orchestrator of the application.
 * It is responsible for:
 * - Initializing the PIXI stage and root container.
 * - Wiring together the Cage (gameplay objects) and PipManager (UI indicators).
 * - Handling responsive layout (portrait vs landscape).
 * - Managing the game state (current code, progress, animations).
 * - Listening to player input and triggering win/lose sequences.
 */
export class Game {
  private app: Application;
  private bg: Sprite;
  private root: Container;
  
  // The current secret code sequence (e.g., [3, 1, 5, 2, 6, 4])
  private code: number[] = [];
  
  // How many bars the player has opened correctly so far
  private currentStep = 0;
  
  // Blocks input while win/fail animations are playing
  private isAnimating = false;

  private cageObj: Cage;
  private pipManager: PipManager;
  private plate: Sprite;
  private signature: Text;

  constructor(app: Application) {
    this.app = app;
    this.root = new Container();
    this.root.sortableChildren = true;

    // The background is added directly to the stage (not the root) 
    // so it can cover the entire screen without being affected by game scaling.
    this.bg = new Sprite(Assets.get(CONFIG.ASSETS.BG));
    this.bg.anchor.set(0.5);
    this.app.stage.addChild(this.bg);

    // The root container holds all game-related elements
    this.app.stage.addChild(this.root);

    // Initialize the core game components
    this.cageObj = new Cage();
    this.pipManager = new PipManager();
    
    // Create the UI plate that holds the pips
    this.plate = new Sprite(Assets.get(CONFIG.ASSETS.PLATE));
    this.plate.anchor.set(0.5);
    this.plate.scale.set(CONFIG.LAYOUT.PLATE.SCALE);
    this.plate.zIndex = CONFIG.LAYOUT.PLATE.Z_INDEX;

    // Add elements to the root in the correct layering order
    this.root.addChild(this.plate);
    this.root.addChild(this.pipManager.container);
    this.root.addChild(this.cageObj.container);

    // Developer signature (anchored to the bottom-right of the screen)
    this.signature = new Text({
      text: 'Developed by Yulian Yuriev', 
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: CONFIG.LAYOUT.SIGNATURE.FONT_SIZE, 
        fill: 0xFFFFFF, 
        fontWeight: 'normal' 
      }
    });
    this.signature.anchor.set(1, 1); 
    this.app.stage.addChild(this.signature);

    // Attach click listeners to all bars
    this.cageObj.bars.forEach(bar => {
      bar.on('pointerdown', () => this.handleBarClick(bar));
    });

    // Generate the first code and position everything
    this.code = generateCode();
    this.logCode();
    this.layout();
  }

  /**
   * Handles responsive scaling and positioning.
   * Uses a hybrid approach: the background uses 'cover' (Math.max),
   * while the game elements use 'contain' (Math.min) to ensure everything is visible.
   */
  public layout() {
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    // Background scaling (cover the entire screen)
    const bgScaleX = screenW / this.bg.texture.width;
    const bgScaleY = screenH / this.bg.texture.height;
    const bgScale = Math.max(bgScaleX, bgScaleY);
    
    this.bg.scale.set(bgScale);
    this.bg.x = screenW / 2;
    this.bg.y = screenH / 2;

    const isPortrait = screenH > screenW;

    if (isPortrait) {
      // Portrait mode: stack elements vertically for better use of screen space
      const gameScale = screenW / CONFIG.PORTRAIT.SCALE_DIVISOR; 
      this.root.scale.set(gameScale);
      
      this.root.x = (screenW / 2) - (CONFIG.LAYOUT.CAGE.X * gameScale);
      this.root.y = (screenH / 2) + (CONFIG.PORTRAIT.ROOT_Y_OFFSET * gameScale);

      // Move plate above the cage
      this.plate.position.set(CONFIG.LAYOUT.CAGE.X, CONFIG.PORTRAIT.PLATE_Y); 
      this.pipManager.setPosition(CONFIG.LAYOUT.CAGE.X, CONFIG.PORTRAIT.PLATE_Y);
      
      this.cageObj.setPortraitLayout(true);
    } else {
      // Landscape mode: standard side-by-side layout
      const gameScale = Math.min(screenW / CONFIG.DESIGN_WIDTH, screenH / CONFIG.DESIGN_HEIGHT);
      this.root.scale.set(gameScale);
      this.root.x = (screenW - CONFIG.DESIGN_WIDTH * gameScale) / 2;
      this.root.y = (screenH - CONFIG.DESIGN_HEIGHT * gameScale) / 2;

      // Reset plate to the left side
      this.plate.position.set(CONFIG.LAYOUT.PLATE.X, CONFIG.LAYOUT.PLATE.Y);
      this.pipManager.setPosition(CONFIG.LAYOUT.PLATE.X, CONFIG.LAYOUT.PLATE.Y);

      this.cageObj.setPortraitLayout(false);
    }

    // Keep the signature anchored to the bottom-right of the actual screen
    if (this.signature) {
      this.signature.x = screenW - CONFIG.LAYOUT.SIGNATURE.OFFSET_X;
      this.signature.y = screenH - CONFIG.LAYOUT.SIGNATURE.OFFSET_Y;
    }
  }

  /**
   * Prints the current secret code to the browser console.
   */
  private logCode() {
    console.log(`%c🔒 CODE: ${this.code.join(', ')}`, 'color: #ff00ff; font-size: 20px; font-weight: bold;');
  }

  /**
   * Resets the game state (new code, reset step, reset pips).
   * Called after both a win and a fail.
   */
  private resetGame() {
    this.code = generateCode();
    this.logCode();
    this.currentStep = 0;
    this.pipManager.reset();
  }

  /**
   * Handles a click on a specific bar.
   * Checks if the clicked bar matches the next expected number in the code.
   */
  private handleBarClick(bar: Bar) {
    // Ignore clicks if animations are playing or if the bar is already open
    if (this.isAnimating || bar.isOpen) return;
    
    const expectedId = this.code[this.currentStep];

    if (bar.id === expectedId) {
      // Correct click: open the bar, update UI, move to the next step
      bar.open();
      this.currentStep++;
      this.pipManager.markAsOpened(bar.id); 
      
      // If all 6 bars are open, trigger the win sequence
      if (this.currentStep === 6) {
        void this.win();
      }
    } else {
      // Wrong click: trigger the fail sequence
      void this.fail(bar.id);
    }
  }

  /**
   * Plays the fail sequence: highlight the wrong pip, wait,
   * slam all open bars shut, and reset the game.
   */
  private async fail(wrongBarId: number) {
    this.isAnimating = true;

    this.pipManager.markAsFailed(wrongBarId);

    // Let the player see the red pip before resetting
    await wait(CONFIG.ANIMATION.FAIL_DELAY);

    // Slam all currently open bars shut simultaneously
    await this.cageObj.slamShutOpenBars();

    // Generate a new code and reset pips
    this.resetGame();
    this.isAnimating = false;
  }

  /**
   * Plays the win sequence via the Cage class, then resets the game.
   */
  private async win() {
    this.isAnimating = true;
    
    // The Cage class handles the tiger jumping, text popping, and bars slamming
    await this.cageObj.playWinSequence();
    
    // Start a fresh round
    this.resetGame();
    this.isAnimating = false;
  }
}