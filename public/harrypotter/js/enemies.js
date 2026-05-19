class Enemy {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.alive = true;
    this.stunTimer = 0;
    this.hitFlash = 0;
    this.vx = 0;
    this.vy = 0;
    this.patrolDir = 1;
    this.patrolTimer = 0;
    this.burrowTimer = 0;
    this.burrowed = false;

    if (type === 'pixie') {
      this.w = 24;
      this.h = 24;
      this.hp = 2;
      this.speed = 2.5;
    } else if (type === 'gnome') {
      this.w = 28;
      this.h = 32;
      this.hp = 4;
      this.speed = 1.2;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  takeDamage(amount, spell) {
    if (!this.alive || this.stunTimer > 0) return;
    this.hp -= amount || 1;
    this.hitFlash = 10;
    if (spell?.stun) this.stunTimer = spell.stun;
    if (spell?.id === 'incendio' && this.type === 'pixie') this.hp -= 1;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  update(level, player) {
    if (!this.alive) return;
    if (this.stunTimer > 0) {
      this.stunTimer--;
      return;
    }
    if (this.hitFlash > 0) this.hitFlash--;

    const dist = player.x - this.x;

    if (this.type === 'pixie') {
      this.patrolTimer++;
      this.vy = Math.sin(this.patrolTimer * 0.08) * 1.5;
      if (Math.abs(dist) < 200) {
        this.vx = dist > 0 ? this.speed : -this.speed;
      } else {
        this.vx = this.patrolDir * this.speed * 0.5;
        if (this.patrolTimer % 90 === 0) this.patrolDir *= -1;
      }
    } else if (this.type === 'gnome') {
      this.burrowTimer++;
      if (this.burrowed) {
        if (this.burrowTimer > 90) {
          this.burrowed = false;
          this.burrowTimer = 0;
          this.y -= 20;
        }
      } else {
        if (Math.abs(dist) < 150 && Math.abs(dist) > 30) {
          this.vx = dist > 0 ? this.speed : -this.speed;
        } else if (this.burrowTimer > 120) {
          this.burrowed = true;
          this.burrowTimer = 0;
          this.y += 16;
        } else {
          this.vx *= 0.9;
        }
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    if (level.checkTileCollision(this.x, this.y, this.w, this.h)) {
      this.vx *= -1;
      this.patrolDir *= -1;
    }

    // Damage player on contact
    if (rectOverlap(this.getBounds(), player.getBounds()) && player.invuln <= 0) {
      player.takeDamage(1);
    }
  }

  draw(ctx, camX, camY) {
    if (!this.alive) return;
    const x = this.x - camX;
    const y = this.y - camY;

    if (this.stunTimer > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
    }
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#fff';
    } else if (this.type === 'pixie') {
      ctx.fillStyle = '#7ec8e3';
      ctx.fillRect(x, y + 8, this.w, this.h - 8);
      ctx.fillStyle = '#b8e0f0';
      // Wings
      ctx.beginPath();
      ctx.ellipse(x - 4, y + 12, 10, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(x + this.w + 4, y + 12, 10, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a90a4';
      ctx.beginPath();
      ctx.arc(x + this.w / 2, y + 6, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'gnome') {
      if (this.burrowed) {
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(x, y + this.h - 8, this.w, 8);
      } else {
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + 4, y + 12, this.w - 8, this.h - 12);
        ctx.fillStyle = '#ff6347';
        ctx.beginPath();
        ctx.arc(x + this.w / 2, y + 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 8, y + 8, 4, 4);
        ctx.fillRect(x + 16, y + 8, 4, 4);
      }
    }
    ctx.globalAlpha = 1;
  }
}

function spawnEnemies(spawns) {
  return spawns.map((s) => new Enemy(s.type, s.x, s.y));
}
