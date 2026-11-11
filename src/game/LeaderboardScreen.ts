import { Container, Graphics, Text } from 'pixi.js';
import { supabase } from '../utils/supabase';

export class LeaderboardScreen extends Container {
  private bg: Graphics;
  private listContainer: Container;

  constructor(onClose: () => void) {
    super();

    // 1. Тъмен фон
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 2. Заглавие
    const title = new Text({
      text: '🏆 LEADERBOARD - TOP 10 🏆',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 70,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 6 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    title.anchor.set(0.5);
    title.y = -380;
    this.addChild(title);

    // 3. Контейнер за списъка
    this.listContainer = new Container();
    this.listContainer.y = -280;
    this.addChild(this.listContainer);

    // 4. Зареждаме данните
    void this.loadLeaderboard();

    // 5. Бутон за затваряне
    const closeBtn = this.createButton('CLOSE', 0, 420, 0xFF3333, onClose);
    this.addChild(closeBtn);
  }

  private async loadLeaderboard() {
    const loadingText = new Text({
      text: 'Loading...',
      style: { fontFamily: 'Arial', fontSize: 32, fill: 0xAAAAAA, fontStyle: 'italic' }
    });
    loadingText.anchor.set(0.5, 0);
    loadingText.y = 50;
    this.listContainer.addChild(loadingText);

    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('time_ms', { ascending: true })
        .order('hints_used', { ascending: true })
        .limit(10);

      this.listContainer.removeChild(loadingText);
      loadingText.destroy();

      if (error) throw error;

      const header = new Text({
        text: 'RANK   NAME               TIME      HINTS',
        style: { fontFamily: 'Courier New', fontSize: 28, fill: 0x00FFFF, fontWeight: 'bold' }
      });
      header.anchor.set(0.5, 0);
      header.y = 0;
      this.listContainer.addChild(header);

      if (!data || data.length === 0) {
        const emptyText = new Text({
          text: 'No records yet. Be the first!',
          style: { fontFamily: 'Arial', fontSize: 30, fill: 0xFFFFFF, fontStyle: 'italic' }
        });
        emptyText.anchor.set(0.5, 0);
        emptyText.y = 60;
        this.listContainer.addChild(emptyText);
        return;
      }

      data.forEach((row, index) => {
        const mins = Math.floor(row.time_ms / 60000);
        const secs = Math.floor((row.time_ms % 60000) / 1000);
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const rankStr = (index + 1).toString().padStart(2, ' ');
        const nameStr = row.nickname.substring(0, 16).padEnd(16, ' ');
        const timeSpaced = timeStr.padStart(8, ' ');
        const hintsStr = row.hints_used.toString().padStart(3, ' ');

        let color = 0xFFFFFF;
        if (index === 0) color = 0xFFD700;
        else if (index === 1) color = 0xC0C0C0;
        else if (index === 2) color = 0xCD7F32;

        const rowText = new Text({
          text: `${rankStr}.   ${nameStr}  ${timeSpaced}     ${hintsStr}`,
          style: { fontFamily: 'Courier New', fontSize: 28, fill: color, fontWeight: index < 3 ? 'bold' : 'normal' }
        });
        rowText.anchor.set(0.5, 0);
        rowText.y = 60 + index * 48;
        this.listContainer.addChild(rowText);
      });

    } catch (err) {
      console.error('Leaderboard error:', err);
      this.listContainer.removeChild(loadingText);
      loadingText.destroy();

      const errorText = new Text({
        text: 'Failed to load leaderboard. Please try again.',
        style: { fontFamily: 'Arial', fontSize: 30, fill: 0xFF3333 }
      });
      errorText.anchor.set(0.5, 0);
      errorText.y = 50;
      this.listContainer.addChild(errorText);
    }
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-150, -40, 300, 80, 15).fill(color).stroke({ color: 0x000000, width: 4 });
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

  // NEW: Този метод липсваше!
  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.95 });
  }
}