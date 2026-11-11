import { Container, Graphics, Text } from 'pixi.js';

/**
 * LevelIntro is a reusable overlay that shows level information
 * (title, subtitle, instructions) with a "Ready" button before gameplay starts.
 */
export class LevelIntro extends Container {
  private bg: Graphics;

  constructor(
    title: string,
    subtitle: string,
    instructions: string,
    buttonLabel: string,
    onReady: () => void
  ) {
    super();
    
    // 1. Background (blocking layer)
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 2. Title
    const titleText = new Text({
      text: title,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 140,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 10 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    titleText.anchor.set(0.5);
    titleText.y = -280;
    this.addChild(titleText);

    // 3. Subtitle
    const subtitleText = new Text({
      text: subtitle,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 54,
        fill: 0x00FFAA,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 5 }
      }
    });
    subtitleText.anchor.set(0.5);
    subtitleText.y = -140;
    this.addChild(subtitleText);

    // 4. Instructions
    const instructionsText = new Text({
      text: instructions,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 1300,
        align: 'center',
        lineHeight: 46
      }
    });
    instructionsText.anchor.set(0.5);
    instructionsText.y = 20;
    this.addChild(instructionsText);

    // 5. Ready button
    const button = this.createButton(buttonLabel, 0, 240, onReady);
    this.addChild(button);
  }

  private createButton(label: string, x: number, y: number, onClick: () => void): Container {
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
    btn.on('pointerdown', () => onClick());
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