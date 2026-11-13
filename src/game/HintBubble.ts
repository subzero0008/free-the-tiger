import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class HintBubble {
  public container: Container;
  private button: Container;
  private buttonBg: Graphics;
  private panel: Container;
  private textObj: Text;
  public isOpen = false;
  public onCustomClick?: () => void;

  constructor() {
    const isMobile = window.innerWidth < 768;

    this.container = new Container();
    this.container.zIndex = CONFIG.LAYOUT.HINT_BUBBLE.Z_INDEX;

    this.button = new Container();
    this.buttonBg = new Graphics();
    
    // Иконката е точно колкото зъбното колелце (радиус 35)
    this.buttonBg.circle(0, 0, 35).fill(0x00AEEF).stroke({ color: 0x000000, width: 4 });

    const btnText = new Text({
      text: '?',
      style: { 
        fontFamily: 'Arial', 
        fontSize: 40, 
        fill: 0xFFFFFF, 
        fontWeight: 'bold' 
      }
    });
    btnText.anchor.set(0.5);
    btnText.y = -2;
    this.button.addChild(this.buttonBg, btnText);

    this.panel = new Container();
    const panelBg = new Graphics();
    
    // 👇 Леко намалена ширина (550 вместо 600), за да има отстъп от екрана
    const panelW = isMobile ? 550 : 420;
    const panelH = isMobile ? 200 : 140;
    
    panelBg.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 15)
      .fill(0xFFFFFF)
      .stroke({ color: 0x000000, width: 4 });

    this.textObj = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 40 : 20, 
        fill: 0x000000,
        fontWeight: 'bold',
        wordWrap: true,
        wordWrapWidth: isMobile ? 500 : 380, // 👇 Съобразено с новата ширина
        align: 'center',
        lineHeight: isMobile ? 50 : 26 
      }
    });
    this.textObj.anchor.set(0.5);
    this.panel.addChild(panelBg, this.textObj);

    this.panel.visible = false;
    this.panel.alpha = 0;
    this.panel.scale.set(0.5);
    
    // 👇 ИЗМЕСТВАМЕ ПАНЕЛА ОЩЕ ПО-НАЛЯВО (-250), за да се побере на екрана
    this.panel.x = isMobile ? -250 : -200; 
    this.panel.y = isMobile ? 160 : 140; 

    this.container.addChild(this.panel, this.button);

    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';
    this.button.on('pointerdown', () => {
      if (this.onCustomClick) {
        this.onCustomClick();
      } else {
        this.toggle();
      }
    });

    this.button.on('pointerover', () => {
      gsap.to(this.button.scale, { x: 1.15, y: 1.15, duration: 0.2, ease: 'back.out(2)' });
      this.buttonBg.tint = 0x88DDFF;
    });
    this.button.on('pointerout', () => {
      gsap.to(this.button.scale, { x: 1, y: 1, duration: 0.2, ease: 'back.out(2)' });
      this.buttonBg.tint = 0xFFFFFF;
    });

    this.panel.eventMode = 'static';
  }

  public toggle() {
    if (this.isOpen) this.closePanel();
    else this.openPanel();
  }

  public openPanel() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.panel.visible = true;
    this.panel.alpha = 0;
    this.panel.scale.set(0.5);
    gsap.killTweensOf(this.panel);
    gsap.killTweensOf(this.panel.scale);
    gsap.to(this.panel.scale, { x: 1, y: 1, duration: 0.35, ease: 'back.out(2)' });
    gsap.to(this.panel, { alpha: 1, duration: 0.2 });
  }

  public closePanel() {
    if (!this.isOpen) return;
    this.isOpen = false;
    gsap.killTweensOf(this.panel);
    gsap.killTweensOf(this.panel.scale);
    gsap.to(this.panel.scale, { x: 0.5, y: 0.5, duration: 0.2, ease: 'power2.in' });
    gsap.to(this.panel, {
      alpha: 0,
      duration: 0.2,
      onComplete: () => { this.panel.visible = false; }
    });
  }

  public forceClose() {
    this.isOpen = false;
    gsap.killTweensOf(this.panel);
    gsap.killTweensOf(this.panel.scale);
    this.panel.visible = false;
    this.panel.alpha = 0;
    this.panel.scale.set(0.5);
  }

  public setText(message: string) {
    this.textObj.text = message;
  }
}