import { Container, Graphics, Text } from 'pixi.js';
import { CONFIG } from '../config';

export class IntroScreen extends Container {
  private bg: Graphics;

  constructor(onStart: () => void) {
    super();
    
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

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
    title.y = -320;
    this.addChild(title);

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
    story.y = -80;
    this.addChild(story);

    // Само един бутон на Intro
    const btnStart = this.createButton(CONFIG.SCREENS.INTRO.START_BUTTON, 0, 260, 0x00AEEF, onStart);
    this.addChild(btnStart);
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-200, -55, 400, 110, 20).fill(color).stroke({ color: 0x000000, width: 5 });
    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 40, fill: 0xFFFFFF, fontWeight: 'bold', stroke: { color: 0x000000, width: 4 } }
    });
    text.anchor.set(0.5);
    btn.addChild(bg, text);
    btn.position.set(x, y);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => { bg.tint = 0xCCCCCC; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.92 });
  }
}