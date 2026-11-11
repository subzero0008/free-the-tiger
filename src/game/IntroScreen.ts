import { Container, Graphics, Text } from 'pixi.js';
import { CONFIG } from '../config';

/**
 * IntroScreen shows the game's story and a Start button.
 * This is the first screen the player sees when the game loads.
 */
export class IntroScreen extends Container {
  private bg: Graphics;
  private onStart: () => void;

  constructor(onStart: () => void) {
    super();
    this.onStart = onStart;
    
    // 1. Background (blocking layer)
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 2. Title
    const title = new Text({
      text: CONFIG.SCREENS.INTRO.TITLE,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 130,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 10 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    title.anchor.set(0.5);
    title.y = -250;
    this.addChild(title);

    // 3. Story text
    const story = new Text({
      text: CONFIG.SCREENS.INTRO.STORY,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 34,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 1300,
        align: 'center',
        lineHeight: 48
      }
    });
    story.anchor.set(0.5);
    story.y = -50;
    this.addChild(story);

    // 4. Start button
    const button = this.createButton(CONFIG.SCREENS.INTRO.START_BUTTON, 0, 220);
    this.addChild(button);
  }

  private createButton(label: string, x: number, y: number): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-220, -55, 440, 110, 20)
      .fill(0x00AEEF)
      .stroke({ color: 0x000000, width: 5 });
    
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 44,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    text.anchor.set(0.5);
    btn.addChild(bg, text);
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => this.onStart());
    btn.on('pointerover', () => { bg.tint = 0x88DDFF; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }

  /** Resize the background to cover the entire screen. */
  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.92 });
  }
}