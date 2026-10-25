export const CONFIG = {
  // PIXI Application initialization settings
  APP_SETTINGS: {
    BACKGROUND_COLOR: 0x000000,
    ANTIALIAS: true,
    FALLBACK_RESOLUTION: 1
  },

  // Base resolution of the game design used for scaling calculations
  DESIGN_WIDTH: 1920,
  DESIGN_HEIGHT: 1080,

  // Paths to all image assets used in the game
  ASSETS: {
    BG: 'assets/background.jpg',
    CAGE: 'assets/cage.png',
    TIGER: 'assets/tiger.png',
    BAR: 'assets/bar.png',
    SHADOW: 'assets/barShadow.png',
    PLATE: 'assets/plate.png',
    GOING_WILD: 'assets/txt.png'
  },

  // Configuration for the cage bars
  BARS: {
    // X-coordinate anchor points for the left and right bars
    LEFT_X: 440,      
    RIGHT_X: 1000,    
    
    // Distance (in pixels) the bars slide outward when opened
    OPEN_OFFSET: 400, 
    
    // Y-coordinates for the three rows of bars (top to bottom)
    Y_POSITIONS: [440, 610, 780], 
    
    // Scale factor for the length and thickness of the bars
    SCALE: 2.0,       
    
    // Horizontal offset for the number labels on the left and right bars
    TEXT_OFFSET_LEFT: 250,  
    TEXT_OFFSET_RIGHT: 226,
    
    // Layer order of the bars (must be lower than the UI plate)
    Z_INDEX: 10,
    
    // Offset positions for the shadows behind the bars
    SHADOW_OFFSET_X: 10,
    SHADOW_OFFSET_Y: 10,
    
    // Clickable hit areas for the left and right bars
    HIT_AREA_LEFT: { x: 0, y: -50, width: 400, height: 100 },
    HIT_AREA_RIGHT: { x: -20, y: -50, width: 400, height: 100 },
    
    // PIXI.TextStyle configuration for the numbers on the bars
    TEXT_STYLE: {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: 48,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 8 },
      dropShadow: { color: 0x000000, blur: 4, distance: 4, angle: Math.PI / 2, alpha: 0.8 }
    } as const
  },

  // Default layout positions and sizes (used primarily for landscape/desktop)
  LAYOUT: {
    CAGE: { X: 960, Y: 540, SCALE: 0.95, Z_INDEX: 0 },
    TIGER: { X: 940, Y: 960, SCALE: 0.48, Z_INDEX_BACK: 5, Z_INDEX_FRONT: 15 },
    PLATE: { X: 180, Y: 540, SCALE: 0.45, Z_INDEX: 12 },
    GOING_WILD: { X: 960, Y: 800, Z_INDEX: 20 },
    
    // Developer signature position offsets from the bottom-right corner
    SIGNATURE: { FONT_SIZE: 14, OFFSET_X: 16, OFFSET_Y: 6 },
    
    // LED indicator (Pips) layout on the plate
    PIPS: { 
      START_X: -35, 
      START_Y: -55, 
      SPACING_X: 70, 
      SPACING_Y: 55, 
      RADIUS: 14, 
      STROKE_WIDTH: 4, 
      Z_INDEX: 13 
    }
  },

  // Specific layout overrides for portrait (mobile) screens
  PORTRAIT: {
    // Determines how much to zoom in the game on mobile (lower number = more zoom)
    SCALE_DIVISOR: 1300,
    
    // Vertical offset to balance the scene on portrait screens
    ROOT_Y_OFFSET: 30,
    
    // Y-coordinate of the plate when stacked above the cage
    PLATE_Y: -680,
    
    // How much to shift the cage, tiger, and bars upwards
    CAGE_TIGER_OFFSET_Y: -380
  },

  // Timings (in seconds) and scales for all GSAP animations
  ANIMATION: {
    // Delay before the tiger starts jumping after the last bar opens
    WIN_DELAY: 0.25,
    
    // Delay before bars slam shut on a wrong click
    FAIL_DELAY: 0.6,
    
    // Tiger win jump properties
    WIN_TIGER_JUMP_DURATION: 0.6,
    WIN_TIGER_JUMP_SCALE: 0.85,
    WIN_TIGER_JUMP_OFFSET_Y: -80,
    
    // "Going Wild" text pop-up properties
    WIN_TEXT_SCALE: 0.55,
    WIN_TEXT_DURATION: 0.5,
    
    // How long to wait on the win screen before resetting the game
    WIN_WAIT_TIME: 2.5,
    
    // Reset sequence timings
    RESET_TEXT_HIDE_DURATION: 0.3,
    RESET_TIGER_RETURN_DURATION: 0.5,
    
    // Bar movement properties
    BAR_OPEN_DURATION: 0.5,
    BAR_CLOSE_DURATION: 0.2,
    BAR_OPEN_EASE: 'back.out(1.2)',
    BAR_CLOSE_EASE: 'power2.in',

    // Pips (LED indicators) animation properties
    FAIL_PIP_SHAKE_SCALE: 1.5,
    FAIL_PIP_SHAKE_DURATION: 0.3,
    PIP_POP_SCALE: 1.8,
    PIP_POP_DURATION: 0.4
  }
};