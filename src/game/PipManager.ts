import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

/**
 * PipManager handles only the 6 LED indicator dots on the plate.
 * The pips show progress: white = locked, green = opened correctly.
 * Puzzle text is now shown by PuzzleDisplay.
 */
export class PipManager {
  public container: Container;
  private pips: Graphics[] = [];

  constructor() {
    this.container = new Container();
    this.container.zIndex = CONFIG.LAYOUT.PIPS.Z_INDEX;
    this.createPips();
  }

  private createPips() {
    for (let i = 0; i < 6; i++) {
      const pip = new Graphics();
      pip.circle(0, 0, CONFIG.LAYOUT.PIPS.RADIUS)
        .fill(0xFFFFFF)
        .stroke({ color: 0x000000, width: CONFIG.LAYOUT.PIPS.STROKE_WIDTH });

      const col = Math.floor(i / 3);
      const row = i % 3;

      pip.x = CONFIG.LAYOUT.PIPS.START_X + col * CONFIG.LAYOUT.PIPS.SPACING_X;
      pip.y = CONFIG.LAYOUT.PIPS.START_Y + row * CONFIG.LAYOUT.PIPS.SPACING_Y;

      this.pips.push(pip);
      this.container.addChild(pip);
    }
  }

  public setPosition(x: number, y: number) {
    this.container.position.set(x, y);
  }

  public markAsOpened(barId: number) {
    const pip = this.pips[barId - 1];
    if (pip) {
      pip.tint = 0x00FF00;
      pip.alpha = 1;
      gsap.fromTo(pip.scale,
        { x: CONFIG.ANIMATION.PIP_POP_SCALE, y: CONFIG.ANIMATION.PIP_POP_SCALE },
        { x: 1, y: 1, duration: CONFIG.ANIMATION.PIP_POP_DURATION, ease: 'back.out(3)' }
      );
    }
  }

  public markAsFailed(barId: number) {
    const pip = this.pips[barId - 1];
    if (pip) {
      pip.tint = 0xFF0000;
      gsap.fromTo(pip.scale,
        { x: CONFIG.ANIMATION.FAIL_PIP_SHAKE_SCALE, y: CONFIG.ANIMATION.FAIL_PIP_SHAKE_SCALE },
        { x: 1, y: 1, duration: CONFIG.ANIMATION.FAIL_PIP_SHAKE_DURATION, yoyo: true, repeat: 2, ease: 'power1.inOut' }
      );
    }
  }

  public reset() {
    this.pips.forEach(pip => {
      pip.tint = 0xFFFFFF;
      pip.alpha = 1;
      gsap.killTweensOf(pip.scale);
      pip.scale.set(1);
    });
  }
}