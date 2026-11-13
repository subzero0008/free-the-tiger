import { Application, Container, Sprite, Assets, Text } from 'pixi.js';
import gsap from 'gsap';
import { CONFIG } from '../config';
import { Cage } from './Cage';
import { PipManager } from './PipManager';
import { HintBubble } from './HintBubble';
import { PuzzleDisplay } from './PuzzleDisplay';
import { IntroScreen } from './IntroScreen';
import { NicknameScreen } from './NicknameScreen';
import { LevelIntro } from './LevelIntro';
import { VictoryScreen } from './VictoryScreen';
import { GameOverScreen } from './GameOverScreen';
import { QuitPromptScreen } from './QuitPromptScreen';
import { HintPromptScreen } from './HintPromptScreen';
import { LeaderboardScreen } from './LeaderboardScreen';
import { wait } from '../utils/wait';
import { Bar } from './Bar';
import { generateLevel1Sequence, type FlashStep } from './Level1Puzzles';
import { generateLevel2Puzzle, type ImpostorPuzzle } from './Level2Puzzles';
import { generateLevel3Puzzles, type MathPuzzle } from './Level3Puzzles';
import { AudioManager } from './AudioManager';
import { SettingsMenu } from './SettingsMenu';
import { supabase } from '../utils/supabase';

const GameState = {
  SCREENS: 'SCREENS',
  LEVEL_1_WATCH: 'LEVEL_1_WATCH',
  LEVEL_1_PLAY: 'LEVEL_1_PLAY',
  LEVEL_2: 'LEVEL_2',
  LEVEL_3: 'LEVEL_3',
  WIN: 'WIN'
} as const;
type GameState = typeof GameState[keyof typeof GameState];

export class Game {
  private app: Application;
  private bg: Sprite;
  private root: Container;
  private uiLayer: Container;
  private signature: Text;
  private plate: Sprite;
  private settingsMenu: SettingsMenu;
  private audioManager: AudioManager;

  private cageObj: Cage;
  private pipManager: PipManager;
  private hintBubble: HintBubble;
  private puzzleDisplay: PuzzleDisplay;

  private introScreen: IntroScreen | null = null;
  private nicknameScreen: NicknameScreen | null = null;
  private levelIntro: LevelIntro | null = null;
  private victoryScreen: VictoryScreen | null = null;
  private gameOverScreen: GameOverScreen | null = null;
  private quitPromptScreen: QuitPromptScreen | null = null;
  private hintPromptScreen: HintPromptScreen | null = null;
  private leaderboardScreen: LeaderboardScreen | null = null;

  private levelText: Text;
  private timerText: Text;

  private sessionId = 0;
  private isAnimating = false;
  private currentState: GameState = GameState.SCREENS;

  private level1Sequence: FlashStep[] = [];
  private level1Step = 0;

  private level2Step = 0;
  private currentLevel2Puzzle: ImpostorPuzzle | null = null;

  private level3Puzzles: MathPuzzle[] = [];
  private level3Step = 0;

  private currentHints: string[] = [];
  private hintsRemaining = 3;
  private totalHintsUsed = 0;

  private playerName: string = '';

  // TIMER STATE
  private runStartTime = 0;
  private runEndTime = 0;
  private pausedTime = 0;
  private isTimerRunning = false;

  constructor(app: Application) {
    this.app = app;
    this.root = new Container();
    this.root.sortableChildren = true;

    localStorage.removeItem('freeTheTigerBestTime');

    // Зареждаме запазеното име от localStorage
    this.playerName = localStorage.getItem('tiger_player_name') || '';
    console.log(`👤 Loaded player name from localStorage: "${this.playerName}"`);

    this.audioManager = AudioManager.getInstance();
    this.settingsMenu = new SettingsMenu(this.app);

    this.settingsMenu.onOpen = () => this.pauseTimer();
    this.settingsMenu.onClose = () => this.resumeTimer();

    this.bg = new Sprite(Assets.get(CONFIG.ASSETS.BG));
    this.bg.anchor.set(0.5);
    this.app.stage.addChild(this.bg);

    this.app.stage.addChild(this.root);

    this.uiLayer = new Container();
    this.app.stage.addChild(this.uiLayer);

    // 👇 ПЪРВО СЪЗДАВАМЕ ОБЕКТИТЕ
    this.cageObj = new Cage();
    this.pipManager = new PipManager();
    this.hintBubble = new HintBubble();
    this.puzzleDisplay = new PuzzleDisplay();

    // 👇 СЛЕД ТОВА ГИ ДОБАВЯМЕ КЪМ СЦЕНАТА
    this.app.stage.addChild(this.hintBubble.container); // Hint Bubble вече е на главната сцена
    this.app.stage.addChild(this.settingsMenu);

    this.plate = new Sprite(Assets.get(CONFIG.ASSETS.PLATE));
    this.plate.anchor.set(0.5);
    this.plate.scale.set(CONFIG.LAYOUT.PLATE.SCALE);
    this.plate.zIndex = CONFIG.LAYOUT.PLATE.Z_INDEX;

    this.root.addChild(this.plate);
    this.root.addChild(this.pipManager.container);
    this.root.addChild(this.cageObj.container);
    this.root.addChild(this.puzzleDisplay);
    // this.root.addChild(this.hintBubble.container); // Премахнато от тук

    this.signature = new Text({
      text: '© Yulian Yuriev',
      style: { fontFamily: 'Arial, sans-serif', fontSize: CONFIG.LAYOUT.SIGNATURE.FONT_SIZE, fill: 0xFFFFFF, fontWeight: 'normal' }
    });
    this.signature.anchor.set(0, 1);
    this.app.stage.addChild(this.signature);

    this.levelText = new Text({
      text: '',
      style: { fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 50, fill: 0xFFD700, fontWeight: 'bold', stroke: { color: 0x000000, width: 8 }, dropShadow: { color: 0x000000, blur: 4, distance: 4, angle: Math.PI / 2, alpha: 0.8 } }
    });
    this.levelText.anchor.set(0.5);
    this.levelText.zIndex = 100;
    this.root.addChild(this.levelText);

    this.timerText = new Text({
      text: '00:00',
      style: { fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 40, fill: 0xFFFFFF, fontWeight: 'bold', stroke: { color: 0x000000, width: 6 } }
    });
    this.timerText.anchor.set(0.5);
    this.timerText.zIndex = 100;
    this.root.addChild(this.timerText);

    this.cageObj.bars.forEach(bar => {
      bar.on('pointerdown', () => this.handleBarClick(bar));
    });

    this.app.ticker.add(() => this.updateTimerLoop());

    // FIX: Винаги стартираме с Intro екран
    this.showIntro();
    
    this.layout();
  }

  private formatTime(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private getElapsedTime(): number {
    if (!this.isTimerRunning) return this.pausedTime;
    return this.pausedTime + (performance.now() - this.runStartTime);
  }

  private updateTimerLoop() {
    if (!this.isTimerRunning) return;
    const elapsed = this.getElapsedTime();
    this.timerText.text = this.formatTime(elapsed);

    if (elapsed > CONFIG.TIMER.LIMIT_GAMEOVER * 1000) {
      this.isTimerRunning = false;
      this.triggerGameOver(CONFIG.GAME_OVER.TIME_UP_TITLE, CONFIG.GAME_OVER.TIME_UP_MESSAGE);
      return;
    }

    if (elapsed > CONFIG.TIMER.LIMIT_RED * 1000) {
      this.timerText.style.fill = 0xFF3333;
    } else {
      this.timerText.style.fill = 0xFFFFFF;
    }
  }

  private startTimer() {
    this.pausedTime = 0;
    this.runStartTime = performance.now();
    this.isTimerRunning = true;
    this.timerText.visible = true;
    this.timerText.style.fill = 0xFFFFFF;
  }

  private stopTimer() {
    this.runEndTime = this.getElapsedTime(); 
    this.isTimerRunning = false;
    console.log(`⏱️ Timer stopped at: ${this.runEndTime}ms`);
  }

  private pauseTimer() {
    if (!this.isTimerRunning) return;
    this.pausedTime += performance.now() - this.runStartTime;
    this.isTimerRunning = false;
  }

  private resumeTimer() {
    if (this.currentState === GameState.SCREENS || this.currentState === GameState.WIN) return;
    if (this.isTimerRunning) return;
    this.runStartTime = performance.now();
    this.isTimerRunning = true;
  }

  private killTweensRecursive(container: Container) {
    gsap.killTweensOf(container);
    container.children.forEach((child: any) => {
      gsap.killTweensOf(child);
      if (child.children) {
        this.killTweensRecursive(child);
      }
      if (child.scale) gsap.killTweensOf(child.scale);
    });
  }

  private clearScreens() {
    this.killTweensRecursive(this.uiLayer);

    if (this.introScreen) { this.uiLayer.removeChild(this.introScreen); this.introScreen.destroy({ children: true }); this.introScreen = null; }
    if (this.nicknameScreen) { this.uiLayer.removeChild(this.nicknameScreen); this.nicknameScreen.destroy({ children: true }); this.nicknameScreen = null; }
    if (this.levelIntro) { this.uiLayer.removeChild(this.levelIntro); this.levelIntro.destroy({ children: true }); this.levelIntro = null; }
    if (this.victoryScreen) { this.uiLayer.removeChild(this.victoryScreen); this.victoryScreen.destroy({ children: true }); this.victoryScreen = null; }
    if (this.gameOverScreen) { this.uiLayer.removeChild(this.gameOverScreen); this.gameOverScreen.destroy({ children: true }); this.gameOverScreen = null; }
    if (this.quitPromptScreen) { this.uiLayer.removeChild(this.quitPromptScreen); this.quitPromptScreen.destroy({ children: true }); this.quitPromptScreen = null; }
    if (this.hintPromptScreen) { this.uiLayer.removeChild(this.hintPromptScreen); this.hintPromptScreen.destroy({ children: true }); this.hintPromptScreen = null; }
    if (this.leaderboardScreen) { this.uiLayer.removeChild(this.leaderboardScreen); this.leaderboardScreen.destroy({ children: true }); this.leaderboardScreen = null; }
  }

  private resetLevelState() {
    this.cageObj.bars.forEach(b => b.resetVisuals());
    this.pipManager.reset();
    this.puzzleDisplay.hideInstant();
    this.hintBubble.forceClose();
    this.hintBubble.container.visible = false;
    this.hintBubble.onCustomClick = undefined;
    this.cageObj.bars.forEach(b => b.setInteractive(true));
  }

  private resetFullGame() {
    this.resetLevelState();
    this.cageObj.reset();
    this.levelText.text = '';
    this.timerText.text = '00:00';
    this.timerText.visible = false;
    this.isTimerRunning = false;
    this.pausedTime = 0;
    this.isAnimating = false;
    this.totalHintsUsed = 0;
  }

  // ========================================
  // INTRO & NICKNAME
  // ========================================

  private showIntro() {
    this.currentState = GameState.SCREENS;
    this.sessionId++;
    this.isAnimating = false;
    this.clearScreens();
    this.resetFullGame();

    this.audioManager.stopAllMusic();
    this.audioManager.startRandomBgm();

    // FIX: Проверката за никнейм се случва след натискане на Start Game
    this.introScreen = new IntroScreen(() => {
      if (this.playerName) {
        this.showLevel1Intro();
      } else {
        this.showNicknameScreen();
      }
    });
    this.uiLayer.addChild(this.introScreen);
    this.updateScreenBackgrounds();
  }

  private showNicknameScreen() {
    this.currentState = GameState.SCREENS;
    this.clearScreens();

    this.nicknameScreen = new NicknameScreen(
      (nickname) => {
        this.playerName = nickname;
        localStorage.setItem('tiger_player_name', nickname);
        console.log(`👤 Player set and saved: "${this.playerName}"`);
        this.showLevel1Intro();
      },
      () => this.showLeaderboard()
    );
    this.uiLayer.addChild(this.nicknameScreen);
    this.updateScreenBackgrounds();
  }

  private showLeaderboard() {
    this.currentState = GameState.SCREENS;
    this.clearScreens();

    this.leaderboardScreen = new LeaderboardScreen(this.playerName, () => this.showIntro());
    this.uiLayer.addChild(this.leaderboardScreen);
    this.updateScreenBackgrounds();
  }

  private showLevel1Intro() {
    this.currentState = GameState.SCREENS;
    this.clearScreens();
    this.resetLevelState();
    this.hintsRemaining = 3;

    this.levelIntro = new LevelIntro(
      CONFIG.SCREENS.LEVEL_1_INTRO.TITLE, CONFIG.SCREENS.LEVEL_1_INTRO.SUBTITLE,
      CONFIG.SCREENS.LEVEL_1_INTRO.INSTRUCTIONS, CONFIG.SCREENS.LEVEL_1_INTRO.READY_BUTTON,
      () => void this.startLevel1()
    );
    this.uiLayer.addChild(this.levelIntro);
    this.updateScreenBackgrounds();
  }

  private showLevel2Intro() {
    this.currentState = GameState.SCREENS;
    this.clearScreens();
    this.resetLevelState();
    this.hintsRemaining = 3;

    this.levelIntro = new LevelIntro(
      CONFIG.SCREENS.LEVEL_2_INTRO.TITLE, CONFIG.SCREENS.LEVEL_2_INTRO.SUBTITLE,
      CONFIG.SCREENS.LEVEL_2_INTRO.INSTRUCTIONS, CONFIG.SCREENS.LEVEL_2_INTRO.READY_BUTTON,
      () => void this.startLevel2()
    );
    this.uiLayer.addChild(this.levelIntro);
    this.updateScreenBackgrounds();
  }

  private showLevel3Intro() {
    this.currentState = GameState.SCREENS;
    this.clearScreens();
    this.resetLevelState();
    this.hintsRemaining = 3;

    this.levelIntro = new LevelIntro(
      CONFIG.SCREENS.LEVEL_3_INTRO.TITLE, CONFIG.SCREENS.LEVEL_3_INTRO.SUBTITLE,
      CONFIG.SCREENS.LEVEL_3_INTRO.INSTRUCTIONS, CONFIG.SCREENS.LEVEL_3_INTRO.READY_BUTTON,
      () => void this.startLevel3()
    );
    this.uiLayer.addChild(this.levelIntro);
    this.updateScreenBackgrounds();
  }

  // ========================================
  // VICTORY & GAME OVER
  // ========================================

  private async showVictoryScreen() {
    this.currentState = GameState.SCREENS;
    this.clearScreens();
    
    const currentTimeMs = Math.floor(this.runEndTime); 
    const timeStr = this.formatTime(currentTimeMs);
    const hintsUsed = this.totalHintsUsed;

    console.log(`🏁 Victory! Time: ${currentTimeMs}ms, Hints: ${hintsUsed}, Player: "${this.playerName}"`);

    const priorBest = await this.getBestTimeForPlayer(this.playerName);
    await this.saveScoreToDatabase(currentTimeMs, hintsUsed);
    
    let bestTimeStr = timeStr;
    let isNewRecord = false;
    
    if (priorBest === null) {
      isNewRecord = true;
    } else if (currentTimeMs < priorBest) {
      isNewRecord = true;
      bestTimeStr = timeStr;
    } else {
      bestTimeStr = this.formatTime(priorBest);
    }

    this.resetFullGame();

    this.victoryScreen = new VictoryScreen(
      timeStr, bestTimeStr, isNewRecord, hintsUsed,
      () => this.showIntro(),
      () => this.showLeaderboard()
    );
    this.uiLayer.addChild(this.victoryScreen);
    this.updateScreenBackgrounds();
  }

  private triggerGameOver(title: string, message: string) {
    this.currentState = GameState.SCREENS;
    this.sessionId++;
    this.clearScreens();
    this.resetFullGame();
    this.isAnimating = false;

    this.audioManager.playGameOverMusic();

    this.gameOverScreen = new GameOverScreen(
      title, message,
      () => this.showIntro(),
      () => this.showLeaderboard()
    );
    this.uiLayer.addChild(this.gameOverScreen);
    this.updateScreenBackgrounds();
  }

  // ========================================
  // DATABASE
  // ========================================

  private async getBestTimeForPlayer(nickname: string): Promise<number | null> {
    if (!nickname) return null;
    
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('time_ms')
        .eq('nickname', nickname)
        .order('time_ms', { ascending: true })
        .limit(1);

      if (error) {
        console.error('❌ Error fetching best time:', error);
        return null;
      }
      
      if (data && data.length > 0) return data[0].time_ms;
      return null;
    } catch (err) {
      console.error('❌ Exception fetching best time:', err);
      return null;
    }
  }

  private async saveScoreToDatabase(timeMs: number, hints: number) {
    if (!this.playerName) {
      console.warn("⚠️ No player name found, skipping leaderboard save.");
      return;
    }

    console.log(`💾 Attempting to save: Name="${this.playerName}", Time=${timeMs}, Hints=${hints}`);

    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .insert({
          nickname: this.playerName,
          time_ms: timeMs,
          hints_used: hints
        })
        .select();

      if (error) {
        console.error('❌ Supabase Error saving score:');
        console.error(`   Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        console.error(`   Details: ${error.details}`);
        console.error(`   Hint: ${error.hint}`);
      } else {
        console.log('✅ Score saved successfully! Data:', data);
      }
    } catch (err) {
      console.error('❌ Failed to save score (exception):', err);
    }
  }

  // ========================================
  // HINTS
  // ========================================

  private restoreDefaultHintText() {
    if (this.currentState === GameState.LEVEL_2 && this.currentLevel2Puzzle) {
      if (this.hintsRemaining === 0) {
        this.hintBubble.setText(this.currentLevel2Puzzle.directHint);
      } else {
        this.hintBubble.setText(this.currentLevel2Puzzle.hint);
      }
    } else if (this.hintsRemaining > 0) {
      this.hintBubble.setText('Click ? for hints.');
    } else {
      this.hintBubble.setText('No more hints.');
    }
  }

  private openHintPrompt() {
    if (this.isAnimating || this.quitPromptScreen || this.hintPromptScreen) return;

    if (this.hintsRemaining > 0) {
      this.hintPromptScreen = new HintPromptScreen(
        this.hintsRemaining, 3,
        () => {
          this.clearScreens();
          this.hintsRemaining--;
          this.totalHintsUsed++;
          
          const hintIndex = 3 - this.hintsRemaining - 1;
          
          if (this.currentState === GameState.LEVEL_2 && this.hintsRemaining === 0) {
            if (this.currentLevel2Puzzle) {
              this.hintBubble.setText(this.currentLevel2Puzzle.directHint);
            } else {
              this.hintBubble.setText("Select the correct bar.");
            }
          } else {
            this.hintBubble.setText(this.currentHints[hintIndex]);
          }
          this.hintBubble.openPanel();
        },
        () => {
          this.clearScreens();
          this.restoreDefaultHintText();
        }
      );
      this.uiLayer.addChild(this.hintPromptScreen);
    } else {
      if (this.currentState === GameState.LEVEL_3) {
        this.hintBubble.setText('No more hints. 😢');
        this.hintBubble.openPanel();
        
        this.quitPromptScreen = new QuitPromptScreen(
          () => {
            this.clearScreens();
            this.triggerGameOver(CONFIG.GAME_OVER.QUIT_TITLE, CONFIG.GAME_OVER.QUIT_MESSAGE);
          },
          () => {
            this.clearScreens();
            this.hintBubble.setText('No more hints. 😢');
          }
        );
        this.uiLayer.addChild(this.quitPromptScreen);
      } else if (this.currentState === GameState.LEVEL_2) {
        if (this.currentLevel2Puzzle) {
          this.hintBubble.setText(this.currentLevel2Puzzle.directHint);
        } else {
          this.hintBubble.setText("Select the correct bar.");
        }
        this.hintBubble.openPanel();
      } else {
        this.hintBubble.setText('No more hints.');
        this.hintBubble.openPanel();
      }
    }
    this.updateScreenBackgrounds();
  }

  private updateScreenBackgrounds() {
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;
    const uiScale = Math.min(screenW / 1920, screenH / 1080) * 0.9;
    const bgW = screenW / uiScale;
    const bgH = screenH / uiScale;

    if (this.introScreen) this.introScreen.updateBackground(bgW, bgH);
    if (this.nicknameScreen) this.nicknameScreen.updateBackground(bgW, bgH);
    if (this.levelIntro) this.levelIntro.updateBackground(bgW, bgH);
    if (this.victoryScreen) this.victoryScreen.updateBackground(bgW, bgH);
    if (this.gameOverScreen) this.gameOverScreen.updateBackground(bgW, bgH);
    if (this.hintPromptScreen) this.hintPromptScreen.updateBackground(bgW, bgH);
    if (this.leaderboardScreen) this.leaderboardScreen.updateBackground(bgW, bgH);
  }

  public layout() {
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    const bgScaleX = screenW / this.bg.texture.width;
    const bgScaleY = screenH / this.bg.texture.height;
    const bgScale = Math.max(bgScaleX, bgScaleY);

    this.bg.scale.set(bgScale);
    this.bg.x = screenW / 2;
    this.bg.y = screenH / 2;

    const isPortrait = screenH > screenW;

    if (isPortrait) {
      this.plate.position.set(CONFIG.LAYOUT.CAGE.X, CONFIG.PORTRAIT.PLATE_Y);
      this.pipManager.setPosition(CONFIG.LAYOUT.CAGE.X, CONFIG.PORTRAIT.PLATE_Y);
      
      this.levelText.x = CONFIG.LAYOUT.CAGE.X;
      this.levelText.y = CONFIG.PORTRAIT.PLATE_Y - 300; 
      
      this.timerText.x = CONFIG.LAYOUT.CAGE.X;
      this.timerText.y = CONFIG.PORTRAIT.PLATE_Y - 220;

      this.cageObj.setPortraitLayout(true);
      this.puzzleDisplay.position.set(CONFIG.LAYOUT.CAGE.X, CONFIG.PORTRAIT.PUZZLE_DISPLAY_Y);
    } else {
      this.plate.position.set(CONFIG.LAYOUT.PLATE.X, CONFIG.LAYOUT.PLATE.Y);
      this.pipManager.setPosition(CONFIG.LAYOUT.PLATE.X, CONFIG.LAYOUT.PLATE.Y);
      
      this.levelText.x = CONFIG.LAYOUT.PLATE.X;
      this.levelText.y = CONFIG.LAYOUT.PLATE.Y - 420; 

      this.timerText.x = CONFIG.LAYOUT.PLATE.X;
      this.timerText.y = CONFIG.LAYOUT.PLATE.Y - 340;

      this.cageObj.setPortraitLayout(false);
      this.puzzleDisplay.position.set(CONFIG.LAYOUT.PUZZLE_DISPLAY.X, CONFIG.LAYOUT.PUZZLE_DISPLAY.Y);
    }

    this.root.scale.set(1);
    const bounds = this.root.getLocalBounds();

    const padding = 0.90;
    const scaleX = (screenW * padding) / bounds.width;
    const scaleY = (screenH * padding) / bounds.height;
    const gameScale = Math.min(scaleX, scaleY);

    this.root.scale.set(gameScale);

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    this.root.x = (screenW / 2) - (centerX * gameScale);
    this.root.y = (screenH / 2) - (centerY * gameScale);

    const uiScale = Math.min(screenW / 1920, screenH / 1080) * 0.9;
    this.uiLayer.scale.set(uiScale);
    this.uiLayer.x = screenW / 2;
    this.uiLayer.y = screenH / 2;

    this.updateScreenBackgrounds();

    if (this.signature) {
      this.signature.x = CONFIG.LAYOUT.SIGNATURE.OFFSET_X;
      this.signature.y = screenH - CONFIG.LAYOUT.SIGNATURE.OFFSET_Y;
    }
    
    // FIX: Намаляваме зъбното колелце на мобилни устройства
    const isMobile = screenW < 768;
    const settingsScale = isMobile ? 0.6 : 1;
    this.settingsMenu.scale.set(settingsScale);
    this.settingsMenu.x = isMobile ? 50 : 80;
    this.settingsMenu.y = isMobile ? 50 : 80;
    
    this.settingsMenu.repositionModal();

    // 👇 НОВО: Позиционираме Hint Bubble симетрично на настройките (вдясно)
    const hintScale = isMobile ? 0.6 : 1; 
    this.hintBubble.container.scale.set(hintScale);
    
    // Симетрия: Ако настройките са на 50px от ляво, Hint Bubble е на 50px от дясно
    this.hintBubble.container.x = screenW - (isMobile ? 50 : 80); 
    this.hintBubble.container.y = isMobile ? 50 : 80;
  }

  // ========================================
  // LEVELS
  // ========================================
  
  private async startLevel1() {
    const currentSession = ++this.sessionId;
    this.isAnimating = true;

    try {
      this.clearScreens();
      this.currentState = GameState.LEVEL_1_WATCH;
      this.level1Step = 0;
      this.resetLevelState(); 

      this.levelText.text = 'LEVEL 1';
      if (!this.isTimerRunning) this.startTimer();

      this.currentHints = CONFIG.LEVEL_1.HINTS;
      this.hintBubble.onCustomClick = () => this.openHintPrompt();
      this.hintBubble.setText('Watch carefully...');
      this.hintBubble.container.visible = false;

      this.cageObj.bars.forEach(b => b.resetVisuals());
      this.cageObj.bars.forEach(b => b.setInteractive(false));

      await wait(CONFIG.LEVEL_1.START_DELAY);
      if (this.sessionId !== currentSession) return;

      this.level1Sequence = generateLevel1Sequence();

      for (const step of this.level1Sequence) {
        if (this.sessionId !== currentSession) return;
        const bar = this.cageObj.bars.find(b => b.id === step.barId);
        if (!bar) continue;
        
        this.audioManager.playSfxSwitch(); 
        
        await bar.flash(step.color);
        await wait(CONFIG.LEVEL_1.FLASH_DELAY);
      }

      if (this.sessionId !== currentSession) return;

      this.currentState = GameState.LEVEL_1_PLAY;
      this.hintBubble.closePanel();
      this.hintBubble.setText('Click ? for hints.');
      this.hintBubble.container.visible = true;
      
    } catch (error) {
      console.error("Error in Level 1:", error);
    } finally {
      if (this.sessionId === currentSession) {
        this.isAnimating = false;
        this.cageObj.bars.forEach(b => b.setInteractive(true));
      }
    }
  }

  private async failLevel1() {
    this.isAnimating = true;
    this.hintBubble.closePanel();
    await wait(0.5);
    await this.cageObj.slamShutOpenBars();
    void this.startLevel1();
  }

  private async completeLevel1() {
    this.isAnimating = true;
    this.audioManager.playSfxSuccess();
    await wait(0.5);
    this.showLevel2Intro();
  }

  private async startLevel2() {
    const currentSession = ++this.sessionId;
    this.isAnimating = true;

    try {
      this.clearScreens();
      this.currentState = GameState.LEVEL_2;
      this.level2Step = 0;

      this.resetLevelState();

      this.levelText.text = 'LEVEL 2';
      this.hintBubble.container.visible = true;

      this.currentHints = CONFIG.LEVEL_2.HINTS;
      this.hintBubble.onCustomClick = () => this.openHintPrompt();

      this.showNextLevel2Puzzle();
    } catch (error) {
      console.error("Error in Level 2:", error);
    } finally {
      if (this.sessionId === currentSession) {
        this.isAnimating = false;
        this.cageObj.bars.forEach(b => b.setInteractive(true));
      }
    }
  }

  private showNextLevel2Puzzle() {
    if (this.level2Step >= 6) {
      void this.completeLevel2();
      return;
    }
    const unopenedBars = this.cageObj.bars.filter(b => !b.isOpen).map(b => b.id);
    this.currentLevel2Puzzle = generateLevel2Puzzle(unopenedBars);
    this.hintBubble.setText(this.currentLevel2Puzzle.hint);
    this.puzzleDisplay.showImpostorPuzzle(this.currentLevel2Puzzle.numbers, this.currentLevel2Puzzle.hint);
  }

  private async failLevel2() {
    this.isAnimating = true;
    this.hintBubble.closePanel();
    await wait(0.5);
    await this.cageObj.slamShutOpenBars();
    void this.startLevel2();
  }

  private async completeLevel2() {
    this.isAnimating = true;
    this.audioManager.playSfxSuccess();
    await wait(0.5);
    this.puzzleDisplay.hidePuzzle();
    this.pipManager.reset();
    this.showLevel3Intro();
  }

  private async startLevel3() {
    const currentSession = ++this.sessionId;
    this.isAnimating = true;

    try {
      this.clearScreens();
      this.currentState = GameState.LEVEL_3;
      this.level3Step = 0;

      this.resetLevelState();

      this.levelText.text = 'LEVEL 3';
      this.hintBubble.container.visible = true;

      this.currentHints = CONFIG.LEVEL_3.HINTS;
      this.hintBubble.onCustomClick = () => this.openHintPrompt();
      this.hintBubble.setText('Click ? for hints.');

      this.level3Puzzles = generateLevel3Puzzles();
      this.showNextLevel3Puzzle();
    } catch (error) {
      console.error("Error in Level 3:", error);
    } finally {
      if (this.sessionId === currentSession) {
        this.isAnimating = false;
        this.cageObj.bars.forEach(b => b.setInteractive(true));
      }
    }
  }

  private showNextLevel3Puzzle() {
    if (this.level3Step >= 6) {
      void this.triggerWin();
      return;
    }
    const puzzle = this.level3Puzzles[this.level3Step];
    this.puzzleDisplay.showMathEquation(puzzle.text);
  }

  private async failLevel3() {
    this.isAnimating = true;
    this.hintBubble.closePanel();
    await wait(1);
    await this.cageObj.slamShutOpenBars();
    void this.startLevel3();
  }

  private async handleBarClick(bar: Bar) {
    if (this.isAnimating || bar.isOpen) return;
    if (this.currentState === GameState.SCREENS || this.currentState === GameState.WIN) return;
    if (this.quitPromptScreen || this.hintPromptScreen) return;

    if (this.currentState === GameState.LEVEL_1_PLAY) {
      const expectedId = this.level1Sequence[this.level1Step].barId;
      if (bar.id === expectedId) {
        bar.open();
        this.pipManager.markAsOpened(bar.id);
        this.audioManager.playSfxUnlock();
        this.level1Step++;

        if (this.level1Step === 6) {
          void this.completeLevel1();
        }
      } else {
        this.pipManager.markAsFailed(bar.id);
        this.audioManager.playSfxError();
        await this.failLevel1();
      }
    }
    else if (this.currentState === GameState.LEVEL_2) {
      if (this.currentLevel2Puzzle) {
        if (bar.id === this.currentLevel2Puzzle.answer) {
          bar.open();
          this.pipManager.markAsOpened(bar.id);
          this.audioManager.playSfxUnlock();
          this.level2Step++;
          this.showNextLevel2Puzzle();
        } else {
          this.pipManager.markAsFailed(bar.id);
          this.audioManager.playSfxError();
          await this.failLevel2();
        }
      }
    }
    else if (this.currentState === GameState.LEVEL_3) {
      const puzzle = this.level3Puzzles[this.level3Step];
      if (bar.id === puzzle.target) {
        bar.open();
        this.pipManager.markAsOpened(bar.id);
        this.audioManager.playSfxUnlock();
        this.level3Step++;
        this.showNextLevel3Puzzle();
      } else {
        this.pipManager.markAsFailed(bar.id);
        this.audioManager.playSfxError();
        await this.failLevel3();
      }
    }
  }

  private async triggerWin() {
    const currentSession = this.sessionId;
    this.currentState = GameState.WIN;
    this.isAnimating = true;
    this.stopTimer();
    this.puzzleDisplay.hidePuzzle();
    this.hintBubble.container.visible = false;
    this.levelText.text = '';

    this.audioManager.playTigerRoar();
    this.audioManager.playVictoryMusic();

    await this.cageObj.playWinSequence();

    if (this.sessionId !== currentSession) return;
    await this.showVictoryScreen();
  }
}