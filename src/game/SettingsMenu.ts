import { Container, Graphics, Text, Rectangle, Application } from 'pixi.js';
import gsap from 'gsap';
import { AudioManager } from './AudioManager';

class Slider extends Container {
  private track: Graphics;
  private fill: Graphics;
  private thumb: Container;
  private trackWidth = 300;
  public value = 0.5;
  public onChange: (val: number) => void = () => {};
  public onDragEnd: () => void = () => {};
  private app: Application;

  constructor(app: Application) {
    super();
    this.app = app;
    
    this.track = new Graphics();
    this.track.roundRect(0, -6, this.trackWidth, 12, 6).fill(0x444444).stroke({ color: 0x000000, width: 2 });
    this.addChild(this.track);

    this.fill = new Graphics();
    this.addChild(this.fill);

    this.thumb = new Container();
    const thumbBg = new Graphics();
    thumbBg.circle(0, 0, 16).fill(0xFFD700).stroke({ color: 0x000000, width: 3 });
    this.thumb.addChild(thumbBg);
    this.thumb.eventMode = 'static';
    this.thumb.cursor = 'pointer';
    this.addChild(this.thumb);

    let isDragging = false;

    this.track.eventMode = 'static';
    this.track.cursor = 'pointer';
    this.track.hitArea = new Rectangle(0, -20, this.trackWidth, 40);
    
    this.track.on('pointerdown', (e) => {
      isDragging = true;
      this.updateFromPointer(e.global);
    });

    this.thumb.on('pointerdown', (e) => {
      isDragging = true;
      e.stopPropagation(); 
    });

    const onPointerMove = () => {
      if (isDragging) {
        this.updateFromPointer(this.app.renderer.events.pointer.global);
      }
    };
    
    const onPointerUp = () => { 
      if (isDragging) {
        isDragging = false;
        this.onDragEnd();
      }
    };
    
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    
    this.on('destroyed', () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    });

    this.setValue(this.value);
  }

  private updateFromPointer(globalPos: { x: number; y: number }) {
    const localPos = this.toLocal(globalPos as any);
    let val = localPos.x / this.trackWidth;
    val = Math.max(0, Math.min(1, val));
    this.setValue(val);
  }

  public setValue(val: number) {
    this.value = val;
    this.thumb.x = val * this.trackWidth;
    
    this.fill.clear();
    if (val > 0) {
      this.fill.roundRect(0, -6, val * this.trackWidth, 12, 6).fill(0x00FF00);
    }
    this.onChange(val);
  }
}

export class SettingsMenu extends Container {
  private audioManager: AudioManager;
  private app: Application;
  
  // FIX: Add `!` to fix TypeScript strict mode errors
  private gearButton!: Container;
  private modalOverlay!: Container;
  private modalWindow!: Container;
  
  private musicSlider!: Slider;
  private sfxSlider!: Slider;
  private musicMuteBtn!: Container;
  private sfxMuteBtn!: Container;

  private isInitializing = false;
  
  public onOpen: () => void = () => {};
  public onClose: () => void = () => {};

  private tempMusicVol = 0.5;
  private tempSfxVol = 0.5;
  private tempMusicMute = false;
  private tempSfxMute = false;

  private origMusicVol = 0.5;
  private origSfxVol = 0.5;
  private origMusicMute = false;
  private origSfxMute = false;

  private isOpen = false;

  constructor(app: Application) {
    super();
    this.app = app;
    this.audioManager = AudioManager.getInstance();
    this.zIndex = 2000;

    this.createGearButton();
    this.createModal();
  }

  private createGearButton() {
    this.gearButton = new Container();
    const gearBg = new Graphics();
    gearBg.circle(0, 0, 35).fill(0x00AEEF).stroke({ color: 0x000000, width: 4 });
    const gearIcon = new Text({ text: '⚙️', style: { fontSize: 40 } });
    gearIcon.anchor.set(0.5);
    this.gearButton.addChild(gearBg, gearIcon);
    this.gearButton.eventMode = 'static';
    this.gearButton.cursor = 'pointer';
    
    this.gearButton.on('pointerdown', () => this.open());
    this.gearButton.on('pointerover', () => {
      gsap.to(this.gearButton.scale, { x: 1.15, y: 1.15, duration: 0.2 });
      gsap.to(this.gearButton, { rotation: Math.PI / 4, duration: 0.3 });
    });
    this.gearButton.on('pointerout', () => {
      gsap.to(this.gearButton.scale, { x: 1, y: 1, duration: 0.2 });
      gsap.to(this.gearButton, { rotation: 0, duration: 0.3 });
    });
    
    this.addChild(this.gearButton);
  }

  private createModal() {
    this.modalOverlay = new Container();
    this.modalOverlay.visible = false;
    
    const bg = new Graphics();
    bg.rect(-2000, -2000, 4000, 4000).fill({ color: 0x000000, alpha: 0.8 });
    bg.eventMode = 'static';
    bg.on('pointerdown', () => this.cancel());
    this.modalOverlay.addChild(bg);

    this.modalWindow = new Container();
    
    const windowBg = new Graphics();
    windowBg.roundRect(-350, -250, 700, 500, 30).fill(0x00AEEF).stroke({ color: 0x000000, width: 6 });
    
    const innerBg = new Graphics();
    innerBg.roundRect(-330, -230, 660, 460, 20).fill(0x222222).stroke({ color: 0x000000, width: 3 });
    
    const title = new Text({
      text: 'SETTINGS',
      style: { fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 50, fill: 0xFFD700, fontWeight: 'bold', stroke: { color: 0x000000, width: 5 } }
    });
    title.anchor.set(0.5);
    title.y = -190;
    
    this.modalWindow.addChild(windowBg, innerBg, title);

    const mLabel = new Text({ text: 'Music', style: { fontFamily: 'Arial', fontSize: 24, fill: 0xFFFFFF, fontWeight: 'bold' } });
    mLabel.anchor.set(0, 0.5);
    mLabel.position.set(-250, -80);
    this.modalWindow.addChild(mLabel);

    this.musicSlider = new Slider(this.app);
    this.musicSlider.position.set(-60, -80);
    this.musicSlider.onChange = (val) => {
      if (this.isInitializing) return;
      
      this.tempMusicVol = val;
      
      if (val > 0 && this.tempMusicMute) {
        this.tempMusicMute = false;
        this.audioManager.setLiveMusicMute(false);
      }
      
      if (val === 0 && !this.tempMusicMute) {
        this.tempMusicMute = true;
        this.audioManager.setLiveMusicMute(true);
      }
      
      this.updateMuteButtonVisuals();
      this.audioManager.setLiveMusicVolume(val);
    };
    this.modalWindow.addChild(this.musicSlider);

    this.musicMuteBtn = this.createMuteButton(270, -80, () => {
      this.tempMusicMute = !this.tempMusicMute;
      this.audioManager.setLiveMusicMute(this.tempMusicMute);
      this.updateMuteButtonVisuals();
    });
    this.modalWindow.addChild(this.musicMuteBtn);

    const sLabel = new Text({ text: 'SFX', style: { fontFamily: 'Arial', fontSize: 24, fill: 0xFFFFFF, fontWeight: 'bold' } });
    sLabel.anchor.set(0, 0.5);
    sLabel.position.set(-250, 0);
    this.modalWindow.addChild(sLabel);

    this.sfxSlider = new Slider(this.app);
    this.sfxSlider.position.set(-60, 0);
    this.sfxSlider.onChange = (val) => {
      if (this.isInitializing) return;
      
      this.tempSfxVol = val;
      
      if (val > 0 && this.tempSfxMute) {
        this.tempSfxMute = false;
        this.audioManager.setLiveSfxMute(false);
      }
      
      if (val === 0 && !this.tempSfxMute) {
        this.tempSfxMute = true;
        this.audioManager.setLiveSfxMute(true);
      }
      
      this.updateMuteButtonVisuals();
      this.audioManager.setLiveSfxVolume(val);
    };
    this.sfxSlider.onDragEnd = () => {
      if (!this.tempSfxMute && this.tempSfxVol > 0) {
        this.audioManager.playSfxPreview();
      }
    };
    this.modalWindow.addChild(this.sfxSlider);

    this.sfxMuteBtn = this.createMuteButton(270, 0, () => {
      this.tempSfxMute = !this.tempSfxMute;
      this.audioManager.setLiveSfxMute(this.tempSfxMute);
      this.updateMuteButtonVisuals();
      
      if (!this.tempSfxMute && this.tempSfxVol > 0) {
        this.audioManager.playSfxPreview();
      }
    });
    this.modalWindow.addChild(this.sfxMuteBtn);

    const btnCancel = this.createButton('CANCEL', -150, 150, 0xFF3333, () => this.cancel());
    const btnOk = this.createButton('OK', 150, 150, 0x00FF00, () => this.saveAndClose());
    
    this.modalWindow.addChild(btnCancel, btnOk);

    this.modalOverlay.addChild(this.modalWindow);
    this.addChild(this.modalOverlay);
  }

  private createMuteButton(x: number, y: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-30, -20, 60, 40, 10).fill(0x444444).stroke({ color: 0x000000, width: 2 });
    const icon = new Text({ text: '🔊', style: { fontSize: 24 } });
    icon.anchor.set(0.5);
    
    (btn as any).iconRef = icon;
    (btn as any).bgRef = bg;
    
    btn.addChild(bg, icon);
    btn.position.set(x, y);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => { bg.tint = 0x888888; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }

  private updateMuteButtonVisuals() {
    const mIcon = (this.musicMuteBtn as any).iconRef as Text;
    mIcon.text = this.tempMusicMute ? '🔇' : '🔊';
    const sIcon = (this.sfxMuteBtn as any).iconRef as Text;
    sIcon.text = this.tempSfxMute ? '🔇' : '🔊';
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-100, -35, 200, 70, 15).fill(color).stroke({ color: 0x000000, width: 4 });
    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial', fontSize: 32, fill: 0xFFFFFF, fontWeight: 'bold', stroke: { color: 0x000000, width: 3 } }
    });
    text.anchor.set(0.5);
    btn.addChild(bg, text);
    btn.position.set(x, y);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => { bg.tint = 0xCCCCCC; });
    btn.on('pointerout', () => { bg.tint = 0xFFFFFF; });
    return btn;
  }

  public open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.modalOverlay.visible = true;
    
    this.origMusicVol = this.audioManager.getMusicVolume();
    this.origSfxVol = this.audioManager.getSfxVolume();
    this.origMusicMute = this.audioManager.getIsMusicMuted();
    this.origSfxMute = this.audioManager.getIsSfxMuted();

    this.tempMusicVol = this.origMusicVol;
    this.tempSfxVol = this.origSfxVol;
    this.tempMusicMute = this.origMusicMute;
    this.tempSfxMute = this.origSfxMute;

    this.isInitializing = true;
    this.musicSlider.setValue(this.tempMusicVol);
    this.sfxSlider.setValue(this.tempSfxVol);
    this.isInitializing = false;

    this.updateMuteButtonVisuals();
    this.repositionModal();

    this.onOpen();

    this.modalWindow.scale.set(0.8);
    this.modalOverlay.alpha = 0;
    
    gsap.to(this.modalOverlay, { alpha: 1, duration: 0.2 });
    gsap.to(this.modalWindow.scale, { x: 1, y: 1, duration: 0.3, ease: 'back.out(1.5)' });
    
    this.gearButton.visible = false;
  }

  public cancel() {
    if (!this.isOpen) return;
    
    this.audioManager.setLiveMusicVolume(this.origMusicVol);
    this.audioManager.setLiveSfxVolume(this.origSfxVol);
    this.audioManager.setLiveMusicMute(this.origMusicMute);
    this.audioManager.setLiveSfxMute(this.origSfxMute);

    this.close();
  }

  public close() {
    if (!this.isOpen) return;
    
    gsap.to(this.modalOverlay, { alpha: 0, duration: 0.2 });
    gsap.to(this.modalWindow.scale, { x: 0.8, y: 0.8, duration: 0.2, onComplete: () => {
      this.isOpen = false;
      this.modalOverlay.visible = false;
      this.gearButton.visible = true;
      
      this.onClose();
    }});
  }

  private saveAndClose() {
    this.audioManager.saveSettings(this.tempMusicVol, this.tempSfxVol, this.tempMusicMute, this.tempSfxMute);
    this.close();
  }

  public repositionModal() {
    if (!this.isOpen) return;
    
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    const scale = Math.min(1, (screenW * 0.9) / 700, (screenH * 0.9) / 500);
    this.modalOverlay.scale.set(scale);
    
    this.modalOverlay.x = (screenW / 2) - this.x;
    this.modalOverlay.y = (screenH / 2) - this.y;
  }
}