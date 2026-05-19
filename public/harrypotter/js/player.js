class Player {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    const spawn = LEVEL_DATA.spawn;
    this.x = spawn.x;
    this.y = spawn.y;
    this.w = 24;
    this.h = 40;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.hearts = 3;
    this.maxHearts = 3;
    this.mana = 100;
    this.maxMana = 100;
    this.manaRegen = 0.25;
    this.invuln = 0;
    this.invulnBonus = 0;
    this.cooldownMult = 1;
    this.xpMult = 1;
    this.cooldowns = {};
    SPELL_ORDER.forEach((s) => (this.cooldowns[s] = 0));
    this.equippedSpells = [...SPELL_ORDER];
    this.spellIndex = 0;
    this.sprinting = false;
    this.crouching = false;
    this.housePoints = 0;
    this.galleons = 0;
    this.cards = 0;
  }

  applyHouse(houseId) {
    const house = HOUSES[houseId];
    if (!house) return;
    this.house = houseId;
    switch (house.bonus) {
      case 'extraHeart':
        this.maxHearts = 4;
        this.hearts = 4;
        break;
      case 'cooldown':
        this.cooldownMult = 0.9;
        break;
      case 'xp':
        this.xpMult = 1.25;
        break;
      case 'invuln':
        this.invulnBonus = 60;
        break;
    }
  }

  get currentSpell() {
    return this.equippedSpells[this.spellIndex];
  }

  cycleSpell(dir) {
    this.spellIndex = (this.spellIndex + dir + this.equippedSpells.length) % this.equippedSpells.length;
  }

  getBounds() {
    const h = this.crouching ? this.h * 0.6 : this.h;
    const yOff = this.crouching ? this.h - h : 0;
    return { x: this.x, y: this.y + yOff, w: this.w, h };
  }

  takeDamage(amount) {
    if (this.invuln > 0) return;
    this.hearts -= amount;
    this.invuln = 90 + this.invulnBonus;
    this.game.particles.emit(this.x + this.w / 2, this.y + this.h / 2, 15, '#e74c3c');
    if (this.hearts <= 0) {
      this.game.setState(GAME_STATE.GAME_OVER);
    }
  }

  heal(amount) {
    this.hearts = Math.min(this.maxHearts, this.hearts + amount);
  }

  update(input, level) {
    if (this.invuln > 0) this.invuln--;
    Object.keys(this.cooldowns).forEach((k) => {
      if (this.cooldowns[k] > 0) this.cooldowns[k]--;
    });

    if (this.mana < this.maxMana) {
      const regen = this.onGround ? this.manaRegen * 1.5 : this.manaRegen;
      this.mana = Math.min(this.maxMana, this.mana + regen);
    }

    this.sprinting = input.sprint && Math.abs(input.x) > 0;
    this.crouching = input.crouch && this.onGround;

    const speed = this.sprinting ? 5.5 : 4;
    if (input.x !== 0) {
      this.vx += input.x * 0.8;
      this.facing = input.x > 0 ? 1 : -1;
    }
    this.vx *= this.onGround ? FRICTION : AIR_FRICTION;
    this.vx = Math.max(-speed, Math.min(speed, this.vx));

    if (input.jump && this.onGround && !this.crouching) {
      this.vy = this.sprinting ? -13 : -11;
      this.onGround = false;
    }

    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Horizontal collision
    if (level.checkTileCollision(this.x, this.y, this.w, this.h)) {
      if (this.vx > 0) {
        this.x = Math.floor((this.x + this.w) / TILE) * TILE - this.w - 0.1;
      } else if (this.vx < 0) {
        this.x = Math.floor(this.x / TILE + 1) * TILE + 0.1;
      }
      this.vx = 0;
    }

    // Vertical collision
    this.onGround = false;
    if (level.checkTileCollision(this.x, this.y, this.w, this.h)) {
      if (this.vy > 0) {
        this.y = Math.floor((this.y + this.h) / TILE) * TILE - this.h;
        this.onGround = true;
        this.vy = 0;
      } else if (this.vy < 0) {
        this.y = Math.floor(this.y / TILE + 1) * TILE;
        this.vy = 0;
      }
    }

    if (level.checkSpike(this.x, this.y, this.w, this.h)) {
      this.takeDamage(1);
    }

    if (level.checkVine(this.x, this.y, this.w, this.h)) {
      this.vy = -2;
      this.vx *= 0.5;
    }

    // Collectibles
    level.collectibles.forEach((c) => {
      if (c.collected) return;
      if (rectOverlap(this.getBounds(), c)) {
        c.collected = true;
        if (c.type === 'galleon') {
          this.galleons++;
          this.housePoints += Math.floor(5 * this.xpMult);
        } else if (c.type === 'card') {
          this.cards++;
          this.housePoints += Math.floor(15 * this.xpMult);
        } else if (c.type === 'snitch') {
          this.housePoints += Math.floor(50 * this.xpMult);
        } else if (c.type === 'heart') {
          this.maxHearts++;
          this.hearts++;
        }
        this.game.particles.emit(c.x, c.y, 12, '#ffd700');
      }
    });

    // Fall death
    if (this.y > LEVEL_DATA.height * TILE + 100) {
      this.takeDamage(this.hearts);
    }

    // Boss gate
    const gate = LEVEL_DATA.bossGate;
    if (this.x > gate.x - 64 && !this.game.boss?.active && !this.game.boss?.defeated) {
      this.game.startBoss();
    }
  }

  draw(ctx, camX, camY) {
    const x = this.x - camX;
    const y = this.y - camY;
    const h = this.crouching ? this.h * 0.6 : this.h;
    const yOff = this.crouching ? this.h - h : 0;

    if (this.invuln > 0 && Math.floor(this.invuln / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const houseColors = {
      gryffindor: '#740001',
      slytherin: '#1a472a',
      hufflepuff: '#ecb939',
      ravenclaw: '#0e1a40',
    };
    const robe = houseColors[this.house] || '#2a1f3d';

    // Robe body
    ctx.fillStyle = robe;
    ctx.fillRect(x + 2, y + yOff + 14, this.w - 4, h - 14);

    // Head
    ctx.fillStyle = '#deb887';
    ctx.beginPath();
    ctx.arc(x + this.w / 2, y + yOff + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(x + 6, y + yOff, this.w - 12, 8);

    // Wand arm
    const wandX = this.facing > 0 ? x + this.w : x - 8;
    ctx.fillStyle = '#deb887';
    ctx.fillRect(wandX, y + yOff + 18, 8, 4);
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(wandX + (this.facing > 0 ? 6 : -6), y + yOff + 16, 10, 3);

    // Spell cast flash
    if (this.game.spells?.projectiles?.length) {
      const last = this.game.spells.projectiles[this.game.spells.projectiles.length - 1];
      if (last && last.life > 55) {
        ctx.fillStyle = SPELLS[this.currentSpell]?.color || '#fff';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(wandX + this.facing * 8, y + yOff + 18, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.globalAlpha = 1;
  }
}
