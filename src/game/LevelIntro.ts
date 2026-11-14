import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';

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
    const isMobile = window.innerWidth < 768;
    
    // 1. Background (blocking layer)
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 2. Title
    const titleText = new Text({
      text: title,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: isMobile ? 130 : 130, 
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 10 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    titleText.anchor.set(0.5);
    // 👇 Качваме заглавието още по-нагоре за мобилно
    const titleFinalY = isMobile ? -420 : -350;
    titleText.y = titleFinalY - 100; 
    titleText.alpha = 0;
    this.addChild(titleText);

    // 3. Subtitle
    const subtitleText = new Text({
      text: subtitle,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 75 : 54, 
        fill: 0x00FFAA,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 5 }
      }
    });
    subtitleText.anchor.set(0.5);
    // 👇 Качваме подзаглавието по-нагоре
    const subtitleFinalY = isMobile ? -300 : -230;
    subtitleText.y = subtitleFinalY - 50;
    subtitleText.alpha = 0;
    this.addChild(subtitleText);

  
       // 4. Instructions
    const instructionsText = new Text({
      text: instructions,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 65 : 34, // 👈 Увеличено на 65
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: isMobile ? 1600 : 1300, 
        align: 'center',
        lineHeight: isMobile ? 80 : 48 // 👈 Увеличена разредка
      }
    });
    instructionsText.anchor.set(0.5);
    // 👇 Сваляме инструкциите по-надолу
    const instructionsFinalY = isMobile ? 20 : 20;
    instructionsText.y = instructionsFinalY + 50;
    instructionsText.alpha = 0;
    this.addChild(instructionsText);

    // 5. Ready button
    // 👇 Сваляме бутона още по-надолу
    const buttonY = isMobile ? 480 : 320; 
    const button = this.createButton(buttonLabel, 0, buttonY, onReady, isMobile);
    button.alpha = 0;
    button.scale.set(0.5); 
    this.addChild(button);

    // Стартираме анимацията
    this.animateIn(
      titleText, titleFinalY,
      subtitleText, subtitleFinalY,
      instructionsText, instructionsFinalY,
      button, buttonY
    );
  }

  private animateIn(
    title: Text, titleFinalY: number,
    subtitle: Text, subtitleFinalY: number,
    instructions: Text, instructionsFinalY: number,
    button: Container, buttonFinalY: number
  ) {
    const tl = gsap.timeline();

    tl.to(title, { y: titleFinalY, alpha: 1, duration: 0.8, ease: 'back.out(1.2)' })
    .to(subtitle, { y: subtitleFinalY, alpha: 1, duration: 0.6, ease: 'power2.out' }, "-=0.4")
    .to(instructions, { y: instructionsFinalY, alpha: 1, duration: 0.6, ease: 'power2.out' }, "-=0.3")
    .to(button, { y: buttonFinalY, alpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, "-=0.3")
    .to(title, { y: titleFinalY - 15, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' }, "+=0.2")
    .to(button.scale, { x: 1.05, y: 1.05, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' }, "<");
  }

  private createButton(label: string, x: number, y: number, onClick: () => void, isMobile: boolean): Container {
    const btn = new Container();
    const width = isMobile ? 600 : 440;
    const height = isMobile ? 160 : 110;

    const bg = new Graphics();
    bg.roundRect(-width/2, -height/2, width, height, 20)
      .fill(0x00AEEF)
      .stroke({ color: 0x000000, width: 5 });
    
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 75 : 44, 
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

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.92 });
  }
}