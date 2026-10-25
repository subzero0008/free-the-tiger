import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

/**
 * PipManager is responsible for the visual status indicators (pips) on the plate.
 * It creates a grid of 6 LEDs that show the player's progress:
 * - White = locked (default)
 * - Green = successfully opened
 * - Red = incorrectly clicked (with a shake animation)
 * 
 * It also handles animations for opening/failing and resetting the pips.
 */
export class PipManager {
  // The container holding all pip graphics, added to the game root
  public container: Container;
  
  // Array of individual pip graphics (6 total)
  private pips: Graphics[] = [];

  constructor() {
    this.container = new Container();
    this.container.zIndex = CONFIG.LAYOUT.PIPS.Z_INDEX;
    this.createPips();
  }

  /**
   * Creates 6 circular pips and arranges them in a 3x2 grid
   * (3 rows, 2 columns) matching the bar layout on the cage.
   */
  private createPips() {
    for (let i = 0; i < 6; i++) {
      const pip = new Graphics();
      
      // Draw a circle with a white fill and black outline
      pip.circle(0, 0, CONFIG.LAYOUT.PIPS.RADIUS)
         .fill(0xFFFFFF) 
         .stroke({ color: 0x000000, width: CONFIG.LAYOUT.PIPS.STROKE_WIDTH });
      
      // Calculate grid position:
      // i = 0, 1, 2 -> col 0 (left), i = 3, 4, 5 -> col 1 (right)
      const col = Math.floor(i / 3);
      const row = i % 3;
      
      pip.x = CONFIG.LAYOUT.PIPS.START_X + col * CONFIG.LAYOUT.PIPS.SPACING_X;
      pip.y = CONFIG.LAYOUT.PIPS.START_Y + row * CONFIG.LAYOUT.PIPS.SPACING_Y;
      
      this.pips.push(pip);
      this.container.addChild(pip);
    }
  }

  /**
   * Moves the entire pip container to the specified position.
   * Used during layout changes (e.g., portrait vs landscape).
   */
  public setPosition(x: number, y: number) {
    this.container.position.set(x, y);
  }

  /**
   * Marks the pip corresponding to the given bar ID as successfully opened.
   * Changes its color to green and plays a "pop" animation.
   * 
   * @param barId - The ID of the opened bar (1-6)
   */
  public markAsOpened(barId: number) {
    const pip = this.pips[barId - 1]; // barId is 1-indexed, array is 0-indexed
    if (pip) {
      pip.tint = 0x00FF00; 
      pip.alpha = 1;
      
      // Pop animation: scale up then back to normal
      gsap.fromTo(pip.scale, 
        { x: CONFIG.ANIMATION.PIP_POP_SCALE, y: CONFIG.ANIMATION.PIP_POP_SCALE }, 
        { x: 1, y: 1, duration: CONFIG.ANIMATION.PIP_POP_DURATION, ease: "back.out(3)" }
      );
    }
  }

  /**
   * Marks the pip corresponding to the given bar ID as failed.
   * Changes its color to red and plays a "shake" animation.
   * 
   * @param barId - The ID of the wrongly clicked bar (1-6)
   */
  public markAsFailed(barId: number) {
    const pip = this.pips[barId - 1];
    if (pip) {
      pip.tint = 0xFF0000; 
      
      // Shake animation: scale up, back to normal, and repeat once
      gsap.fromTo(pip.scale, 
        { x: CONFIG.ANIMATION.FAIL_PIP_SHAKE_SCALE, y: CONFIG.ANIMATION.FAIL_PIP_SHAKE_SCALE }, 
        { x: 1, y: 1, duration: CONFIG.ANIMATION.FAIL_PIP_SHAKE_DURATION, yoyo: true, repeat: 2, ease: "power1.inOut" }
      );
    }
  }

  /**
   * Resets all pips to their default state (white, visible, normal scale).
   * Also kills any running animations on them.
   * Called when the game restarts (after win or fail).
   */
  public reset() {
    this.pips.forEach(pip => {
      pip.tint = 0xFFFFFF; 
      pip.alpha = 1;
      gsap.killTweensOf(pip.scale);
      pip.scale.set(1);
    });
  }
}