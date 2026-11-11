export const CONFIG = {
  APP_SETTINGS: { BACKGROUND_COLOR: 0x000000, ANTIALIAS: true, FALLBACK_RESOLUTION: 1 },
  DESIGN_WIDTH: 1920,
  DESIGN_HEIGHT: 1080,
  ASSETS: {
    BG: 'assets/background.jpg', CAGE: 'assets/cage.png', TIGER: 'assets/tiger.png',
    BAR: 'assets/bar.png', SHADOW: 'assets/barShadow.png', PLATE: 'assets/plate.png', GOING_WILD: 'assets/txt.png'
  },
  BARS: {
    LEFT_X: 440, RIGHT_X: 1000, OPEN_OFFSET: 400, Y_POSITIONS: [440, 610, 780],
    SCALE: 2.0, TEXT_OFFSET_LEFT: 250, TEXT_OFFSET_RIGHT: 226, Z_INDEX: 10,
    SHADOW_OFFSET_X: 10, SHADOW_OFFSET_Y: 10,
    HIT_AREA_LEFT: { x: 0, y: -50, width: 400, height: 100 },
    HIT_AREA_RIGHT: { x: -20, y: -50, width: 400, height: 100 },
    TEXT_STYLE: {
      fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 48, fill: 0xFFFFFF, fontWeight: 'bold',
      stroke: { color: 0x000000, width: 8 },
      dropShadow: { color: 0x000000, blur: 4, distance: 4, angle: Math.PI / 2, alpha: 0.8 }
    } as const
  },
  LAYOUT: {
    CAGE: { X: 960, Y: 540, SCALE: 0.95, Z_INDEX: 0 },
    TIGER: { X: 940, Y: 960, SCALE: 0.48, Z_INDEX_BACK: 5, Z_INDEX_FRONT: 15 },
    PLATE: { X: 180, Y: 540, SCALE: 0.45, Z_INDEX: 12 },
    GOING_WILD: { X: 960, Y: 800, Z_INDEX: 20 },
    SIGNATURE: { FONT_SIZE: 14, OFFSET_X: 16, OFFSET_Y: 6 },
    PIPS: { START_X: -35, START_Y: -55, SPACING_X: 70, SPACING_Y: 55, RADIUS: 14, STROKE_WIDTH: 4, Z_INDEX: 13 },
    HINT_BUBBLE: { X: 1700, Y: 150, Z_INDEX: 50 },
    PUZZLE_DISPLAY: { X: 1740, Y: 540, Z_INDEX: 14 } // X контролира позицията наляво/надясно
  },
  PORTRAIT: {
    SCALE_DIVISOR: 1300, MAX_HEIGHT: 1600, ROOT_Y_OFFSET: 30,
    PLATE_Y: -680, CAGE_TIGER_OFFSET_Y: -380, PUZZLE_DISPLAY_Y: 850
  },
  ANIMATION: {
    WIN_DELAY: 0.25, FAIL_DELAY: 0.6, WIN_TIGER_JUMP_DURATION: 0.6, WIN_TIGER_JUMP_SCALE: 0.85,
    WIN_TIGER_JUMP_OFFSET_Y: -80, WIN_TEXT_SCALE: 0.55, WIN_TEXT_DURATION: 0.5, WIN_WAIT_TIME: 2.5,
    RESET_TEXT_HIDE_DURATION: 0.3, RESET_TIGER_RETURN_DURATION: 0.5, BAR_OPEN_DURATION: 0.5,
    BAR_CLOSE_DURATION: 0.2, BAR_OPEN_EASE: 'back.out(1.2)', BAR_CLOSE_EASE: 'power2.in',
    FAIL_PIP_SHAKE_SCALE: 1.5, FAIL_PIP_SHAKE_DURATION: 0.3, PIP_POP_SCALE: 1.8, PIP_POP_DURATION: 0.4,
    EQUATION_FADE_DURATION: 0.3
  },
  TIMER: { LIMIT_RED: 360, LIMIT_GAMEOVER: 480 },
  LEVEL_1: {
    COLORS: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF],
    FLASH_DURATION: 0.5, FLASH_DELAY: 0.3, START_DELAY: 1.0,
    HINTS: [
      'Watch the sequence of flashing bars carefully.',
      'Try to remember the order and colors of the bars.',
      'You can do it! Focus on the pattern.'
    ]
  },
  LEVEL_2: {
    TITLE: 'Find the Impostor!', // Default title, will be overwritten dynamically
    HINTS: [
      'Look at the four numbers. Three share a property, one does not.',
      'Check if the numbers are odd, even, prime, or small/large.',
      'The hint text above the numbers will tell you exactly what to look for.'
    ]
  },
  LEVEL_3: {
    HINTS: [
      'Think outside of the box.',
      'This is a puzzle for kindergarten kids. Think a bit more.',
      'No more hints. 😢 If you want to know the answer, contact the creator Yulian Yuriev.'
    ]
  },
  SCREENS: {
    INTRO: {
      TITLE: 'FREE THE TIGER',
      STORY: 'Deep in the jungle, a magnificent tiger has been captured by ruthless hunters. The cage is locked by ancient puzzles. Only the one who solves them all can set him free. Hurry up before the hunters return to claim their prize!',
      START_BUTTON: 'Start Game'
    },
    LEVEL_1_INTRO: {
      TITLE: 'LEVEL 1', SUBTITLE: "The Tiger's Memory",
      INSTRUCTIONS: 'Watch the sequence of flashing bars carefully. When they stop, repeat the sequence by clicking the bars in the same order. One mistake and the bars will slam shut!',
      READY_BUTTON: "I'm Ready"
    },
    LEVEL_2_INTRO: {
      TITLE: 'LEVEL 2', SUBTITLE: 'The Impostor',
      INSTRUCTIONS: 'Congratulations! You passed Level 1.\nEach puzzle shows four numbers on the right side of the screen. Three of them share a hidden pattern, one does not. Find the impostor and click its bar. Beware: the pattern changes each round!',
      READY_BUTTON: "I'm Ready"
    },
    LEVEL_3_INTRO: {
      TITLE: 'LEVEL 3', SUBTITLE: 'The Ancient Riddle',
      INSTRUCTIONS: 'Congratulations! You passed Level 2.\nSolve the equation but be careful, it\'s not that simple. The answer is not what it seems. Look carefully at the numbers and open the right bar to unlock it. Think outside the box!',
      READY_BUTTON: "I'm Ready"
    }
  },
  GAME_OVER: {
    TIME_UP_TITLE: 'GAME OVER',
    TIME_UP_MESSAGE: 'You are too late. 😭 The hunters found the tiger before you could free him.\nNext time, try to be faster! 🏃‍♂️💨',
    QUIT_TITLE: 'GAME OVER',
    QUIT_MESSAGE: 'You decided to quit. 😢 The tiger remains trapped in the cage.\nWill you try again?',
    PLAY_AGAIN: 'Try Again',
    DEMO: 'This is a DEMO version. More levels and difficulties are coming soon!',
    CREATOR: 'Created by: Yulian Yuriev\nEmail: zerosub07@gmail.com'
  },
  VICTORY: {
    TITLE: 'CONGRATULATIONS!',
    MESSAGE: 'You solved all the puzzles and freed the tiger!\nHe is finally back in the wild where he belongs.',
    DEMO: 'This is a DEMO version. More challenging puzzles and levels are coming soon!',
    CREATOR: 'Created by: Yulian Yuriev\nEmail: zerosub07@gmail.com',
    TIME_LABEL: 'Your time: ', BEST_TIME_LABEL: 'Your best time: ',
    HINTS_LABEL: 'Hints used: ',
    NEW_RECORD: 'NEW RECORD!', PLAY_AGAIN: 'Play Again'
  },
     AUDIO: {
    BGM_1: 'assets/audio/Full_SoundTrack.mp3',
    BGM_2: 'assets/audio/Full_SoundTrack2.mp3',
    GAME_OVER: 'assets/audio/Game_Over.mp3',
    VICTORY: 'assets/audio/Victory.mp3',
    SFX_ERROR: 'assets/audio/error-sound-effect.mp3',
    SFX_UNLOCK: 'assets/audio/unlock-game-notification-sound-effect.mp3',
    TIGER_ROAR: 'assets/audio/Tiger Roar Sound Effect.mp3',
    SFX_SUCCESS: 'assets/audio/success - Sound Effect.mp3',
    SFX_SWITCH: 'assets/audio/big-switch-sound-effect_zZk4nriT.mp3' // NEW
  },
};