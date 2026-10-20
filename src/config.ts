export const CONFIG = {
  // Base resolution of the game design (used for responsive scaling)
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
    
    // Horizontal offset for the number labels on the left bars (1, 2, 3)
    TEXT_OFFSET_LEFT: 250,  
    
    // Horizontal offset for the number labels on the right bars (4, 5, 6)
    TEXT_OFFSET_RIGHT: 226  
  }
};