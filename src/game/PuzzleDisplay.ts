import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class PuzzleDisplay extends Container {
  private panel: Graphics;
  private titleText: Text;
  private contentText: Text;
  private isMobile: boolean;

  constructor() {
    super();
    this.isMobile = window.innerWidth < 768;
    this.visible = false;
    this.zIndex = CONFIG.LAYOUT.PUZZLE_DISPLAY.Z_INDEX;

    // 👇 Уголемяваме панела за мобилно (беше 440x220)
    const panelW = this.isMobile ? 800 : 440;
    const panelH = this.isMobile ? 400 : 220;

    this.panel = new Graphics();
    this.panel.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 18)
      .fill({ color: 0x000000, alpha: 0.85 })
      .stroke({ color: 0xFFFFFF, width: 4 });
    this.addChild(this.panel);

    // Текстът за гатанката (подсказката)
    this.titleText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: this.isMobile ? 55 : 22, // 👇 По-голям шрифт за мобилно
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.isMobile ? 750 : 400, // 👇 По-широк текст
        lineHeight: this.isMobile ? 70 : 26 // 👇 Разредка
      }
    });
    this.titleText.anchor.set(0.5);
    this.titleText.y = this.isMobile ? -120 : -60; // 👇 По-нагоре
    this.addChild(this.titleText);

    // Числата
    this.contentText = new Text({
      text: '',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: this.isMobile ? 120 : 54, // 👇 Значително по-големи числа
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 7 },
        dropShadow: { color: 0x000000, blur: 4, distance: 4, angle: Math.PI / 2, alpha: 0.8 },
        align: 'center'
      }
    });
    this.contentText.anchor.set(0.5);
    this.contentText.y = this.isMobile ? 40 : 30; // 👇 По-надолу
    this.addChild(this.contentText);
  }

  public showImpostorPuzzle(numbers: number[], hintText: string) {
    this.visible = true;
    this.titleText.text = hintText;
    this.contentText.text = numbers.join('    ');
    
    // Връщаме първоначалния размер, ако преди това е било уравнение
    this.contentText.style.fontSize = this.isMobile ? 120 : 54;
    this.contentText.y = this.isMobile ? 40 : 30;
    
    this.fadeIn();
  }

  public showMathEquation(text: string) {
    this.visible = true;
    this.titleText.text = '';
    this.contentText.text = text;
    
    // 👇 По-голям шрифт за уравненията на мобилно
    this.contentText.style.fontSize = this.isMobile ? 140 : 70;
    this.contentText.y = 0;
    
    this.fadeIn();
  }

  public hidePuzzle() {
    gsap.to(this, {
      alpha: 0,
      duration: CONFIG.ANIMATION.EQUATION_FADE_DURATION,
      onComplete: () => { this.visible = false; }
    });
  }

  public hideInstant() {
    gsap.killTweensOf(this);
    this.alpha = 1;
    this.visible = false;
  }

  private fadeIn() {
    this.alpha = 0;
    gsap.killTweensOf(this);
    gsap.to(this, { alpha: 1, duration: CONFIG.ANIMATION.EQUATION_FADE_DURATION });
  }
}