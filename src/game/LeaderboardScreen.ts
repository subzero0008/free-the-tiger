import { Container, Graphics, Text } from 'pixi.js';
import { supabase } from '../utils/supabase';

export class LeaderboardScreen extends Container {
  private bg: Graphics;
  private listContainer: Container;
  private isMobile: boolean;

  constructor(playerName: string, onClose: () => void) {
    super();
    this.isMobile = window.innerWidth < 768;

    // 1. Тъмен фон
    this.bg = new Graphics();
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // 2. Заглавие (Увеличено за мобилно)
    const title = new Text({
      text: '🏆 LEADERBOARD - TOP 10 🏆',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: this.isMobile ? 140 : 70,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 6 },
        dropShadow: { color: 0x000000, blur: 8, distance: 6, angle: Math.PI / 2, alpha: 0.9 }
      }
    });
    title.anchor.set(0.5);
    title.y = this.isMobile ? -700 : -380;
    this.addChild(title);

    // 3. Контейнер за списъка
    this.listContainer = new Container();
    this.listContainer.y = this.isMobile ? -550 : -280;
    this.addChild(this.listContainer);

    // 4. Зареждаме данните
    void this.loadLeaderboard(playerName);

    // 5. Бутон за затваряне (Увеличен за мобилно)
    const closeBtn = this.createButton('CLOSE', 0, this.isMobile ? 800 : 420, 0xFF3333, onClose);
    this.addChild(closeBtn);
  }

  private async loadLeaderboard(currentPlayerName: string) {
    const loadingText = new Text({
      text: 'Loading...',
      style: { fontFamily: 'Arial', fontSize: this.isMobile ? 80 : 32, fill: 0xAAAAAA, fontStyle: 'italic' }
    });
    loadingText.anchor.set(0.5, 0);
    loadingText.y = this.isMobile ? 100 : 50;
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

      // HEADER ROW
      const headerY = 0;
      // Позиции на колоните (раздалечени за мобилно)
      const x1 = this.isMobile ? -850 : -350;
      const x2 = this.isMobile ? -300 : -150;
      const x3 = this.isMobile ? 300 : 150;
      const x4 = this.isMobile ? 850 : 350;

      this.createColumnText('RANK', x1, headerY, 0x00FFFF, true);
      this.createColumnText('NAME', x2, headerY, 0x00FFFF, true);
      this.createColumnText('TIME', x3, headerY, 0x00FFFF, true);
      this.createColumnText('HINTS', x4, headerY, 0x00FFFF, true);

      if (!data || data.length === 0) {
        const emptyText = new Text({
          text: 'No records yet. Be the first!',
          style: { fontFamily: 'Arial', fontSize: this.isMobile ? 80 : 30, fill: 0xFFFFFF, fontStyle: 'italic' }
        });
        emptyText.anchor.set(0.5, 0);
        emptyText.y = this.isMobile ? 150 : 60;
        this.listContainer.addChild(emptyText);
        return;
      }

      data.forEach((row, index) => {
        const mins = Math.floor(row.time_ms / 60000);
        const secs = Math.floor((row.time_ms % 60000) / 1000);
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const rankStr = `${index + 1}.`;
        const hintsStr = row.hints_used.toString();

        let color = 0xFFFFFF;
        if (index === 0) color = 0xFFD700;
        else if (index === 1) color = 0xC0C0C0;
        else if (index === 2) color = 0xCD7F32;
        
        const isCurrentPlayer = row.nickname === currentPlayerName;
        const nameColor = isCurrentPlayer ? 0x00FF00 : color;

        // Увеличена височина на редовете за мобилно
        const rowY = this.isMobile ? 120 + index * 130 : 60 + index * 48;

        this.createColumnText(rankStr, x1, rowY, color, index < 3);
        this.createColumnText(row.nickname, x2, rowY, nameColor, index < 3);
        this.createColumnText(timeStr, x3, rowY, color, index < 3);
        this.createColumnText(hintsStr, x4, rowY, color, index < 3);
      });

    } catch (err) {
      console.error('Leaderboard error:', err);
      this.listContainer.removeChild(loadingText);
      loadingText.destroy();

      const errorText = new Text({
        text: 'Failed to load leaderboard. Please try again.',
        style: { fontFamily: 'Arial', fontSize: this.isMobile ? 70 : 30, fill: 0xFF3333 }
      });
      errorText.anchor.set(0.5, 0);
      errorText.y = this.isMobile ? 150 : 50;
      this.listContainer.addChild(errorText);
    }
  }

  private createColumnText(text: string, x: number, y: number, color: number, bold: boolean) {
    const textObj = new Text({
      text: text,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: this.isMobile ? 65 : 28, // 👈 Много по-голям шрифт за мобилно
        fill: color,
        fontWeight: bold ? 'bold' : 'normal',
        padding: 10 
      }
    });
    textObj.anchor.set(0.5, 0);
    textObj.x = x;
    textObj.y = y;
    this.listContainer.addChild(textObj);
  }

  private createButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btn = new Container();
    const w = this.isMobile ? 600 : 300;
    const h = this.isMobile ? 160 : 80;

    const bg = new Graphics();
    bg.roundRect(-w/2, -h/2, w, h, 15).fill(color).stroke({ color: 0x000000, width: 4 });
    const text = new Text({
      text: label,
      style: { 
        fontFamily: 'Arial', 
        fontSize: this.isMobile ? 75 : 32, 
        fill: 0xFFFFFF, 
        fontWeight: 'bold', 
        stroke: { color: 0x000000, width: 3 } 
      }
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

  public updateBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.rect(-width / 2, -height / 2, width, height).fill({ color: 0x000000, alpha: 0.95 });
  }
}