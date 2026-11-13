import { Container, Graphics, Text } from 'pixi.js';

export class HintPromptScreen extends Container {
  private bg: Graphics;

  constructor(hintsRemaining: number, maxHints: number, onYes: () => void, onNo: () => void) {
    super();
    const isMobile = window.innerWidth < 768;

    this.bg = new Graphics();
    this.bg.rect(-1920, -1080, 3840, 2160).fill({ color: 0x000000, alpha: 0.8 });
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 👇 Увеличен панел за мобилно
    const panelW = isMobile ? 1400 : 700;
    const panelH = isMobile ? 700 : 300;

    const panel = new Graphics();
    panel.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 20)
      .fill(0x222222)
      .stroke({ color: 0xFFFFFF, width: 5 });
    this.addChild(panel);

    // 👇 Увеличен текст за мобилно
    const message = new Text({
      text: `Do you want to use a hint (${hintsRemaining}/${maxHints})?`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 70 : 36, 
        fill: 0xFFFFFF,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: isMobile ? 1200 : 600,
        lineHeight: isMobile ? 90 : 45 // Добавена разредка за мобилно
      }
    });
    message.anchor.set(0.5);
    message.y = isMobile ? -120 : -20; // Местим текста по-нагоре
    this.addChild(message);

    // 👇 Позиции за бутоните (раздалечени за мобилно)
    const btnSpacing = isMobile ? 350 : 150;
    const btnY = isMobile ? 180 : 80;

    const yesBtn = this.createButton('YES', -btnSpacing, btnY, 0x00AEEF, onYes, isMobile);
    this.addChild(yesBtn);

    const noBtn = this.createButton('NO', btnSpacing, btnY, 0xFF3333, onNo, isMobile);
    this.addChild(noBtn);
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void, isMobile: boolean): Container {
    const btn = new Container();
    
    // 👇 Увеличен размер на бутоните за мобилно
    const w = isMobile ? 450 : 200;
    const h = isMobile ? 160 : 80;

    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 15)
      .fill(color)
      .stroke({ color: 0x000000, width: 4 });
    
    const text = new Text({
      text: label,
      style: { 
        fontFamily: 'Arial', 
        fontSize: isMobile ? 80 : 36, // 👇 По-голям текст в бутона
        fill: 0xFFFFFF, 
        fontWeight: 'bold' 
      }
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