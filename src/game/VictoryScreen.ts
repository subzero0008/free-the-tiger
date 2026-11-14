import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class VictoryScreen extends Container {
  private bg: Graphics;
  private confettiLayer: Container;
  private title: Text;
  private recordText: Text | null = null;
  private confettiPieces: Graphics[] = []; // 👈 Пазим референции към конфетите

  constructor(
    timeStr: string, 
    bestTimeStr: string, 
    isNewRecord: boolean,
    hintsUsed: number,
    onPlayAgain: () => void,
    onLeaderboard: () => void
  ) {
    super();
    const isMobile = window.innerWidth < 768;
    
    this.sortableChildren = true;

    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.bg.zIndex = 0;
    this.addChild(this.bg);

    this.confettiLayer = new Container();
    this.confettiLayer.zIndex = 1;
    this.addChild(this.confettiLayer);
    this.createConfetti();

    // 1. Заглавие
    this.title = new Text({
      text: CONFIG.VICTORY.TITLE,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: isMobile ? 130 : 110, 
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 12 },
        dropShadow: { color: 0x000000, blur: 10, distance: 8, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    this.title.anchor.set(0.5);
    this.title.y = isMobile ? -650 : -320; 
    this.title.zIndex = 10;
    this.addChild(this.title);

    this.title.scale.set(0);
    gsap.to(this.title.scale, { x: 1, y: 1, duration: 0.8, ease: "elastic.out(1, 0.5)", delay: 0.1 });

    // 2. Съобщение
    const message = new Text({
      text: CONFIG.VICTORY.MESSAGE,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 65 : 36,
        fill: 0xFFFFFF,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: isMobile ? 1600 : 1100,
        lineHeight: isMobile ? 85 : 50,
        stroke: { color: 0x000000, width: 4 }
      }
    });
    message.anchor.set(0.5);
    message.y = isMobile ? -480 : -190;
    message.zIndex = 10;
    this.addChild(message);

    // 3. Твоето време
    const timeText = new Text({
      text: `${CONFIG.VICTORY.TIME_LABEL}${timeStr}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 90 : 50,
        fill: 0x00FFAA,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 6 }
      }
    });
    timeText.anchor.set(0.5);
    timeText.y = isMobile ? -320 : -80;
    timeText.zIndex = 10;
    this.addChild(timeText);

    // 4. Най-добро време
    const bestTimeText = new Text({
      text: `${CONFIG.VICTORY.BEST_TIME_LABEL}${bestTimeStr}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 60 : 34,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    bestTimeText.anchor.set(0.5);
    bestTimeText.y = isMobile ? -220 : -10;
    bestTimeText.zIndex = 10;
    this.addChild(bestTimeText);

    // 5. Използвани хинтове
    const hintsText = new Text({
      text: `${CONFIG.VICTORY.HINTS_LABEL}${hintsUsed}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 55 : 28,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    hintsText.anchor.set(0.5);
    hintsText.y = isMobile ? -120 : 50;
    hintsText.zIndex = 10;
    this.addChild(hintsText);

    // 6. Нов рекорд
    if (isNewRecord) {
      this.recordText = new Text({
        text: CONFIG.VICTORY.NEW_RECORD,
        style: {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: isMobile ? 80 : 40,
          fill: 0xFFD700,
          fontWeight: 'bold',
          stroke: { color: 0x000000, width: 6 }
        }
      });
      this.recordText.anchor.set(0.5);
      this.recordText.y = isMobile ? -20 : 120;
      this.recordText.zIndex = 10;
      this.addChild(this.recordText);

      gsap.fromTo(this.recordText.scale, 
        { x: 0, y: 0 }, 
        { x: 1, y: 1, duration: 0.5, ease: "back.out(2)", delay: 0.5, yoyo: true, repeat: -1, repeatDelay: 1 }
      );
    }

    // 7. Demo текст
    const demoText = new Text({
      text: CONFIG.VICTORY.DEMO,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 50 : 24,
        fill: 0xFFDDDD,
        align: 'center',
        fontStyle: 'italic',
        stroke: { color: 0x000000, width: 3 }
      }
    });
    demoText.anchor.set(0.5);
    demoText.y = isMobile ? 120 : 190;
    demoText.zIndex = 10;
    this.addChild(demoText);

    // 8. Автор
    const creatorText = new Text({
      text: 'Created by: Yulian Yuriev',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? 45 : 20,
        fill: 0xDDDDDD,
        align: 'center',
        stroke: { color: 0x000000, width: 2 }
      }
    });
    creatorText.anchor.set(0.5);
    creatorText.y = isMobile ? 200 : 240;
    creatorText.zIndex = 10;
    this.addChild(creatorText);

    // 9. Имейл
    const emailContainer = new Container();
    emailContainer.y = isMobile ? 280 : 270;
    emailContainer.zIndex = 10;
    this.addChild(emailContainer);

    const emailFontSize = isMobile ? 45 : 20;

    const emailLabel = new Text({ 
      text: 'Email: ', 
      style: { fontFamily: 'Arial, sans-serif', fontSize: emailFontSize, fill: 0xDDDDDD, stroke: { color: 0x000000, width: 2 } } 
    });
    
    const emailLink = new Text({ 
      text: 'zerosub07@gmail.com', 
      style: { fontFamily: 'Arial, sans-serif', fontSize: emailFontSize, fill: 0x00AEEF, stroke: { color: 0x000000, width: 2 } } 
    });

    emailLink.eventMode = 'static';
    emailLink.cursor = 'pointer';
    emailLink.on('pointerover', () => { emailLink.style.fill = 0x00FFFF; });
    emailLink.on('pointerout', () => { emailLink.style.fill = 0x00AEEF; });
    emailLink.on('pointerdown', () => { 
      window.location.href = 'mailto:zerosub07@gmail.com'; 
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText('zerosub07@gmail.com').then(() => {
          const originalText = emailLink.text;
          emailLink.text = 'Copied!';
          emailLink.style.fill = 0x00FF00;
          gsap.delayedCall(2, () => {
            emailLink.text = originalText;
            emailLink.style.fill = 0x00AEEF;
          });
        });
      }
    });

    emailContainer.addChild(emailLabel, emailLink);
    
    const totalWidth = emailLabel.width + emailLink.width;
    emailLabel.x = -totalWidth / 2;
    emailLink.x = emailLabel.x + emailLabel.width;

    // 10. Бутони
    let btnPlayAgain: Container;
    let btnLeaderboard: Container;

    if (isMobile) {
      btnPlayAgain = this.createButton(CONFIG.VICTORY.PLAY_AGAIN, 0, 450, 0x00AEEF, onPlayAgain, true);
      btnLeaderboard = this.createButton('🏆 LEADERBOARD', 0, 720, 0xFFD700, onLeaderboard, true);
    } else {
      btnPlayAgain = this.createButton(CONFIG.VICTORY.PLAY_AGAIN, -250, 360, 0x00AEEF, onPlayAgain, false);
      btnLeaderboard = this.createButton('🏆 LEADERBOARD', 250, 360, 0xFFD700, onLeaderboard, false);
    }
    
    btnPlayAgain.zIndex = 20;
    btnLeaderboard.zIndex = 20;
    this.addChild(btnPlayAgain, btnLeaderboard);
  }

  private createConfetti() {
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
    for (let i = 0; i < 100; i++) {
      const rect = new Graphics();
      rect.rect(0, 0, 15, 25).fill(colors[Math.floor(Math.random() * colors.length)]);
      this.confettiLayer.addChild(rect);
      this.confettiPieces.push(rect); // 👈 Запазваме всеки елемент
    }
  }

  // 👇 НОВ МЕТОД: Позиционира конфетите спрямо размера на екрана
  private layoutConfetti(width: number, height: number) {
    this.confettiPieces.forEach(rect => {
      gsap.killTweensOf(rect);
      
      // Разпръскваме ги по цялата ширина на екрана
      rect.x = (Math.random() - 0.5) * width;
      rect.y = -height / 2 - 50; // Започват от най-горния ръб (извън екрана)
      
      gsap.to(rect, {
        y: height / 2 + 50, // Падат чак до най-долния ръб
        x: rect.x + (Math.random() - 0.5) * (width * 0.3), // Лек вятър наляво/надясно
        rotation: Math.random() * Math.PI * 4,
        duration: 3 + Math.random() * 3,
        repeat: -1,
        delay: Math.random() * 2,
        ease: "none"
      });
    });
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void, isMobile: boolean): Container {
    const btn = new Container();
    
    const w = isMobile ? 900 : 360;
    const h = isMobile ? 220 : 100;

    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 20).fill(color).stroke({ color: 0x000000, width: 5 });
    
    const text = new Text({
      text: label,
      style: { 
        fontFamily: 'Arial, sans-serif', 
        fontSize: isMobile ? 80 : 32, 
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
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.85 });
    
    // 👇 Извикваме метода, който разпръсква конфетите на база реалния размер на екрана
    this.layoutConfetti(width, height); 
  }

  public destroy(options?: any): void {
    if (this.confettiPieces) {
      this.confettiPieces.forEach(c => gsap.killTweensOf(c));
    }
    if (this.title) gsap.killTweensOf(this.title.scale);
    if (this.recordText) gsap.killTweensOf(this.recordText.scale);
    super.destroy(options);
  }
}