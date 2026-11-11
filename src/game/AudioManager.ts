import { CONFIG } from '../config';

export class AudioManager {
  private static instance: AudioManager;

  private bgmList: HTMLAudioElement[] = [];
  private currentBgmIndex = 0;
  private isBgmPlaying = false;
  
  private sfxError: HTMLAudioElement;
  private sfxUnlock: HTMLAudioElement;
  private sfxTigerRoar: HTMLAudioElement;
  private sfxSuccess: HTMLAudioElement;
  private sfxSwitch: HTMLAudioElement; // NEW
  private bgmGameOver: HTMLAudioElement;
  private bgmVictory: HTMLAudioElement;

  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private musicMuted = false;
  private sfxMuted = false;

  private constructor() {
    this.bgmList = [
      new Audio(CONFIG.AUDIO.BGM_1),
      new Audio(CONFIG.AUDIO.BGM_2)
    ];
    this.bgmList.forEach(bgm => bgm.loop = false);

    this.sfxError = new Audio(CONFIG.AUDIO.SFX_ERROR);
    this.sfxUnlock = new Audio(CONFIG.AUDIO.SFX_UNLOCK);
    this.sfxTigerRoar = new Audio(CONFIG.AUDIO.TIGER_ROAR);
    this.sfxSuccess = new Audio(CONFIG.AUDIO.SFX_SUCCESS);
    this.sfxSwitch = new Audio(CONFIG.AUDIO.SFX_SWITCH); // NEW
    this.bgmGameOver = new Audio(CONFIG.AUDIO.GAME_OVER);
    this.bgmVictory = new Audio(CONFIG.AUDIO.VICTORY);

    this.loadSettings();
    this.applySettings();

    this.bgmList.forEach((bgm, index) => {
      bgm.addEventListener('ended', () => {
        if (this.isBgmPlaying) {
          this.currentBgmIndex = (index + 1) % 2;
          this.playBgm();
        }
      });
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) AudioManager.instance = new AudioManager();
    return AudioManager.instance;
  }

  private loadSettings() {
    this.musicMuted = localStorage.getItem('tiger_music_muted') === 'true';
    this.sfxMuted = localStorage.getItem('tiger_sfx_muted') === 'true';
    
    const savedMusicVol = localStorage.getItem('tiger_music_vol');
    if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);
    
    const savedSfxVol = localStorage.getItem('tiger_sfx_vol');
    if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);
  }

  public saveSettings(mVol: number, sVol: number, mMute: boolean, sMute: boolean) {
    this.musicVolume = mVol;
    this.sfxVolume = sVol;
    this.musicMuted = mMute;
    this.sfxMuted = sMute;
    
    localStorage.setItem('tiger_music_vol', mVol.toString());
    localStorage.setItem('tiger_sfx_vol', sVol.toString());
    localStorage.setItem('tiger_music_muted', mMute.toString());
    localStorage.setItem('tiger_sfx_muted', sMute.toString());
    
    this.applySettings();
  }

  private applySettings() {
    this.bgmList.forEach(bgm => { bgm.volume = this.musicVolume; bgm.muted = this.musicMuted; });
    this.bgmGameOver.volume = this.musicVolume;
    this.bgmGameOver.muted = this.musicMuted;
    this.bgmVictory.volume = this.musicVolume;
    this.bgmVictory.muted = this.musicMuted;
    
    this.sfxError.volume = this.sfxVolume;
    this.sfxError.muted = this.sfxMuted;
    this.sfxUnlock.volume = this.sfxVolume;
    this.sfxUnlock.muted = this.sfxMuted;
    this.sfxTigerRoar.volume = this.sfxVolume;
    this.sfxTigerRoar.muted = this.sfxMuted;
    this.sfxSuccess.volume = this.sfxVolume;
    this.sfxSuccess.muted = this.sfxMuted;
    this.sfxSwitch.volume = this.sfxVolume; // NEW
    this.sfxSwitch.muted = this.sfxMuted;   // NEW
  }

  // --- LIVE PREVIEW METHODS (For real-time UI control) ---
  public setLiveMusicVolume(vol: number) {
    this.musicVolume = vol;
    this.bgmList.forEach(bgm => bgm.volume = vol);
    this.bgmGameOver.volume = vol;
    this.bgmVictory.volume = vol;
  }

  public setLiveSfxVolume(vol: number) {
    this.sfxVolume = vol;
    this.sfxError.volume = vol;
    this.sfxUnlock.volume = vol;
    this.sfxTigerRoar.volume = vol;
    this.sfxSuccess.volume = vol;
    this.sfxSwitch.volume = vol; // NEW
  }

  public setLiveMusicMute(mute: boolean) {
    this.musicMuted = mute;
    this.bgmList.forEach(bgm => bgm.muted = mute);
    this.bgmGameOver.muted = mute;
    this.bgmVictory.muted = mute;
  }

  public setLiveSfxMute(mute: boolean) {
    this.sfxMuted = mute;
    this.sfxError.muted = mute;
    this.sfxUnlock.muted = mute;
    this.sfxTigerRoar.muted = mute;
    this.sfxSuccess.muted = mute;
    this.sfxSwitch.muted = mute; // NEW
  }

  public playSfxPreview() {
    this.sfxUnlock.currentTime = 0;
    this.sfxUnlock.play().catch(e => console.log(e));
  }

  // Getters for UI
  public getMusicVolume(): number { return this.musicVolume; }
  public getSfxVolume(): number { return this.sfxVolume; }
  public getIsMusicMuted(): boolean { return this.musicMuted; }
  public getIsSfxMuted(): boolean { return this.sfxMuted; }

  // --- ФОНОВА МУЗИКА ---
  public startRandomBgm() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.currentBgmIndex = Math.floor(Math.random() * 2);
    this.playBgm();
  }

  private playBgm() {
    this.stopAllMusic();
    this.isBgmPlaying = true;
    this.bgmList[this.currentBgmIndex].play().catch(e => console.log("Autoplay prevented:", e));
  }

  public stopAllMusic() {
    this.bgmList.forEach(bgm => { bgm.pause(); bgm.currentTime = 0; });
    this.bgmGameOver.pause();
    this.bgmGameOver.currentTime = 0;
    this.bgmVictory.pause();
    this.bgmVictory.currentTime = 0;
    this.isBgmPlaying = false;
  }

  // --- СПЕЦИАЛНИ МУЗИКИ ---
  public playGameOverMusic() {
    this.stopAllMusic();
    this.bgmGameOver.play().catch(e => console.log(e));
  }

  public playVictoryMusic() {
    this.stopAllMusic();
    this.bgmVictory.play().catch(e => console.log(e));
  }

  // --- ЗВУКОВИ ЕФЕКТИ ---
  public playSfxError() { this.sfxError.currentTime = 0; this.sfxError.play().catch(e => console.log(e)); }
  public playSfxUnlock() { this.sfxUnlock.currentTime = 0; this.sfxUnlock.play().catch(e => console.log(e)); }
  public playTigerRoar() { this.sfxTigerRoar.currentTime = 0; this.sfxTigerRoar.play().catch(e => console.log(e)); }
  public playSfxSuccess() { this.sfxSuccess.currentTime = 0; this.sfxSuccess.play().catch(e => console.log(e)); }
  
  // NEW: Switch sound effect for Level 1
  public playSfxSwitch() { 
    this.sfxSwitch.currentTime = 0; 
    this.sfxSwitch.play().catch(e => console.log(e)); 
  }
}