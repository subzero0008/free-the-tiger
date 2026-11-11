import { Container, Sprite, Assets } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';
import { Bar } from './Bar';
import { wait } from '../utils/wait';

export class Cage {
  public container: Container;
  public bars: Bar[] = [];
  public tigerSprite: Sprite;
  private cageSprite: Sprite;
  private goingWildSprite: Sprite;
  private baseTigerY: number = CONFIG.LAYOUT.TIGER.Y;

  constructor() {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.build();
  }

  private build() {
    this.cageSprite = new Sprite(Assets.get(CONFIG.ASSETS.CAGE));
    this.cageSprite.anchor.set(0.5);
    this.cageSprite.position.set(CONFIG.LAYOUT.CAGE.X, CONFIG.LAYOUT.CAGE.Y);
    this.cageSprite.scale.set(CONFIG.LAYOUT.CAGE.SCALE);
    this.cageSprite.zIndex = CONFIG.LAYOUT.CAGE.Z_INDEX;
    this.container.addChild(this.cageSprite);

    this.tigerSprite = new Sprite(Assets.get(CONFIG.ASSETS.TIGER));
    this.tigerSprite.anchor.set(0.5, 1);
    this.tigerSprite.position.set(CONFIG.LAYOUT.TIGER.X, CONFIG.LAYOUT.TIGER.Y);
    this.tigerSprite.scale.set(CONFIG.LAYOUT.TIGER.SCALE);
    this.tigerSprite.zIndex = CONFIG.LAYOUT.TIGER.Z_INDEX_BACK;
    this.container.addChild(this.tigerSprite);

    for (let i = 0; i < 3; i++) {
      this.bars.push(new Bar(i + 1, true, i));
      this.bars.push(new Bar(i + 4, false, i));
    }
    this.bars.forEach(bar => this.container.addChild(bar));

    this.goingWildSprite = new Sprite(Assets.get(CONFIG.ASSETS.GOING_WILD));
    this.goingWildSprite.anchor.set(0.5);
    this.goingWildSprite.position.set(CONFIG.LAYOUT.GOING_WILD.X, CONFIG.LAYOUT.GOING_WILD.Y);
    this.goingWildSprite.scale.set(0);
    this.goingWildSprite.zIndex = CONFIG.LAYOUT.GOING_WILD.Z_INDEX;
    this.container.addChild(this.goingWildSprite);
  }

  public setPortraitLayout(isPortrait: boolean) {
    if (isPortrait) {
      const offsetY = CONFIG.PORTRAIT.CAGE_TIGER_OFFSET_Y;
      this.baseTigerY = CONFIG.LAYOUT.TIGER.Y + offsetY;
      
      this.cageSprite.y = CONFIG.LAYOUT.CAGE.Y + offsetY;
      this.tigerSprite.y = this.baseTigerY;
      this.goingWildSprite.y = CONFIG.LAYOUT.GOING_WILD.Y + offsetY;
      
      this.bars.forEach((bar, index) => {
        const rowIndex = Math.floor(index / 2);
        bar.y = CONFIG.BARS.Y_POSITIONS[rowIndex] + offsetY;
      });
    } else {
      this.baseTigerY = CONFIG.LAYOUT.TIGER.Y;
      
      this.cageSprite.y = CONFIG.LAYOUT.CAGE.Y;
      this.tigerSprite.y = this.baseTigerY;
      this.goingWildSprite.y = CONFIG.LAYOUT.GOING_WILD.Y;
      
      this.bars.forEach((bar, index) => {
        const rowIndex = Math.floor(index / 2);
        bar.y = CONFIG.BARS.Y_POSITIONS[rowIndex];
      });
    }
  }

  // FIX: Принудително нулиране на всичко
  public reset(): void {
    gsap.killTweensOf(this.tigerSprite);
    gsap.killTweensOf(this.goingWildSprite);
    
    this.tigerSprite.y = this.baseTigerY;
    this.tigerSprite.scale.set(CONFIG.LAYOUT.TIGER.SCALE);
    this.tigerSprite.zIndex = CONFIG.LAYOUT.TIGER.Z_INDEX_BACK;
    
    this.goingWildSprite.scale.set(0);

    // Принудително затваряме баровете
    this.bars.forEach(bar => {
      gsap.killTweensOf(bar);
      bar.x = (bar.id <= 3) ? CONFIG.BARS.LEFT_X : CONFIG.BARS.RIGHT_X;
      bar.isOpen = false;
    });
  }

  public async playWinSequence(): Promise<void> {
    await wait(CONFIG.ANIMATION.WIN_DELAY);

    this.tigerSprite.zIndex = CONFIG.LAYOUT.TIGER.Z_INDEX_FRONT;
    
    await gsap.to(this.tigerSprite, { 
      y: this.baseTigerY + CONFIG.ANIMATION.WIN_TIGER_JUMP_OFFSET_Y,        
      scale: CONFIG.ANIMATION.WIN_TIGER_JUMP_SCALE,   
      duration: CONFIG.ANIMATION.WIN_TIGER_JUMP_DURATION, 
      ease: "power2.out" 
    });

    await gsap.to(this.goingWildSprite.scale, { 
      x: CONFIG.ANIMATION.WIN_TEXT_SCALE,       
      y: CONFIG.ANIMATION.WIN_TEXT_SCALE,       
      duration: CONFIG.ANIMATION.WIN_TEXT_DURATION, 
      ease: "back.out(1.5)" 
    });
    
    await wait(CONFIG.ANIMATION.WIN_WAIT_TIME);

    await gsap.to(this.goingWildSprite.scale, { x: 0, y: 0, duration: CONFIG.ANIMATION.RESET_TEXT_HIDE_DURATION });
    
    await gsap.to(this.tigerSprite, { 
      y: this.baseTigerY, 
      scale: CONFIG.LAYOUT.TIGER.SCALE, 
      duration: CONFIG.ANIMATION.RESET_TIGER_RETURN_DURATION, 
      ease: "power2.inOut" 
    });

    this.tigerSprite.zIndex = CONFIG.LAYOUT.TIGER.Z_INDEX_BACK;
    await this.slamShutOpenBars();
  }

  public async slamShutOpenBars(): Promise<void> {
    const openBars = this.bars.filter(b => b.isOpen);
    await Promise.all(openBars.map(b => b.slamShut()));
  }
}