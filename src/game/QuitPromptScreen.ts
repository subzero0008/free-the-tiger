import { Container, Graphics, Text } from 'pixi.js';

export class QuitPromptScreen extends Container {
  private bg: Graphics;

  constructor(messageStr: string, onYes: () => void, onNo: () => void) {
    super();
    const isMobile = window.innerWidth < 768;

    // Dark background overlay
    this.bg = new Graphics();
    this.bg.rect(-1920, -1080, 3840, 2160).fill({ color: 0x000000, alpha: 0.8 });
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // Panel
    const panelW = isMobile ? 1500 : 800;
    const panelH = isMobile ? 900 : 400;
    
    const panel = new Graphics();
    panel.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 20)
      .fill(0x222222)
      .stroke({ color: 0xFFFFFF, width: 5 });
    this.addChild(panel);

    // Message
    const message = new Text({
      text: messageStr,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 80 : 32, 
        fill: 0xFFFFFF,
        align: 'center',
        lineHeight: isMobile ? 110 : 45,
        wordWrap: true,
        wordWrapWidth: isMobile ? 1350 : 700 
      }
    });
    message.anchor.set(0.5);
    message.y = isMobile ? -140 : -50; 
    this.addChild(message);

    // Разстояние и позиция за бутоните
    const btnSpacing = isMobile ? 350 : 200;
    const btnY = isMobile ? 220 : 100;

    // Yes Button
    const yesBtn = this.createButton('YES', -btnSpacing, btnY, 0xFF3333, onYes, isMobile);
    this.addChild(yesBtn);

    // No Button
    const noBtn = this.createButton('NO', btnSpacing, btnY, 0x00AEEF, onNo, isMobile);
    this.addChild(noBtn);
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void, isMobile: boolean): Container {
    const btn = new Container();
    
    const w = isMobile ? 450 : 240;
    const h = isMobile ? 160 : 80;

    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 15)
      .fill(color)
      .stroke({ color: 0x000000, width: 4 });
    
    const text = new Text({
      text: label,
      style: { 
        fontFamily: 'Arial, sans-serif', 
        fontSize: isMobile ? 80 : 40, 
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

  // 👇 ТОВА Е МЕТОДЪТ, КОЙТО ЛИПСВАШЕ
  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.8 });
  }
}