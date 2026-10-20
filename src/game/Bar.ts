import { Container, Sprite, Text, Assets, Rectangle } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';

// CLICK AREA SETTINGS

// Bars 1, 2, 3 — left side
const LEFT_HIT_AREA = {
  x: 0,       // Horizontal position of the area
  y: -50,     // Vertical position of the area
  width: 400, // Width of the area
  height: 100 // Height of the area
};

// Bars 4, 5, 6 — right side
const RIGHT_HIT_AREA = {
  x: -20,     // Horizontal position of the area
  y: -50,     // Vertical position of the area
  width: 400, // Width of the area
  height: 100 // Height of the area
};

export class Bar extends Container {
  public id: number;
  public isOpen: boolean = false;

  private closedX: number;
  private openX: number;

  constructor(id: number, isLeft: boolean, rowIndex: number) {
    super();
    this.id = id;

    // 1. BAR POSITIONS
    this.closedX = isLeft
      ? CONFIG.BARS.LEFT_X
      : CONFIG.BARS.RIGHT_X;

    this.openX =
      this.closedX +
      (isLeft
        ? -CONFIG.BARS.OPEN_OFFSET
        : CONFIG.BARS.OPEN_OFFSET);

    // 2. CREATE SPRITES
    const shadow = new Sprite(Assets.get(CONFIG.ASSETS.SHADOW));
    const barSprite = new Sprite(Assets.get(CONFIG.ASSETS.BAR));

    const s = CONFIG.BARS.SCALE;

    // Sprites should not intercept clicks
    shadow.eventMode = 'none';
    barSprite.eventMode = 'none';

    // 3. VISUAL SETUP FOR BAR AND SHADOW
    if (isLeft) {
      // Bars 1, 2, 3
      shadow.anchor.set(0, 0.5);
      shadow.scale.set(s, s);
      shadow.x = 10;
      shadow.y = 10;

      barSprite.anchor.set(0, 0.5);
      barSprite.scale.set(s, s);
    } else {
      // Bars 4, 5, 6
      shadow.anchor.set(1, 0.5);
      shadow.scale.set(-s, s);
      shadow.x = -10;
      shadow.y = 10;

      barSprite.anchor.set(1, 0.5);
      barSprite.scale.set(-s, s);
    }

    // 4. TEXT AND NUMBERING
    const text = new Text({
      text: id.toString(),
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 48,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        stroke: {
          color: 0x000000,
          width: 8
        },
        dropShadow: {
          color: 0x000000,
          blur: 4,
          distance: 4,
          angle: Math.PI / 2,
          alpha: 0.8
        }
      }
    });

    text.anchor.set(0.5);
    text.eventMode = 'none';

    if (isLeft) {
      text.x = CONFIG.BARS.TEXT_OFFSET_LEFT;
    } else {
      text.x = CONFIG.BARS.TEXT_OFFSET_RIGHT;
    }

    text.y = 0;

    this.addChild(shadow, barSprite, text);

    // 5. POSITION OF THE ENTIRE BAR
    this.x = this.closedX;
    this.y = CONFIG.BARS.Y_POSITIONS[rowIndex];

    // 6. SEPARATE CLICK AREA
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Select a specific click area based on the side
    const hitAreaConfig = isLeft
      ? LEFT_HIT_AREA
      : RIGHT_HIT_AREA;

    this.hitArea = new Rectangle(
      hitAreaConfig.x,
      hitAreaConfig.y,
      hitAreaConfig.width,
      hitAreaConfig.height
    );
  }

  // 7. OPEN THE BAR
  public async open(): Promise<void> {
    this.isOpen = true;

    await gsap.to(this, {
      x: this.openX,
      duration: 0.5,
      ease: 'back.out(1.2)'
    });
  }

  // 8. SLAM SHUT THE BAR
  public async slamShut(): Promise<void> {
    await gsap.to(this, {
      x: this.closedX,
      duration: 0.2,
      ease: 'power2.in'
    });

    this.isOpen = false;
  }
}