class SpellProjectile {
  constructor(x, y, dir, spell, owner) {
    this.x = x;
    this.y = y;
    this.w = spell.id === 'incendio' ? 48 : 16;
    this.h = spell.id === 'incendio' ? 24 : 12;
    this.vx = dir * (spell.id === 'incendio' ? 6 : 9);
    this.vy = 0;
    this.spell = spell;
    this.owner = owner;
    this.life = spell.id === 'incendio' ? 25 : 60;
    this.active = true;
    this.dir = dir;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(level) {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.active = false;

    if (level.checkTileCollision(this.x, this.y, this.w, this.h)) {
      this.active = false;
    }
  }

  draw(ctx, camX) {
    const spell = this.spell;
    ctx.save();
    if (spell.id === 'incendio') {
      const grad = ctx.createLinearGradient(this.x - camX, this.y, this.x - camX + this.w * this.dir, this.y);
      grad.addColorStop(0, '#ff4500');
      grad.addColorStop(0.5, '#ff8c00');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x - camX, this.y - 4, this.w * this.dir, this.h + 8);
    } else if (spell.id === 'reducto') {
      ctx.fillStyle = spell.color;
      ctx.shadowColor = spell.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x - camX + this.w / 2, this.y + this.h / 2, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = spell.color;
      ctx.shadowColor = spell.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(this.x - camX, this.y, this.w, this.h);
    }
    ctx.restore();
  }
}

class SpellEffects {
  constructor(game) {
    this.game = game;
    this.projectiles = [];
    this.lightRadius = 0;
    this.lumosActive = false;
  }

  cast(player, spellId, aimDir) {
    const spell = SPELLS[spellId];
    if (!spell) return false;

  const cdKey = spellId;
    if (player.cooldowns[cdKey] > 0) return false;

    if (spell.mana > 0 && player.mana < spell.mana) return false;

    if (spell.toggle && spellId === 'lumos') {
      this.lumosActive = !this.lumosActive;
      this.lightRadius = this.lumosActive ? 180 : 0;
      player.cooldowns[cdKey] = 10;
      this.game.particles.emit(player.x + player.w / 2, player.y + player.h / 2, 8, spell.color);
      return true;
    }

    if (spellId === 'alohomora') {
      const unlocked = this.game.level.tryUnlock(player);
      if (unlocked) {
        player.cooldowns[cdKey] = spell.cooldown;
        this.game.particles.emit(unlocked.x, unlocked.y, 15, '#d4af37');
        this.game.audio?.playUnlock?.();
      }
      return !!unlocked;
    }

    if (spellId === 'wingardium') {
      const lifted = this.game.level.tryLift(player);
      if (lifted) {
        if (spell.mana > 0) player.mana -= spell.mana;
        player.cooldowns[cdKey] = spell.cooldown;
        return true;
      }
      return false;
    }

    if (spell.mana > 0) player.mana -= spell.mana;
    player.cooldowns[cdKey] = Math.floor(spell.cooldown * (player.cooldownMult || 1));

    const px = player.facing > 0 ? player.x + player.w : player.x;
    const py = player.y + player.h / 2 - 6;

    if (['expelliarmus', 'stupefy', 'incendio', 'reducto'].includes(spellId)) {
      this.projectiles.push(new SpellProjectile(px, py, aimDir, spell, player));
      this.game.particles.emitSpell(px, py, spell.color, aimDir);
    }

    if (spellId === 'reducto') {
      this.game.level.tryBreakWall(player, aimDir);
    }

    return true;
  }

  update() {
    const level = this.game.level;
    this.projectiles = this.projectiles.filter((p) => {
      if (!p.active) return false;
      p.update(level);
      return p.active;
    });

    this.projectiles.forEach((proj) => {
      const bounds = proj.getBounds();
      this.game.enemies?.forEach((e) => {
        if (!e.alive) return;
        if (rectOverlap(bounds, e.getBounds())) {
          e.takeDamage(proj.spell.damage || 1, proj.spell);
          proj.active = false;
          this.game.particles.emit(e.x + e.w / 2, e.y + e.h / 2, 10, proj.spell.color);
        }
      });
      if (this.game.boss?.active && rectOverlap(bounds, this.game.boss.getBounds())) {
        this.game.boss.takeDamage(proj.spell.damage || 1, proj.spell);
        proj.active = false;
      }
    });
  }

  draw(ctx, camX) {
    this.projectiles.forEach((p) => p.draw(ctx, camX));
    if (this.lumosActive) {
      const p = this.game.player;
      if (!p) return;
      const cx = p.x + p.w / 2 - camX;
      const cy = p.y + p.h / 2;
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, this.lightRadius);
      grad.addColorStop(0, 'rgba(255, 248, 220, 0.35)');
      grad.addColorStop(0.6, 'rgba(255, 248, 220, 0.1)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - this.lightRadius, cy - this.lightRadius, this.lightRadius * 2, this.lightRadius * 2);
    }
  }
}

function rectOverlap(a, b) {
  if (!a || !b) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

window.rectOverlap = rectOverlap;
