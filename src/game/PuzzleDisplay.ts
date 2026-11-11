import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class PuzzleDisplay extends Container {
  private panel: Graphics;
  private titleText: Text;
  private contentText: Text;

  constructor() {
    super();
    this.visible = false;
    this.zIndex = CONFIG.LAYOUT.PUZZLE_DISPLAY.Z_INDEX;

    // Направихме панела малко по-висок, за да събере повече текст
    this.panel = new Graphics();
    this.panel.roundRect(-220, -110, 440, 220, 18)
      .fill({ color: 0x000000, alpha: 0.85 })
      .stroke({ color: 0xFFFFFF, width: 4 });
    this.addChild(this.panel);

    // Текстът за гатанката
    this.titleText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 400 // Пренася текста, ако е по-дълъг от 400 пиксела
      }
    });
    this.titleText.anchor.set(0.5);
    this.titleText.y = -60; // Преместваме го по-нагоре
    this.addChild(this.titleText);

    // Числата
    this.contentText = new Text({
      text: '',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 54,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 7 },
        dropShadow: { color: 0x000000, blur: 4, distance: 4, angle: Math.PI / 2, alpha: 0.8 },
        align: 'center'
      }
    });
    this.contentText.anchor.set(0.5);
    this.contentText.y = 30; // Преместваме ги по-надолу
    this.addChild(this.contentText);
  }

  public showImpostorPuzzle(numbers: number[], hintText: string) {
    this.visible = true;
    this.titleText.text = hintText;
    this.contentText.text = numbers.join('    ');
    this.fadeIn();
  }

  public showMathEquation(text: string) {
    this.visible = true;
    this.titleText.text = '';
    this.contentText.text = text;
    this.contentText.style.fontSize = 70;
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