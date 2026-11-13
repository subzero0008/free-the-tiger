import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class IntroScreen extends Container {
  private bg: Graphics;

  constructor(onStart: () => void) {
    super();
    const isMobile = window.innerWidth < 768;

    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // ==========================================
    // 1. ЗАГЛАВИЕ
    // ==========================================
    const title = new Text({
      text: CONFIG.SCREENS.INTRO.TITLE,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: isMobile ? 140 : 130,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 8 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    title.anchor.set(0.5);
    title.y = -380; 
    title.alpha = 0; 
    this.addChild(title);

    // ==========================================
    // 2. ОПИСАНИЕ (Преместено по-надолу за мобилно)
    // ==========================================
    // Задаваме позицията: 80 за мобилно (по-надолу), -50 за десктоп
    const storyY = isMobile ? 80 : -50; 

    const story = new Text({
      text: CONFIG.SCREENS.INTRO.STORY,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 70 : 34,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: isMobile ? 1800 : 1300,
        align: 'center',
        lineHeight: isMobile ? 95 : 48,
        letterSpacing: isMobile ? 3 : 1
      }
    });
    story.anchor.set(0.5);
    story.y = storyY;
    story.alpha = 0; 
    this.addChild(story);

    // ==========================================
    // 3. БУТОН (Преместен по-надолу за мобилно)
    // ==========================================
    // Задаваме позицията: 480 за мобилно (по-надолу), 350 за десктоп
    const buttonY = isMobile ? 480 : 350; 
    
    const button = this.createButton(CONFIG.SCREENS.INTRO.START_BUTTON, 0, buttonY, onStart, isMobile);
    button.alpha = 0;
    button.scale.set(0.8); 
    this.addChild(button);

    // ==========================================
    // АНИМАЦИЯ НА ВЛИЗАНЕ
    // ==========================================
    this.animateIn(title, story, button, isMobile);
  }

  private animateIn(title: Text, story: Text, button: Container, isMobile: boolean) {
    const tl = gsap.timeline();

    // Взимаме същите позиции, за да не "скачат" обектите при анимацията
    const storyY = isMobile ? 80 : -50;
    const buttonY = isMobile ? 480 : 350;

    // 1. Заглавието изскача
    tl.to(title, {
      y: -350,
      alpha: 1,
      duration: 0.8,
      ease: 'back.out(1.2)'
    })
    // 2. Текстът изплува на новата си позиция
    .to(story, {
      y: storyY,
      alpha: 1,
      duration: 0.8,
      ease: 'power2.out'
    }, "-=0.4")
    // 3. Бутонът изскача на новата си позиция
    .to(button, {
      y: buttonY,
      alpha: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.5)'
    }, "-=0.3")
    // 4. Безкрайно "плуване" на заглавието
    .to(title, {
      y: -360,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    }, "+=0.2")
    // 5. Пулсиране на бутона
    .to(button.scale, {
      x: 1.05,
      y: 1.05,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    }, "<");
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
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => { bg.tint = 0x88DDFF; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.92 });
  }
}