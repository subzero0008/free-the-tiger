import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { supabase } from '../utils/supabase';

export class NicknameScreen extends Container {
  private bg: Graphics;
  private inputElement: HTMLInputElement;
  private statusText: Text;
  private isChecking = false;

  constructor(
    onContinue: (nickname: string) => void, 
    onLeaderboard: () => void
  ) {
    super();

    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    const title = new Text({
      text: 'ENTER YOUR NICKNAME',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 80,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 8 },
        dropShadow: { color: 0x000000, blur: 6, distance: 5, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    title.anchor.set(0.5);
    title.y = -280;
    this.addChild(title);

    const instructions = new Text({
      text: 'Choose a unique nickname (3-15 characters).\nOnly letters, numbers, _ and - are allowed.',
      style: {
        fontFamily: 'Arial',
        fontSize: 26,
        fill: 0xFFFFFF,
        align: 'center',
        lineHeight: 38,
        wordWrap: true,
        wordWrapWidth: 900
      }
    });
    instructions.anchor.set(0.5);
    instructions.y = -180;
    this.addChild(instructions);

    // HTML Input
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.placeholder = 'Enter nickname...';
    this.inputElement.maxLength = 15;
    this.inputElement.autocomplete = 'off';
    this.inputElement.spellcheck = false;
    this.inputElement.style.position = 'fixed';
    this.inputElement.style.left = '50%';
    this.inputElement.style.top = '50%';
    this.inputElement.style.transform = 'translate(-50%, -50%)';
    this.inputElement.style.marginTop = '-30px';
    this.inputElement.style.padding = '12px 24px';
    this.inputElement.style.fontSize = '32px';
    this.inputElement.style.borderRadius = '12px';
    this.inputElement.style.border = '4px solid #000';
    this.inputElement.style.textAlign = 'center';
    this.inputElement.style.fontFamily = 'Arial, sans-serif';
    this.inputElement.style.width = '400px';
    this.inputElement.style.maxWidth = '80vw';
    this.inputElement.style.zIndex = '99999';
    this.inputElement.style.outline = 'none';
    this.inputElement.style.backgroundColor = '#1a1a2e';
    this.inputElement.style.color = '#ffffff';
    this.inputElement.style.boxShadow = '0 0 20px rgba(0, 174, 239, 0.5)';
    document.body.appendChild(this.inputElement);

    gsap.delayedCall(0.1, () => this.inputElement.focus());

    this.inputElement.addEventListener('input', () => this.onInputChange());
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') void this.handleContinue(onContinue);
    });

    // Статус текст (валидация)
    this.statusText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xFFFFFF,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 900
      }
    });
    this.statusText.anchor.set(0.5);
    this.statusText.y = 60;
    this.addChild(this.statusText);

    // Бутони (само 2, по-широки)
    const btnContinue = this.createButton('CONTINUE', -160, 220, 0x00CC44, () => void this.handleContinue(onContinue));
    this.addChild(btnContinue);

    const btnLeaderboard = this.createButton('🏆 LEADERBOARD', 160, 220, 0xFFD700, () => {
      this.cleanup();
      onLeaderboard();
    });
    this.addChild(btnLeaderboard);
  }

  private onInputChange() {
    const value = this.inputElement.value;
    if (value.length === 0) {
      this.statusText.text = '';
      return;
    }
    if (value.length < 3) {
      this.statusText.text = `At least 3 characters (${value.length}/3)`;
      this.statusText.style.fill = 0xFFAA00;
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      this.statusText.text = 'Only letters, numbers, _ and - are allowed';
      this.statusText.style.fill = 0xFF3333;
      return;
    }
    this.statusText.text = 'Looks good! Click CONTINUE';
    this.statusText.style.fill = 0x00FF00;
  }

  private async handleContinue(onContinue: (nickname: string) => void) {
    if (this.isChecking) return;
    const nickname = this.inputElement.value.trim();

    if (nickname.length < 3) {
      this.statusText.text = 'Nickname must be at least 3 characters';
      this.statusText.style.fill = 0xFF3333;
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      this.statusText.text = 'Only letters, numbers, _ and - are allowed';
      this.statusText.style.fill = 0xFF3333;
      return;
    }

    this.isChecking = true;
    this.statusText.text = 'Checking availability...';
    this.statusText.style.fill = 0xAAAAAA;

    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('nickname')
        .eq('nickname', nickname)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        this.statusText.text = `"${nickname}" is already taken. Choose another.`;
        this.statusText.style.fill = 0xFF3333;
        this.isChecking = false;
        return;
      }

      this.statusText.text = `Welcome, ${nickname}!`;
      this.statusText.style.fill = 0x00FF00;
      
      gsap.delayedCall(0.5, () => {
        this.cleanup();
        onContinue(nickname);
      });

    } catch (err) {
      console.error('Error checking nickname:', err);
      this.statusText.text = 'Error checking nickname. Please try again.';
      this.statusText.style.fill = 0xFF3333;
      this.isChecking = false;
    }
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    // Променена ширина от 200 на 280
    bg.roundRect(-140, -40, 280, 80, 18).fill(color).stroke({ color: 0x000000, width: 4 });
    
    // Намален шрифт от 32 на 26 за по-добро събиране
    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial', fontSize: 26, fill: 0xFFFFFF, fontWeight: 'bold', stroke: { color: 0x000000, width: 3 } }
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

  private cleanup() {
    if (this.inputElement && this.inputElement.parentNode) {
      this.inputElement.remove();
    }
  }

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.92 });
  }

  public destroy(options?: any): void {
    this.cleanup();
    super.destroy(options);
  }
}