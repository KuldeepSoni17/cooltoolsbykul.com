class MountainTrollBoss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 80;
    this.h = 120;
    this.hp = 12;
    this.maxHp = 12;
    this.phase = 1;
    this.active = false;
    this.attackTimer = 0;
    this.clubX = 0;
    this.clubY = 0;
    this.clubLifted = false;
    this.clubLiftTimer = 0;
    this.swingTimer = 0;
    this.hitFlash = 0;
    this.defeated = false;
    this.introTimer = 120;
    this.floorCracked = false;
    this.vx = 0;
  }

  start() {
    this.active = true;
    this.introTimer = 120;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  getClubBounds() {
    if (this.clubLifted) return null;
    return {
      x: this.x + (this.vx > 0 ? this.w : -30),
      y: this.y + 40,
      w: 30,
      h: 50,
    };
  }

  takeDamage(amount, spell) {
    if (!this.active || this.defeated || this.introTimer > 0) return;
    this.hitFlash = 8;

    if (spell?.id === 'wingardium' && !this.clubLifted && this.phase === 1) {
      this.clubLifted = true;
      this.clubLiftTimer = 90;
      return;
    }

    if (['expelliarmus', 'stupefy', 'incendio'].includes(spell?.id)) {
      if (this.clubLifted && this.clubLiftTimer < 60) {
        this.hp -= 2;
        this.game?.particles?.emit(this.x + this.w / 2, this.y + 20, 15, '#ff6b6b');
      } else if (!this.clubLifted) {
        this.hp -= 1;
      }
    }

    if (spell?.id === 'reducto' && this.floorCracked && this.phase === 2) {
      this.hp -= 3;
      this.game?.particles?.emit(this.x + this.w / 2, this.y + this.h, 20, '#ff1493');
    }

    if (spell?.id === 'stupefy') {
      this.attackTimer = -60;
    }

    if (this.hp <= 0) {
      this.defeated = true;
      this.active = false;
    }

    if (this.hp <= 6 && this.phase === 1) {
      this.phase = 2;
    }
  }

  update(level, player) {
    if (!this.active || this.defeated) return;

    if (this.introTimer > 0) {
      this.introTimer--;
      return;
    }

    if (this.hitFlash > 0) this.hitFlash--;

    if (this.clubLifted) {
      this.clubLiftTimer--;
      if (this.clubLiftTimer <= 0) {
        this.clubLifted = false;
      }
      return;
    }

    this.attackTimer++;
    const dist = player.x - this.x;

    if (this.attackTimer > 0 && this.attackTimer % 120 === 0) {
      this.swingTimer = 40;
    }

    if (this.swingTimer > 0) {
      this.swingTimer--;
      if (this.swingTimer === 20) {
        const club = this.getClubBounds();
        if (club && rectOverlap(club, player.getBounds()) && player.invuln <= 0) {
          player.takeDamage(2);
        }
      }
    } else if (Math.abs(dist) > 60) {
      this.vx = dist > 0 ? 1.5 : -1.5;
      this.x += this.vx;
    }

    if (rectOverlap(this.getBounds(), player.getBounds()) && player.invuln <= 0 && this.swingTimer <= 0) {
      player.takeDamage(1);
    }

    if (this.phase === 2 && !this.floorCracked && this.hp <= 4) {
      this.floorCracked = true;
      const tx = Math.floor((this.x + this.w / 2) / TILE);
      const ty = Math.floor((this.y + this.h) / TILE);
      for (let dx = -2; dx <= 2; dx++) {
        level.setTile(tx + dx, ty, 6);
      }
    }
  }

  draw(ctx, camX, camY) {
    if (!this.active) return;
    const x = this.x - camX;
    const y = this.y - camY;

    if (this.introTimer > 60) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = '24px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('Mountain Troll approaches!', 640, 100);
      ctx.textAlign = 'left';
    }

    const color = this.hitFlash > 0 ? '#aaa' : '#6b8e6b';

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x + 10, y + 40, this.w - 20, this.h - 40);

    // Head
    ctx.fillStyle = '#5a7a5a';
    ctx.beginPath();
    ctx.arc(x + this.w / 2, y + 30, 28, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 22, y + 24, 8, 8);
    ctx.fillRect(x + 50, y + 24, 8, 8);

    // Club
    if (!this.clubLifted) {
      const clubX = this.vx >= 0 ? x + this.w - 10 : x - 30;
      const clubY = y + 50 + (this.swingTimer > 0 ? Math.sin((40 - this.swingTimer) * 0.3) * 20 : 0);
      ctx.fillStyle = '#5c4033';
      ctx.fillRect(clubX, clubY, 12, 50);
      ctx.fillStyle = '#3d2817';
      ctx.beginPath();
      ctx.arc(clubX + 6, clubY + 50, 18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#d4af37';
      ctx.font = '14px Georgia';
      ctx.fillText('Club lifted! Attack the head!', x, y - 20);
    }

    // HP bar
    const barW = 200;
    ctx.fillStyle = '#333';
    ctx.fillRect(640 - barW / 2, 30, barW, 12);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(640 - barW / 2, 30, barW * (this.hp / this.maxHp), 12);
    ctx.strokeStyle = '#d4af37';
    ctx.strokeRect(640 - barW / 2, 30, barW, 12);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = '12px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(`Mountain Troll — Phase ${this.phase}`, 640, 24);
    ctx.textAlign = 'left';

    if (this.phase === 2 && this.floorCracked) {
      ctx.fillStyle = '#f5e6c8';
      ctx.font = '14px Georgia';
      ctx.fillText('Use Reducto on the cracked floor!', 480, 60);
    }
  }
}
