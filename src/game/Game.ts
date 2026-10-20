import { Application, Container, Sprite, Assets, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';
import { Bar } from './Bar';

export class Game {
  private app: Application;
  private bg: Sprite;
  private root: Container;
  private bars: Bar[] = [];
  
  private code: number[] = [];
  private currentStep = 0;
  private isAnimating = false;

  private tiger: Sprite;
  private goingWild: Sprite;
  private pips: Graphics[] = []; 
  private signature: Text; // Developer signature declaration

  constructor(app: Application) {
    this.app = app;
    this.root = new Container();
    
    // Enable z-index sorting for proper layering
    this.root.sortableChildren = true; 

    // Background is added directly to the stage to cover the whole screen
    this.bg = new Sprite(Assets.get(CONFIG.ASSETS.BG));
    this.bg.anchor.set(0.5);
    this.app.stage.addChild(this.bg);

    // Root container holds all gameplay elements
    this.app.stage.addChild(this.root);

    this.buildScene();
    this.generateCode();
    this.layout();
  }

  private buildScene() {
    // 1. CAGE (Background layer)
    const cage = new Sprite(Assets.get(CONFIG.ASSETS.CAGE));
    cage.anchor.set(0.5);
    cage.position.set(960, 540); 
    cage.scale.set(0.95); 
    cage.zIndex = 0;
    this.root.addChild(cage);

    // 2. PLATE (Left side of the cage)
    const plate = new Sprite(Assets.get(CONFIG.ASSETS.PLATE));
    plate.anchor.set(0.5);
    plate.position.set(180, 540); 
    plate.scale.set(0.45); 
    plate.zIndex = 1;
    this.root.addChild(plate);

    // 3. LED PIPS (Indicators for locked bars, arranged in 3 rows of 2)
    const startX = 145; 
    const startY = 485; 
    const spacingX = 70; 
    const spacingY = 55; 

    for (let i = 0; i < 6; i++) {
      const pip = new Graphics();
      pip.circle(0, 0, 14)
         .fill(0xFFFFFF) 
         .stroke({ color: 0x000000, width: 4 });
      
      const col = Math.floor(i / 3);
      const row = i % 3;
      
      pip.x = startX + col * spacingX;
      pip.y = startY + row * spacingY;
      pip.zIndex = 2;
      
      this.pips.push(pip);
      this.root.addChild(pip);
    }

    // 4. TIGER (Initially placed behind the bars)
    this.tiger = new Sprite(Assets.get(CONFIG.ASSETS.TIGER));
    this.tiger.anchor.set(0.5, 1); 
    this.tiger.position.set(940, 960); 
    this.tiger.scale.set(0.48); 
    this.tiger.zIndex = 5; 
    this.root.addChild(this.tiger);

    // 5. BARS (1,2,3 on the left; 4,5,6 on the right)
    for (let i = 0; i < 3; i++) {
      this.bars.push(new Bar(i + 1, true, i));  
      this.bars.push(new Bar(i + 4, false, i));  
    }

    this.bars.forEach(bar => {
      bar.zIndex = 10; 
      this.root.addChild(bar);
      bar.on('pointerdown', () => this.handleBarClick(bar));
    });

    // 6. "GOING WILD" TEXT (Hidden initially)
    this.goingWild = new Sprite(Assets.get(CONFIG.ASSETS.GOING_WILD));
    this.goingWild.anchor.set(0.5);
    this.goingWild.position.set(960, 800); 
    this.goingWild.scale.set(0);
    this.goingWild.zIndex = 20; 
    this.root.addChild(this.goingWild);

    // 7. DEVELOPER SIGNATURE (Added to the stage to avoid scaling/cropping issues)
    this.signature = new Text({
      text: 'Developed by Yulian Yuriev', 
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14, 
        fill: 0xFFFFFF, 
        fontWeight: 'normal' 
      }
    });
    this.signature.anchor.set(1, 1); 
    this.app.stage.addChild(this.signature);
  }

  public layout() {
    // Use PIXI's screen dimensions to ensure accuracy across devices
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    // A. BACKGROUND (Math.max covers the entire screen without black bars)
    const bgScaleX = screenW / this.bg.texture.width;
    const bgScaleY = screenH / this.bg.texture.height;
    const bgScale = Math.max(bgScaleX, bgScaleY);
    
    this.bg.scale.set(bgScale);
    this.bg.x = screenW / 2;
    this.bg.y = screenH / 2;

    // B. GAME (Math.min ensures the whole game is visible without cropping)
    const gameScale = Math.min(screenW / CONFIG.DESIGN_WIDTH, screenH / CONFIG.DESIGN_HEIGHT);
    
    this.root.scale.set(gameScale);
    this.root.x = (screenW - CONFIG.DESIGN_WIDTH * gameScale) / 2;
    this.root.y = (screenH - CONFIG.DESIGN_HEIGHT * gameScale) / 2;

    // C. SIGNATURE POSITION (Anchored to the bottom right of the actual screen)
    if (this.signature) {
      this.signature.x = screenW - 16;
      this.signature.y = screenH - 6;
    }
  }

  private generateCode() {
    // Shuffle the array [1, 2, 3, 4, 5, 6] using Fisher-Yates algorithm
    this.code = [1, 2, 3, 4, 5, 6];
    for (let i = this.code.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.code[i], this.code[j]] = [this.code[j], this.code[i]];
    }
    this.currentStep = 0;
    console.log(`%c🔒 CODE: ${this.code.join(', ')}`, 'color: #ff00ff; font-size: 20px; font-weight: bold;');
  }

  private async handleBarClick(bar: Bar) {
    // Ignore clicks if an animation is running or the bar is already open
    if (this.isAnimating || bar.isOpen) return;
    const expectedId = this.code[this.currentStep];

    if (bar.id === expectedId) {
      // Correct bar clicked
      this.isAnimating = true;
      await bar.open();
      this.currentStep++;
      this.updateMeter(bar.id); 
      this.isAnimating = false;
      
      // Check for win condition
      if (this.currentStep === 6) await this.win();
    } else {
      // Wrong bar clicked
      await this.fail(bar.id);
    }
  }

  private async fail(wrongBarId: number) {
    this.isAnimating = true;

    // Find the wrong pip, turn it red, and apply a shake animation
    const wrongPip = this.pips[wrongBarId - 1];
    if (wrongPip) {
      wrongPip.tint = 0xFF0000; 
      gsap.fromTo(wrongPip.scale, 
        { x: 1.5, y: 1.5 }, 
        { x: 1, y: 1, duration: 0.3, yoyo: true, repeat: 2, ease: "power1.inOut" }
      );
    }

    // Wait 0.6 seconds to let the player see the red pip
    await new Promise(resolve => gsap.delayedCall(0.6, resolve));

    // Slam shut all currently open bars simultaneously
    const openBars = this.bars.filter(b => b.isOpen);
    await Promise.all(openBars.map(b => b.slamShut()));

    // Reset pips and generate a new code
    this.updateMeter(); 
    this.generateCode();
    this.isAnimating = false;
  }

  private async win() {
    this.isAnimating = true;

    // Bring the tiger to the front layer (above the bars)
    this.tiger.zIndex = 15; 
    
    // Animate tiger jumping forward
    await gsap.to(this.tiger, { 
      y: 880,        
      scale: 0.85,   
      duration: 0.6, 
      ease: "power2.out" 
    });

    // Show "Going Wild" text in front of the tiger
    await gsap.to(this.goingWild.scale, { 
      x: 0.55,       
      y: 0.55,       
      duration: 0.5, 
      ease: "back.out(1.5)" 
    });
    
    // Wait for 2.5 seconds before resetting
    await new Promise(resolve => gsap.delayedCall(2.5, resolve));

    // Reset tiger and text positions
    await gsap.to(this.goingWild.scale, { x: 0, y: 0, duration: 0.3 });
    await gsap.to(this.tiger, { y: 960, scale: 0.48, duration: 0.3 });

    // Send tiger back behind the bars
    this.tiger.zIndex = 5;

    // Reset all bars to their closed state
    this.bars.forEach(b => {
      if (b.isOpen) {
        b.isOpen = false;
        b.x = b['closedX'];
      }
    });

    // Reset pips and start a new round
    this.updateMeter(); 
    this.generateCode();
    this.isAnimating = false;
  }

  private updateMeter(openedBarId?: number) {
    this.pips.forEach((pip, index) => {
      if (openedBarId === undefined) {
        // If no ID is passed, reset all pips to white
        pip.tint = 0xFFFFFF; 
        pip.alpha = 1;
        gsap.killTweensOf(pip.scale);
        pip.scale.set(1);
      } else {
        // If a bar is opened, turn its corresponding pip green
        if (index === openedBarId - 1) {
          pip.tint = 0x00FF00; 
          pip.alpha = 1;
        }
      }
    });

    // Add a small pop animation to the pip that was just opened
    if (openedBarId !== undefined) {
      const openedPip = this.pips[openedBarId - 1];
      if (openedPip) {
        gsap.fromTo(openedPip.scale, 
          { x: 1.8, y: 1.8 }, 
          { x: 1, y: 1, duration: 0.4, ease: "back.out(3)" }
        );
      }
    }
  }
}