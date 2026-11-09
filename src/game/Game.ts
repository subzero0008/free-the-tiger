import { Application, Container, Sprite, Assets, Text } from 'pixi.js';
import { CONFIG } from '../config';
import { Cage } from './Cage';
import { PipManager } from './PipManager';
import { generateCode } from '../utils/codeGenerator';
import { wait } from '../utils/wait';
import { Bar } from './Bar';

/**
 * Game is the main orchestrator of the application.
 */
export class Game {
  private app: Application;
  private bg: Sprite;
  private root: Container;
  
  private code: number[] = [];
  private currentStep = 0;
  private isAnimating = false;

  private cageObj: Cage;
  private pipManager: PipManager;
  private plate: Sprite;
  private signature: Text;

  constructor(app: Application) {
    this.app = app;
    this.root = new Container();
    this.root.sortableChildren = true;

    // Background (directly on stage)
    this.bg = new Sprite(Assets.get(CONFIG.ASSETS.BG));
    this.bg.anchor.set(0.5);
    this.app.stage.addChild(this.bg);

    // Root container for game elements
    this.app.stage.addChild(this.root);

    // Initialize components
    this.cageObj = new Cage();
    this.pipManager = new PipManager();
    
    this.plate = new Sprite(Assets.get(CONFIG.ASSETS.PLATE));
    this.plate.anchor.set(0.5);
    this.plate.scale.set(CONFIG.LAYOUT.PLATE.SCALE);
    this.plate.zIndex = CONFIG.LAYOUT.PLATE.Z_INDEX;

    this.root.addChild(this.plate);
    this.root.addChild(this.pipManager.container);
    this.root.addChild(this.cageObj.container);

    // Signature
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

    // Attach listeners
    this.cageObj.bars.forEach(bar => {
      bar.on('pointerdown', () => this.handleBarClick(bar));
    });

    this.code = generateCode();
    this.logCode();
    this.layout();
  }

  /**
   * Handles responsive scaling and positioning.
   * Uses exact bounds calculation to ensure no elements are ever cropped.
   */
  public layout() {
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    // 1. Background scaling (cover the entire screen)
    const bgScaleX = screenW / this.bg.texture.width;
    const bgScaleY = screenH / this.bg.texture.height;
    const bgScale = Math.max(bgScaleX, bgScaleY);
    
    this.bg.scale.set(bgScale);
    this.bg.x = screenW / 2;
    this.bg.y = screenH / 2;

    const isPortrait = screenH > screenW;

    // 2. Set logical positions for elements based on orientation
    if (isPortrait) {
      this.plate.position.set(CONFIG.LAYOUT.CAGE.X, CONFIG.PORTRAIT.PLATE_Y); 
      this.pipManager.setPosition(CONFIG.LAYOUT.CAGE.X, CONFIG.PORTRAIT.PLATE_Y);
      this.cageObj.setPortraitLayout(true);
    } else {
      this.plate.position.set(CONFIG.LAYOUT.PLATE.X, CONFIG.LAYOUT.PLATE.Y);
      this.pipManager.setPosition(CONFIG.LAYOUT.PLATE.X, CONFIG.LAYOUT.PLATE.Y);
      this.cageObj.setPortraitLayout(false);
    }

    // 3. Calculate exact bounds of all game elements inside 'root'
    // (Reset scale to 1 temporarily to get accurate local bounds)
    this.root.scale.set(1);
    const bounds = this.root.getLocalBounds();

    // 4. Calculate scale to fit bounds into the screen (with a small safety padding)
    const padding = 0.90; // Uses 90% of screen space to leave a small margin
    const scaleX = (screenW * padding) / bounds.width;
    const scaleY = (screenH * padding) / bounds.height;
    const gameScale = Math.min(scaleX, scaleY);

    this.root.scale.set(gameScale);

    // 5. Center the calculated bounds on the screen
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    this.root.x = (screenW / 2) - (centerX * gameScale);
    this.root.y = (screenH / 2) - (centerY * gameScale);

    // 6. Keep the signature anchored to the bottom-right of the actual screen
    if (this.signature) {
      this.signature.x = screenW - CONFIG.LAYOUT.SIGNATURE.OFFSET_X;
      this.signature.y = screenH - CONFIG.LAYOUT.SIGNATURE.OFFSET_Y;
    }
  }

  private logCode() {
    console.log(`%c🔒 CODE: ${this.code.join(', ')}`, 'color: #ff00ff; font-size: 20px; font-weight: bold;');
  }

  private resetGame() {
    this.code = generateCode();
    this.logCode();
    this.currentStep = 0;
    this.pipManager.reset();
  }

  private handleBarClick(bar: Bar) {
    if (this.isAnimating || bar.isOpen) return;
    
    const expectedId = this.code[this.currentStep];

    if (bar.id === expectedId) {
      bar.open();
      this.currentStep++;
      this.pipManager.markAsOpened(bar.id); 
      
      if (this.currentStep === 6) {
        void this.win();
      }
    } else {
      void this.fail(bar.id);
    }
  }

  private async fail(wrongBarId: number) {
    this.isAnimating = true;
    this.pipManager.markAsFailed(wrongBarId);
    await wait(CONFIG.ANIMATION.FAIL_DELAY);
    await this.cageObj.slamShutOpenBars();
    this.resetGame();
    this.isAnimating = false;
  }

  private async win() {
    this.isAnimating = true;
    await this.cageObj.playWinSequence();
    this.resetGame();
    this.isAnimating = false;
  }
}