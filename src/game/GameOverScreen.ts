import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class GameOverScreen extends Container {
  private bg: Graphics;
  private sadEmoji: Text; // Store reference for cleanup

  constructor(titleStr: string, messageStr: string, onPlayAgain: () => void) {
    super();
    
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    this.sadEmoji = new Text({
      text: '😭',
      style: { fontFamily: 'Arial', fontSize: 250 }
    });
    this.sadEmoji.anchor.set(0.5);
    this.sadEmoji.y = -50;
    this.sadEmoji.alpha = 0.15;
    this.addChild(this.sadEmoji);

    gsap.to(this.sadEmoji, { y: '-=30', duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to(this.sadEmoji.scale, { x: 1.1, y: 1.1, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    const title = new Text({
      text: titleStr,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 120,
        fill: 0xFF3333,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 10 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    title.anchor.set(0.5);
    title.y = -200;
    this.addChild(title);

    gsap.fromTo(title.scale, { x: 1.2, y: 1.2 }, { x: 1, y: 1, duration: 0.6, ease: "bounce.out" });

    const message = new Text({
      text: messageStr,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 36,
        fill: 0xFFFFFF,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 1000,
        lineHeight: 50,
        stroke: { color: 0x000000, width: 4 }
      }
    });
    message.anchor.set(0.5);
    message.y = -50;
    this.addChild(message);

    const demoText = new Text({
      text: CONFIG.GAME_OVER.DEMO,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 24, fill: 0xAAAAAA, align: 'center', fontStyle: 'italic' }
    });
    demoText.anchor.set(0.5);
    demoText.y = 80;
    this.addChild(demoText);

    const creditsText = new Text({
      text: CONFIG.GAME_OVER.CREATOR,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 20, fill: 0x888888, align: 'center', lineHeight: 30 }
    });
    creditsText.anchor.set(0.5);
    creditsText.y = 150;
    this.addChild(creditsText);

    const button = this.createButton(CONFIG.GAME_OVER.PLAY_AGAIN, 0, 280, onPlayAgain);
    this.addChild(button);
  }

  private createButton(label: string, x: number, y: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-220, -55, 440, 110, 20).fill(0xFF3333).stroke({ color: 0x000000, width: 5 });
    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 44, fill: 0xFFFFFF, fontWeight: 'bold', stroke: { color: 0x000000, width: 4 } }
    });
    text.anchor.set(0.5);
    btn.addChild(bg, text);
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => { bg.tint = 0xFF8888; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.95 });
  }

  // FIX: Kill ALL infinite tweens before destruction!
  public destroy(options?: any): void {
    if (this.sadEmoji) {
      gsap.killTweensOf(this.sadEmoji);
      gsap.killTweensOf(this.sadEmoji.scale);
    }
    super.destroy(options);
  }
}