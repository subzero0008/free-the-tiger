import { Container, Sprite, Text, Assets, Rectangle } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

/**
 * Bar represents a single cage bar (there are 6 in total).
 * Each bar handles its own visual representation, click area, and animations.
 * 
 * Bars 1, 2, 3 are on the left side and slide out to the left.
 * Bars 4, 5, 6 are on the right side and slide out to the right.
 */
export class Bar extends Container {
  // Unique identifier of the bar (1-6)
  public id: number;
  
  // Tracks whether the bar is currently open (slid out) or closed
  public isOpen: boolean = false;

  // X-coordinate when the bar is in its closed (locked) position
  private closedX: number;
  
  // X-coordinate when the bar is fully open (slid out)
  private openX: number;

  constructor(id: number, isLeft: boolean, rowIndex: number) {
    super();
    this.id = id;

    // 1. CALCULATE BAR POSITIONS
    // Determine the closed position based on which side the bar is on
    this.closedX = isLeft ? CONFIG.BARS.LEFT_X : CONFIG.BARS.RIGHT_X;
    
    // The open position is offset outward from the closed position
    // Left bars slide left (negative offset), right bars slide right (positive offset)
    this.openX = this.closedX + (isLeft ? -CONFIG.BARS.OPEN_OFFSET : CONFIG.BARS.OPEN_OFFSET);

    // 
    // 2. CREATE BAR AND SHADOW SPRITES
    // 
    const shadow = new Sprite(Assets.get(CONFIG.ASSETS.SHADOW));
    const barSprite = new Sprite(Assets.get(CONFIG.ASSETS.BAR));
    const s = CONFIG.BARS.SCALE;

    // Disable event mode so sprites don't intercept click events 
    // (only the container's hitArea should handle clicks)
    shadow.eventMode = 'none';
    barSprite.eventMode = 'none';

    // 3. VISUAL SETUP - MIRROR RIGHT BARS
    if (isLeft) {
      // LEFT BARS (1, 2, 3)
      // Anchor at the left edge, extend to the right
      shadow.anchor.set(0, 0.5);
      shadow.scale.set(s, s);
      shadow.x = CONFIG.BARS.SHADOW_OFFSET_X;
      shadow.y = CONFIG.BARS.SHADOW_OFFSET_Y;
      
      barSprite.anchor.set(0, 0.5);
      barSprite.scale.set(s, s);
    } else {
      // RIGHT BARS (4, 5, 6)
      // Flip horizontally (negative scale) so the bar extends to the left
      shadow.anchor.set(1, 0.5);
      shadow.scale.set(-s, s);
      shadow.x = -CONFIG.BARS.SHADOW_OFFSET_X;
      shadow.y = CONFIG.BARS.SHADOW_OFFSET_Y;
      
      barSprite.anchor.set(1, 0.5);
      barSprite.scale.set(-s, s);
    }

    // 4. CREATE NUMBER LABEL
    const text = new Text({
      text: id.toString(),
      style: CONFIG.BARS.TEXT_STYLE
    });
    
    text.anchor.set(0.5);
    text.eventMode = 'none';
    
    // Position the number label at a fixed offset on the bar
    text.x = isLeft ? CONFIG.BARS.TEXT_OFFSET_LEFT : CONFIG.BARS.TEXT_OFFSET_RIGHT;
    text.y = 0;

    // Add all visual elements to the container
    this.addChild(shadow, barSprite, text);

    // 5. POSITION THE ENTIRE BAR CONTAINER
    this.x = this.closedX;
    this.y = CONFIG.BARS.Y_POSITIONS[rowIndex];
    this.zIndex = CONFIG.BARS.Z_INDEX;

    
    // 6. SETUP CLICKABLE HIT AREA
    
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Use different hit areas for left and right bars to match their visual bounds
    const hitAreaConfig = isLeft ? CONFIG.BARS.HIT_AREA_LEFT : CONFIG.BARS.HIT_AREA_RIGHT;
    this.hitArea = new Rectangle(
      hitAreaConfig.x, 
      hitAreaConfig.y, 
      hitAreaConfig.width, 
      hitAreaConfig.height
    );
  }

  
  // 7. OPEN THE BAR (Slide Out)
  
  public async open(): Promise<void> {
    this.isOpen = true;
    this.cursor = 'default'; // Bar is no longer clickable once opened
    
    await gsap.to(this, { 
      x: this.openX, 
      duration: CONFIG.ANIMATION.BAR_OPEN_DURATION, 
      ease: CONFIG.ANIMATION.BAR_OPEN_EASE 
    });
  }

 
  // 8. SLAM SHUT THE BAR (Used on wrong click and on reset)

  public async slamShut(): Promise<void> {
    await gsap.to(this, { 
      x: this.closedX, 
      duration: CONFIG.ANIMATION.BAR_CLOSE_DURATION, 
      ease: CONFIG.ANIMATION.BAR_CLOSE_EASE 
    });
    
    this.isOpen = false;
    this.cursor = 'pointer'; // Restore interactivity
  }
}