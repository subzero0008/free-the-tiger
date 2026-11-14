import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class IntroScreen extends Container {
  private bg: Graphics;

  // 👇 ДОБАВЕН onLeaderboard параметър
  constructor(onStart: () => void, onLeaderboard: () => void) {
    super();
    const isMobile = window.innerWidth < 768;

    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 1. ЗАГЛАВИЕ
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

    // 2. ОПИСАНИЕ
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

    // 3. БУТОНИ
    // На мобилно: един под друг. На десктоп: един до друг.
    const startBtnX = isMobile ? 0 : -250;
    const startBtnY = isMobile ? 480 : 350;
    
    const lbBtnX = isMobile ? 0 : 250;
    const lbBtnY = isMobile ? 680 : 350; 

    const startBtn = this.createButton(CONFIG.SCREENS.INTRO.START_BUTTON, startBtnX, startBtnY, 0x00AEEF, onStart, isMobile);
    startBtn.alpha = 0;
    startBtn.scale.set(0.8); 
    this.addChild(startBtn);

    // 👇 НОВ БУТОН ЗА КЛАСАЦИЯ
    const lbBtn = this.createButton('🏆 LEADERBOARD', lbBtnX, lbBtnY, 0xFFD700, onLeaderboard, isMobile);
    lbBtn.alpha = 0;
    lbBtn.scale.set(0.8);
    this.addChild(lbBtn);

    // АНИМАЦИЯ НА ВЛИЗАНЕ
    this.animateIn(title, story, startBtn, lbBtn, isMobile);
  }

  private animateIn(title: Text, story: Text, startBtn: Container, lbBtn: Container, isMobile: boolean) {
    const tl = gsap.timeline();

    const storyY = isMobile ? 80 : -50;
    const startBtnY = isMobile ? 480 : 350;
    const lbBtnY = isMobile ? 680 : 350;

    tl.to(title, {
      y: -350, alpha: 1, duration: 0.8, ease: 'back.out(1.2)'
    })
    .to(story, {
      y: storyY, alpha: 1, duration: 0.8, ease: 'power2.out'
    }, "-=0.4")
    
    // 👇 Анимираме двата бутона заедно
    .to([startBtn, lbBtn], {
      y: (i) => i === 0 ? startBtnY : lbBtnY,
      alpha: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.5)'
    }, "-=0.3")
    
    .to(title, {
      y: -360, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut'
    }, "+=0.2")
    
    // 👇 Пулсиране и на двата бутона
    .to([startBtn.scale, lbBtn.scale], {
      x: 1.05, y: 1.05, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
    }, "<");
  }

  // 👇 Добавих color параметър, за да може единият да е син, а другият златист
  private createButton(label: string, x: number, y: number, color: number, onClick: () => void, isMobile: boolean): Container {
    const btn = new Container();
    const width = isMobile ? 700 : 440; // Малко по-широк за мобилно заради дългия текст
    const height = isMobile ? 160 : 110;
    
    const bg = new Graphics();
    bg.roundRect(-width/2, -height/2, width, height, 20)
      .fill(color)
      .stroke({ color: 0x000000, width: 5 });
    
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 65 : 40,
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
    
    // Hover ефект (леко потъмняване)
    btn.on('pointerover', () => { bg.tint = 0xCCCCCC; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    
    return btn;
  }

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.92 });
  }
}