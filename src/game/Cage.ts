import { Container, Sprite, Assets } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';
import { Bar } from './Bar';
import { wait } from '../utils/wait';

/**
 * Cage encapsulates the entire cage scene: the cage structure, the tiger inside it,
 * the six interactive bars, and the "Going Wild" text that appears on victory.
 * It handles its own layout updates for portrait/landscape and plays the win sequence.
 */
export class Cage {
  public container: Container;
  public bars: Bar[] = [];
  
  // The `!` (definite assignment assertion) tells TypeScript that these properties
  // are guaranteed to be initialized in the `build()` method called from the constructor.
  private tigerSprite!: Sprite;
  private cageSprite!: Sprite;
  private goingWildSprite!: Sprite;

  constructor() {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.build();
  }

  private build() {
    // Create the cage background
    this.cageSprite = new Sprite(Assets.get(CONFIG.ASSETS.CAGE));
    this.cageSprite.anchor.set(0.5);
    this.cageSprite.position.set(CONFIG.LAYOUT.CAGE.X, CONFIG.LAYOUT.CAGE.Y);
    this.cageSprite.scale.set(CONFIG.LAYOUT.CAGE.SCALE);
    this.cageSprite.zIndex = CONFIG.LAYOUT.CAGE.Z_INDEX;
    this.container.addChild(this.cageSprite);

    // Create the tiger, initially placed behind the bars
    this.tigerSprite = new Sprite(Assets.get(CONFIG.ASSETS.TIGER));
    this.tigerSprite.anchor.set(0.5, 1);
    this.tigerSprite.position.set(CONFIG.LAYOUT.TIGER.X, CONFIG.LAYOUT.TIGER.Y);
    this.tigerSprite.scale.set(CONFIG.LAYOUT.TIGER.SCALE);
    this.tigerSprite.zIndex = CONFIG.LAYOUT.TIGER.Z_INDEX_BACK;
    this.container.addChild(this.tigerSprite);

    // Create the six bars (1,2,3 on the left; 4,5,6 on the right)
    for (let i = 0; i < 3; i++) {
      this.bars.push(new Bar(i + 1, true, i));
      this.bars.push(new Bar(i + 4, false, i));
    }
    this.bars.forEach(bar => this.container.addChild(bar));

    // Create the "Going Wild" text (hidden by default)
    this.goingWildSprite = new Sprite(Assets.get(CONFIG.ASSETS.GOING_WILD));
    this.goingWildSprite.anchor.set(0.5);
    this.goingWildSprite.position.set(CONFIG.LAYOUT.GOING_WILD.X, CONFIG.LAYOUT.GOING_WILD.Y);
    this.goingWildSprite.scale.set(0);
    this.goingWildSprite.zIndex = CONFIG.LAYOUT.GOING_WILD.Z_INDEX;
    this.container.addChild(this.goingWildSprite);
  }

  /**
   * Adjusts the vertical positions of the cage, tiger, bars, and text
   * based on whether the device is in portrait or landscape mode.
   */
  public setPortraitLayout(isPortrait: boolean) {
    if (isPortrait) {
      // Shift everything up in portrait mode to make room for the plate below
      const offsetY = CONFIG.PORTRAIT.CAGE_TIGER_OFFSET_Y;
      this.cageSprite.y = CONFIG.LAYOUT.CAGE.Y + offsetY;
      this.tigerSprite.y = CONFIG.LAYOUT.TIGER.Y + offsetY;
      this.goingWildSprite.y = CONFIG.LAYOUT.GOING_WILD.Y + offsetY;
      
      this.bars.forEach((bar, index) => {
        const rowIndex = Math.floor(index / 2);
        bar.y = CONFIG.BARS.Y_POSITIONS[rowIndex] + offsetY;
      });
    } else {
      // Reset to default landscape positions
      this.cageSprite.y = CONFIG.LAYOUT.CAGE.Y;
      this.tigerSprite.y = CONFIG.LAYOUT.TIGER.Y;
      this.goingWildSprite.y = CONFIG.LAYOUT.GOING_WILD.Y;
      
      this.bars.forEach((bar, index) => {
        const rowIndex = Math.floor(index / 2);
        bar.y = CONFIG.BARS.Y_POSITIONS[rowIndex];
      });
    }
  }

  /**
   * Plays the full victory sequence:
   * 1. Tiger jumps out in front of the bars.
   * 2. "Going Wild" text appears.
   * 3. Wait for a moment.
   * 4. Smoothly reset the tiger back inside, behind the bars.
   * 5. Slam the bars shut.
   */
  public async playWinSequence(): Promise<void> {
    const tigerBaseY = this.tigerSprite.y;

    // Small delay to ensure the last bar finishes its opening animation
    await wait(CONFIG.ANIMATION.WIN_DELAY);

    // Move tiger to the front layer
    this.tigerSprite.zIndex = CONFIG.LAYOUT.TIGER.Z_INDEX_FRONT;
    
    // Animate the tiger jumping forward
    await gsap.to(this.tigerSprite, { 
      y: tigerBaseY + CONFIG.ANIMATION.WIN_TIGER_JUMP_OFFSET_Y,        
      scale: CONFIG.ANIMATION.WIN_TIGER_JUMP_SCALE,   
      duration: CONFIG.ANIMATION.WIN_TIGER_JUMP_DURATION, 
      ease: "power2.out" 
    });

    // Show the "Going Wild" text
    await gsap.to(this.goingWildSprite.scale, { 
      x: CONFIG.ANIMATION.WIN_TEXT_SCALE,       
      y: CONFIG.ANIMATION.WIN_TEXT_SCALE,       
      duration: CONFIG.ANIMATION.WIN_TEXT_DURATION, 
      ease: "back.out(1.5)" 
    });
    
    // Let the player enjoy the win for a moment
    await wait(CONFIG.ANIMATION.WIN_WAIT_TIME);

    // Smooth reset: hide the text first
    await gsap.to(this.goingWildSprite.scale, { x: 0, y: 0, duration: CONFIG.ANIMATION.RESET_TEXT_HIDE_DURATION });
    
    // Move the tiger back to its original position inside the cage
    await gsap.to(this.tigerSprite, { 
      y: tigerBaseY, 
      scale: CONFIG.LAYOUT.TIGER.SCALE, 
      duration: CONFIG.ANIMATION.RESET_TIGER_RETURN_DURATION, 
      ease: "power2.inOut" 
    });

    // Send the tiger back behind the bars
    this.tigerSprite.zIndex = CONFIG.LAYOUT.TIGER.Z_INDEX_BACK;

    // Slam all open bars shut simultaneously
    await this.slamShutOpenBars();
  }

  /**
   * Closes all currently open bars simultaneously.
   */
  public async slamShutOpenBars(): Promise<void> {
    const openBars = this.bars.filter(b => b.isOpen);
    await Promise.all(openBars.map(b => b.slamShut()));
  }
}
