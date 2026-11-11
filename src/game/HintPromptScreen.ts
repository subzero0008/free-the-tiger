import { Container, Graphics, Text } from 'pixi.js';

export class HintPromptScreen extends Container {
  private bg: Graphics;

  constructor(hintsRemaining: number, maxHints: number, onYes: () => void, onNo: () => void) {
    super();

    this.bg = new Graphics();
    this.bg.rect(-1920, -1080, 3840, 2160).fill({ color: 0x000000, alpha: 0.8 });
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    const panel = new Graphics();
    panel.roundRect(-350, -150, 700, 300, 20)
      .fill(0x222222)
      .stroke({ color: 0xFFFFFF, width: 5 });
    this.addChild(panel);

    const message = new Text({
      text: `Do you want to use a hint (${hintsRemaining}/${maxHints})?`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 36,
        fill: 0xFFFFFF,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 600
      }
    });
    message.anchor.set(0.5);
    message.y = -20;
    this.addChild(message);

    const yesBtn = this.createButton('YES', -150, 80, 0x00AEEF, onYes);
    this.addChild(yesBtn);

    const noBtn = this.createButton('NO', 150, 80, 0xFF3333, onNo);
    this.addChild(noBtn);
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-100, -40, 200, 80, 15)
      .fill(color)
      .stroke({ color: 0x000000, width: 4 });
    
    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial', fontSize: 36, fill: 0xFFFFFF, fontWeight: 'bold' }
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

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.8 });
  }
}