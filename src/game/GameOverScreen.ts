import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class GameOverScreen extends Container {
  private bg: Graphics;
  private sadEmoji: Text;

  constructor(
    titleStr: string, 
    messageStr: string, 
    onPlayAgain: () => void,
    onLeaderboard: () => void
  ) {
    super();
    const isMobile = window.innerWidth < 768;
    
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 👇 Фонов емотикон (уголемен за мобилно)
    this.sadEmoji = new Text({
      text: '😭',
      style: { fontFamily: 'Arial', fontSize: isMobile ? 450 : 250 }
    });
    this.sadEmoji.anchor.set(0.5);
    this.sadEmoji.y = isMobile ? -100 : -50;
    this.sadEmoji.alpha = 0.15;
    this.addChild(this.sadEmoji);

    gsap.to(this.sadEmoji, { y: '-=30', duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to(this.sadEmoji.scale, { x: 1.1, y: 1.1, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // 👇 Заглавие (много по-голямо за мобилно)
    const title = new Text({
      text: titleStr,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: isMobile ? 220 : 120,
        fill: 0xFF3333,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 10 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    title.anchor.set(0.5);
    title.y = isMobile ? -450 : -220;
    this.addChild(title);

    gsap.fromTo(title.scale, { x: 1.2, y: 1.2 }, { x: 1, y: 1, duration: 0.6, ease: "bounce.out" });

    // 👇 Съобщение (по-голям шрифт и ширина)
    const message = new Text({
      text: messageStr,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 85 : 36, 
        fill: 0xFFFFFF,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: isMobile ? 1700 : 1000, 
        lineHeight: isMobile ? 110 : 50,
        stroke: { color: 0x000000, width: 4 }
      }
    });
    message.anchor.set(0.5);
    message.y = isMobile ? -180 : -80;
    this.addChild(message);

    // 👇 Demo текст
    const demoText = new Text({
      text: CONFIG.GAME_OVER.DEMO,
      style: { 
        fontFamily: 'Arial, sans-serif', 
        fontSize: isMobile ? 60 : 24, 
        fill: 0xAAAAAA, 
        align: 'center', 
        fontStyle: 'italic' 
      }
    });
    demoText.anchor.set(0.5);
    demoText.y = isMobile ? 100 : 60;
    this.addChild(demoText);

    // 👇 Credits текст
    const creditsText = new Text({
      text: CONFIG.GAME_OVER.CREATOR,
      style: { 
        fontFamily: 'Arial, sans-serif', 
        fontSize: isMobile ? 55 : 20, 
        fill: 0x888888, 
        align: 'center', 
        lineHeight: isMobile ? 80 : 30 
      }
    });
    creditsText.anchor.set(0.5);
    creditsText.y = isMobile ? 230 : 140;
    this.addChild(creditsText);

    // 👇 БУТОНИ: На мобилно ги подреждаме вертикално един под друг
    let btnTryAgain: Container;
    let btnLeaderboard: Container;

    if (isMobile) {
      // За мобилно: Подредба едно под друго
      btnTryAgain = this.createButton(CONFIG.GAME_OVER.PLAY_AGAIN, 0, 420, 0xFF3333, onPlayAgain, true);
      btnLeaderboard = this.createButton('🏆 LEADERBOARD', 0, 620, 0xFFD700, onLeaderboard, true);
    } else {
      // За десктоп: Един до друг
      btnTryAgain = this.createButton(CONFIG.GAME_OVER.PLAY_AGAIN, -250, 260, 0xFF3333, onPlayAgain, false);
      btnLeaderboard = this.createButton('🏆 LEADERBOARD', 250, 260, 0xFFD700, onLeaderboard, false);
    }

    this.addChild(btnTryAgain, btnLeaderboard);
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void, isMobile: boolean): Container {
    const btn = new Container();
    
    // 👇 Много по-големи размери за мобилно, за да се натискат лесно
    const w = isMobile ? 900 : 360;
    const h = isMobile ? 220 : 100;

    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 30).fill(color).stroke({ color: 0x000000, width: 5 });
    
    const text = new Text({
      text: label,
      style: { 
        fontFamily: 'Arial, sans-serif', 
        fontSize: isMobile ? 90 : 32, 
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
    btn.on('pointerover', () => { bg.tint = 0xCCCCCC; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.95 });
  }

  public destroy(options?: any): void {
    if (this.sadEmoji) {
      gsap.killTweensOf(this.sadEmoji);
      gsap.killTweensOf(this.sadEmoji.scale);
    }
    super.destroy(options);
  }
}