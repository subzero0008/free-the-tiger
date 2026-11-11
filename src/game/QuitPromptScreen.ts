import { Container, Graphics, Text } from 'pixi.js';

export class QuitPromptScreen extends Container {
  private bg: Graphics;

  constructor(onYes: () => void, onNo: () => void) {
    super();

    // Dark background overlay
    this.bg = new Graphics();
    this.bg.rect(-1920, -1080, 3840, 2160).fill({ color: 0x000000, alpha: 0.8 });
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // Panel
    const panel = new Graphics();
    panel.roundRect(-400, -200, 800, 400, 20)
      .fill(0x222222)
      .stroke({ color: 0xFFFFFF, width: 5 });
    this.addChild(panel);

    // Message
    const message = new Text({
      text: "No more hints. If you want to know the answer,\ncontact the creator Yulian Yuriev.\n\nDo you want to quit?",
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        fill: 0xFFFFFF,
        align: 'center',
        lineHeight: 45
      }
    });
    message.anchor.set(0.5);
    message.y = -50;
    this.addChild(message);

    // Yes Button
    const yesBtn = this.createButton('YES', -200, 100, 0xFF3333, onYes);
    this.addChild(yesBtn);

    // No Button
    const noBtn = this.createButton('NO', 200, 100, 0x00AEEF, onNo);
    this.addChild(noBtn);
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-120, -40, 240, 80, 15)
      .fill(color)
      .stroke({ color: 0x000000, width: 4 });
    
    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial', fontSize: 40, fill: 0xFFFFFF, fontWeight: 'bold' }
    });
    text.anchor.set(0.5);
    btn.addChild(bg, text);
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => { bg.tint = 0x888888; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }
}