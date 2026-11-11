import { Container, Sprite, Text, Assets, Rectangle } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

export class Bar extends Container {
  public id: number;
  public isOpen: boolean = false;

  private closedX: number;
  private openX: number;

  constructor(id: number, isLeft: boolean, rowIndex: number) {
    super();
    this.id = id;

    this.closedX = isLeft ? CONFIG.BARS.LEFT_X : CONFIG.BARS.RIGHT_X;
    this.openX = this.closedX + (isLeft ? -CONFIG.BARS.OPEN_OFFSET : CONFIG.BARS.OPEN_OFFSET);

    const shadow = new Sprite(Assets.get(CONFIG.ASSETS.SHADOW));
    const barSprite = new Sprite(Assets.get(CONFIG.ASSETS.BAR));
    const s = CONFIG.BARS.SCALE;

    shadow.eventMode = 'none';
    barSprite.eventMode = 'none';

    if (isLeft) {
      shadow.anchor.set(0, 0.5);
      shadow.scale.set(s, s);
      shadow.x = CONFIG.BARS.SHADOW_OFFSET_X;
      shadow.y = CONFIG.BARS.SHADOW_OFFSET_Y;
      
      barSprite.anchor.set(0, 0.5);
      barSprite.scale.set(s, s);
    } else {
      shadow.anchor.set(1, 0.5);
      shadow.scale.set(-s, s);
      shadow.x = -CONFIG.BARS.SHADOW_OFFSET_X;
      shadow.y = CONFIG.BARS.SHADOW_OFFSET_Y;
      
      barSprite.anchor.set(1, 0.5);
      barSprite.scale.set(-s, s);
    }

    const text = new Text({
      text: id.toString(),
      style: CONFIG.BARS.TEXT_STYLE
    });
    
    text.anchor.set(0.5);
    text.eventMode = 'none';
    text.x = isLeft ? CONFIG.BARS.TEXT_OFFSET_LEFT : CONFIG.BARS.TEXT_OFFSET_RIGHT;
    text.y = 0;

    this.addChild(shadow, barSprite, text);

    this.x = this.closedX;
    this.y = CONFIG.BARS.Y_POSITIONS[rowIndex];
    this.zIndex = CONFIG.BARS.Z_INDEX;

    this.eventMode = 'static';
    this.cursor = 'pointer';

    const hitAreaConfig = isLeft ? CONFIG.BARS.HIT_AREA_LEFT : CONFIG.BARS.HIT_AREA_RIGHT;
    this.hitArea = new Rectangle(
      hitAreaConfig.x, 
      hitAreaConfig.y, 
      hitAreaConfig.width, 
      hitAreaConfig.height
    );
  }

  public async open(): Promise<void> {
    this.isOpen = true;
    this.cursor = 'default';
    
    await gsap.to(this, { 
      x: this.openX, 
      duration: CONFIG.ANIMATION.BAR_OPEN_DURATION, 
      ease: CONFIG.ANIMATION.BAR_OPEN_EASE 
    });
  }

  public async slamShut(): Promise<void> {
    await gsap.to(this, { 
      x: this.closedX, 
      duration: CONFIG.ANIMATION.BAR_CLOSE_DURATION, 
      ease: CONFIG.ANIMATION.BAR_CLOSE_EASE 
    });
    
    this.isOpen = false;
    this.cursor = 'pointer';
  }

  // FIX: Flash винаги работи, независимо от isOpen
  public async flash(color: number): Promise<void> {
    const barSprite = this.children[1] as Sprite;
    const originalTint = barSprite.tint;
    
    barSprite.tint = color;
    await new Promise(resolve => gsap.delayedCall(CONFIG.LEVEL_1.FLASH_DURATION, resolve));
    barSprite.tint = originalTint;
  }

  public resetVisuals(): void {
    gsap.killTweensOf(this);
    this.x = this.closedX;
    this.isOpen = false;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    const barSprite = this.children[1] as Sprite;
    barSprite.tint = 0xFFFFFF;
  }

  public setInteractive(interactive: boolean): void {
    if (interactive) {
      this.eventMode = 'static';
      this.cursor = this.isOpen ? 'default' : 'pointer';
    } else {
      this.eventMode = 'none';
      this.cursor = 'default';
    }
  }
}