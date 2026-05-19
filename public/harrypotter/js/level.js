// Tile types: 0=air, 1=brick, 2=platform, 3=spike, 4=door-locked, 5=door-open, 6=cracked, 7=vine, 8=hidden-platform
const LEVEL_DATA = {
  width: 120,
  height: 24,
  tiles: [],
  spawn: { x: 3 * TILE, y: 18 * TILE },
  bossGate: { x: 110 * TILE, y: 16 * TILE },
};

function buildDiagonAlley() {
  const W = LEVEL_DATA.width;
  const H = LEVEL_DATA.height;
  const tiles = Array(H)
    .fill(null)
    .map(() => Array(W).fill(0));

  // Ground floor
  for (let x = 0; x < W; x++) {
    tiles[H - 2][x] = 1;
    tiles[H - 1][x] = 1;
  }

  // Starting platform
  for (let x = 0; x < 12; x++) tiles[H - 2][x] = 1;

  // Shop rooftops & platforms
  const platforms = [
    [14, H - 5, 6, 1],
    [22, H - 7, 5, 1],
    [30, H - 5, 8, 1],
    [42, H - 8, 4, 1],
    [48, H - 6, 6, 1],
    [58, H - 9, 5, 1],
    [66, H - 6, 7, 1],
    [76, H - 8, 4, 1],
    [82, H - 5, 8, 1],
    [94, H - 7, 5, 1],
    [102, H - 5, 6, 1],
    [108, H - 8, 4, 1],
  ];
  platforms.forEach(([px, py, len]) => {
    for (let i = 0; i < len; i++) tiles[py][px + i] = 2;
  });

  // Walls & buildings
  for (let y = H - 8; y < H - 2; y++) {
    tiles[y][20] = 1;
    tiles[y][40] = 1;
    tiles[y][55] = 1;
    tiles[y][75] = 1;
    tiles[y][95] = 1;
  }

  // Locked door
  tiles[H - 5][38] = 4;
  tiles[H - 4][38] = 4;

  // Cracked wall (needs Reducto)
  for (let y = H - 6; y < H - 2; y++) tiles[y][72] = 6;

  // Devil's snare vines
  for (let x = 50; x < 54; x++) tiles[H - 3][x] = 7;

  // Hidden platform (Lumos reveals)
  tiles[H - 10][62] = 8;
  tiles[H - 10][63] = 8;
  tiles[H - 10][64] = 8;

  // Spikes in alley
  for (let x = 28; x < 31; x++) tiles[H - 2][x] = 3;

  // Liftable crate zone
  LEVEL_DATA.crates = [{ x: 44 * TILE, y: (H - 6) * TILE - 28, w: 28, h: 28, lifted: false, vy: 0 }];
  LEVEL_DATA.doors = [{ x: 38 * TILE, y: (H - 5) * TILE, w: TILE, h: TILE * 2, locked: true }];
  LEVEL_DATA.collectibles = generateCollectibles(W, H);
  LEVEL_DATA.enemySpawns = [
    { type: 'pixie', x: 18 * TILE, y: (H - 5) * TILE - 24 },
    { type: 'pixie', x: 20 * TILE, y: (H - 5) * TILE - 24 },
    { type: 'gnome', x: 35 * TILE, y: (H - 2) * TILE - 32 },
    { type: 'pixie', x: 52 * TILE, y: (H - 6) * TILE - 24 },
    { type: 'gnome', x: 68 * TILE, y: (H - 2) * TILE - 32 },
    { type: 'pixie', x: 88 * TILE, y: (H - 5) * TILE - 24 },
    { type: 'pixie', x: 90 * TILE, y: (H - 5) * TILE - 24 },
  ];

  LEVEL_DATA.tiles = tiles;
}

function generateCollectibles(W, H) {
  const items = [];
  const spots = [
    [8, H - 4, 'galleon'],
    [16, H - 6, 'card'],
    [25, H - 8, 'galleon'],
    [33, H - 6, 'galleon'],
    [63, H - 11, 'snitch'],
    [70, H - 5, 'galleon'],
    [85, H - 9, 'card'],
    [100, H - 6, 'galleon'],
    [105, H - 9, 'heart'],
  ];
  spots.forEach(([tx, ty, type]) => {
    items.push({ x: tx * TILE + 8, y: ty * TILE, type, collected: false, w: 20, h: 20 });
  });
  return items;
}

buildDiagonAlley();

class Level {
  constructor(game) {
    this.game = game;
    this.tiles = LEVEL_DATA.tiles;
    this.width = LEVEL_DATA.width;
    this.height = LEVEL_DATA.height;
    this.crates = LEVEL_DATA.crates.map((c) => ({ ...c }));
    this.doors = LEVEL_DATA.doors.map((d) => ({ ...d }));
    this.collectibles = LEVEL_DATA.collectibles.map((c) => ({ ...c }));
    this.vinesBurned = false;
    this.wallBroken = false;
    this.hiddenRevealed = false;
  }

  getTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return 1;
    return this.tiles[ty][tx];
  }

  setTile(tx, ty, val) {
    if (tx >= 0 && ty >= 0 && tx < this.width && ty < this.height) {
      this.tiles[ty][tx] = val;
    }
  }

  checkTileCollision(x, y, w, h) {
    const left = Math.floor(x / TILE);
    const right = Math.floor((x + w - 1) / TILE);
    const top = Math.floor(y / TILE);
    const bottom = Math.floor((y + h - 1) / TILE);

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        const t = this.getTile(tx, ty);
        if ([1, 2, 4, 6].includes(t)) return true;
        if (t === 8 && this.game.spells.lumosActive) return true;
        if (t === 5) return false;
      }
    }
    return false;
  }

  checkSpike(x, y, w, h) {
    const left = Math.floor(x / TILE);
    const right = Math.floor((x + w - 1) / TILE);
    const bottom = Math.floor((y + h - 1) / TILE);
    for (let tx = left; tx <= right; tx++) {
      if (this.getTile(tx, bottom) === 3) return true;
    }
    return false;
  }

  checkVine(x, y, w, h) {
    const left = Math.floor(x / TILE);
    const right = Math.floor((x + w - 1) / TILE);
    const bottom = Math.floor((y + h - 1) / TILE);
    for (let tx = left; tx <= right; tx++) {
      if (this.getTile(tx, bottom) === 7 && !this.vinesBurned) return true;
    }
    return false;
  }

  burnVines() {
    if (this.vinesBurned) return;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x] === 7) this.tiles[y][x] = 0;
      }
    }
    this.vinesBurned = true;
  }

  revealHidden() {
    this.hiddenRevealed = true;
  }

  tryUnlock(player) {
    for (const door of this.doors) {
      if (!door.locked) continue;
      const dist = Math.abs(player.x + player.w / 2 - (door.x + door.w / 2));
      if (dist < 48) {
        door.locked = false;
        const tx = Math.floor(door.x / TILE);
        const ty = Math.floor(door.y / TILE);
        this.setTile(tx, ty, 5);
        this.setTile(tx, ty + 1, 5);
        return { x: door.x, y: door.y };
      }
    }
    return null;
  }

  tryLift(player) {
    for (const crate of this.crates) {
      const dist = Math.abs(player.x + player.w / 2 - (crate.x + crate.w / 2));
      if (dist < 64 && Math.abs(player.y - crate.y) < 48) {
        crate.lifted = true;
        crate.vy = -2;
        return crate;
      }
    }
    return null;
  }

  tryBreakWall(player, dir) {
    if (this.wallBroken) return;
    const px = player.x + (dir > 0 ? player.w : 0);
    const tx = Math.floor(px / TILE);
    const ty = Math.floor((player.y + player.h / 2) / TILE);
    if (this.getTile(tx, ty) === 6) {
      for (let y = ty - 2; y <= ty + 2; y++) this.setTile(tx, y, 0);
      this.wallBroken = true;
      this.game.particles.emit(px, player.y, 25, '#ff1493');
    }
  }

  update() {
    this.crates.forEach((crate) => {
      if (crate.lifted) {
        crate.y += crate.vy;
        crate.vy = Math.min(crate.vy + 0.15, 2);
        if (this.checkTileCollision(crate.x, crate.y, crate.w, crate.h)) {
          crate.lifted = false;
          crate.vy = 0;
        }
      }
    });
  }

  draw(ctx, camX, camY) {
    const startX = Math.max(0, Math.floor(camX / TILE) - 1);
    const endX = Math.min(this.width, Math.ceil((camX + 1280) / TILE) + 1);
    const startY = Math.max(0, Math.floor(camY / TILE) - 1);
    const endY = Math.min(this.height, Math.ceil((camY + 720) / TILE) + 1);

    // Parallax background layers
    this.drawBackground(ctx, camX);

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const t = this.tiles[ty][tx];
        const x = tx * TILE - camX;
        const y = ty * TILE - camY;

        if (t === 0) continue;
        if (t === 8 && !this.game.spells.lumosActive) continue;

        switch (t) {
          case 1:
            ctx.fillStyle = ty >= this.height - 2 ? '#4a3728' : '#5c4033';
            ctx.fillRect(x, y, TILE, TILE);
            ctx.strokeStyle = '#3d2b1f';
            ctx.strokeRect(x, y, TILE, TILE);
            if (ty < this.height - 2) {
              ctx.fillStyle = '#6b5344';
              ctx.fillRect(x + 2, y + 2, TILE - 4, 8);
            }
            break;
          case 2:
            ctx.fillStyle = '#6b5344';
            ctx.fillRect(x, y, TILE, 8);
            break;
          case 3:
            ctx.fillStyle = '#888';
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.moveTo(x + 4 + i * 10, y + TILE);
              ctx.lineTo(x + 10 + i * 10, y + 8);
              ctx.lineTo(x + 16 + i * 10, y + TILE);
              ctx.fill();
            }
            break;
          case 4:
            ctx.fillStyle = '#3d2817';
            ctx.fillRect(x, y, TILE, TILE);
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(x + 12, y + 12, 8, 8);
            break;
          case 5:
            ctx.fillStyle = '#2a1f10';
            ctx.globalAlpha = 0.3;
            ctx.fillRect(x, y, TILE, TILE * 2);
            ctx.globalAlpha = 1;
            break;
          case 6:
            ctx.fillStyle = '#5c4033';
            ctx.fillRect(x, y, TILE, TILE);
            ctx.strokeStyle = '#8b4513';
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 4, y + 4, TILE - 8, TILE - 8);
            ctx.setLineDash([]);
            break;
          case 7:
            ctx.fillStyle = '#228b22';
            ctx.fillRect(x, y + 8, TILE, TILE - 8);
            ctx.fillStyle = '#006400';
            for (let v = 0; v < 4; v++) {
              ctx.fillRect(x + v * 8, y, 4, TILE);
            }
            break;
          case 8:
            ctx.fillStyle = 'rgba(200, 180, 255, 0.5)';
            ctx.fillRect(x, y, TILE, 8);
            break;
        }
      }
    }

    this.crates.forEach((crate) => {
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(crate.x - camX, crate.y - camY, crate.w, crate.h);
      ctx.strokeStyle = '#5c4033';
      ctx.strokeRect(crate.x - camX, crate.y - camY, crate.w, crate.h);
    });

    this.collectibles.forEach((c) => {
      if (c.collected) return;
      const cx = c.x - camX;
      const cy = c.y - camY;
      const bob = Math.sin(Date.now() / 300 + c.x) * 3;
      if (c.type === 'galleon') {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx + 10, cy + 10 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'card') {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(cx, cy + bob, 16, 22);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(cx + 2, cy + 2 + bob, 12, 4);
      } else if (c.type === 'snitch') {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx + 10, cy + 10 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy + 10 + bob, 14, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c.type === 'heart') {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx + 6, cy + 8 + bob, 5, 0, Math.PI * 2);
        ctx.arc(cx + 14, cy + 8 + bob, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx + 4, cy + 10 + bob, 12, 8);
      }
    });
  }

  drawBackground(ctx, camX) {
    const w = 1280;
    const h = 720;
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#1a0a2e');
    sky.addColorStop(0.5, '#2d1b4e');
    sky.addColorStop(1, '#4a2c6a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Stars / magic sparkles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + camX * 0.02) % w);
      const sy = (i * 89) % (h * 0.5);
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Far buildings (parallax 0.2)
    ctx.fillStyle = '#1a1028';
    for (let i = 0; i < 8; i++) {
      const bx = (i * 200 - camX * 0.2) % (w + 200) - 100;
      const bh = 120 + (i % 3) * 40;
      ctx.fillRect(bx, h - bh - 80, 80 + (i % 2) * 40, bh);
    }

    // Mid shops (parallax 0.5)
    ctx.fillStyle = '#2a1f3d';
    for (let i = 0; i < 6; i++) {
      const bx = (i * 280 - camX * 0.5) % (w + 280) - 140;
      ctx.fillRect(bx, h - 200, 120, 200);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(bx + 20, h - 180, 30, 40);
      ctx.fillStyle = '#2a1f3d';
    }

    // Cobblestone hint at bottom
    ctx.fillStyle = 'rgba(60, 40, 30, 0.3)';
    ctx.fillRect(0, h - 60, w, 60);
  }
}
