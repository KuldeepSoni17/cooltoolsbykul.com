class Input {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false, rightDown: false };
    this.lastActivity = Date.now();
    this.setup();
  }

  setup() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.lastActivity = Date.now();
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.lastActivity = Date.now();
    });
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
      this.lastActivity = Date.now();
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouse.down = true;
      if (e.button === 2) this.mouse.rightDown = true;
      this.lastActivity = Date.now();
    });
    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.down = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isInactive() {
    return Date.now() - this.lastActivity > 2000;
  }

  getMovement() {
    let x = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
    return {
      x,
      jump: this.keys['Space'] || this.keys['KeyW'],
      sprint: this.keys['ShiftLeft'] || this.keys['ShiftRight'],
      crouch: this.keys['KeyS'] || this.keys['ArrowDown'],
      up: this.keys['KeyW'] || this.keys['ArrowUp'],
    };
  }

  pressed(code) {
    if (this.keys[code]) {
      this.keys[code] = false;
      return true;
    }
    return false;
  }

  held(code) {
    return !!this.keys[code];
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.input = new Input();
    this.particles = new ParticleSystem();
    this.spells = new SpellEffects(this);
    this.level = new Level(this);
    this.player = new Player(this);
    this.ui = new UI(this);
    this.enemies = [];
    this.boss = null;
    this.camera = { x: 0, y: 0 };
    this.state = GAME_STATE.TITLE;
    this.message = '';
    this.messageTimer = 0;
    this.lastTime = 0;
  }

  init() {
    this.ui.showTitle();
    this.loop(0);
  }

  setState(state) {
    this.state = state;
    switch (state) {
      case GAME_STATE.TITLE:
        this.ui.showTitle();
        break;
      case GAME_STATE.HOUSE_SELECT:
        this.ui.showHouseSelect();
        break;
      case GAME_STATE.PLAYING:
        this.ui.hideOverlay();
        break;
      case GAME_STATE.BOSS:
        break;
      case GAME_STATE.PAUSED:
        this.ui.showPause();
        break;
      case GAME_STATE.VICTORY:
        this.ui.showVictory();
        break;
      case GAME_STATE.GAME_OVER:
        this.ui.showGameOver();
        break;
    }
  }

  selectHouse(houseId) {
    this.selectedHouse = houseId;
    this.ui.showControls();
    this.state = GAME_STATE.PLAYING;
    this.waitingForStart = true;
  }

  startLevel() {
    const house = this.selectedHouse || this.player.house;
    this.level = new Level(this);
    this.player.reset();
    if (house) {
      this.selectedHouse = house;
      this.player.applyHouse(house);
    }
    this.enemies = spawnEnemies(LEVEL_DATA.enemySpawns);
    this.boss = new MountainTrollBoss(
      LEVEL_DATA.bossGate.x - 100,
      (LEVEL_DATA.height - 2) * TILE - 120
    );
    this.boss.game = this;
    this.spells = new SpellEffects(this);
    this.message = 'Welcome to Diagon Alley! Collect galleons and reach the alley end.';
    this.messageTimer = 240;
    this.waitingForStart = false;
  }

  startBoss() {
    if (this.boss.active || this.boss.defeated) return;
    this.state = GAME_STATE.BOSS;
    this.boss.start();
    this.message = 'The Mountain Troll blocks your path!';
    this.messageTimer = 180;
    // Lock camera near boss
    this.enemies = this.enemies.filter((e) => !e.alive || Math.abs(e.x - this.boss.x) > 400);
  }

  getAimDirection() {
    const p = this.player;
    const input = this.input.getMovement();
    let dir = p.facing;

    if (input.up && !p.onGround) dir = p.facing;
    else if (input.up) {
      // Aim upward spell - use facing for now in 2D side view
      return p.facing;
    }

    const canvas = this.canvas;
    const screenX = p.x - this.camera.x + p.w / 2;
    if (this.input.mouse.down) {
      const dx = this.input.mouse.x - screenX;
      if (Math.abs(dx) > 10) dir = dx > 0 ? 1 : -1;
    }
    return dir;
  }

  update(dt) {
    const input = this.input;

    if (this.state === GAME_STATE.TITLE) {
      if (input.pressed('Enter')) this.setState(GAME_STATE.HOUSE_SELECT);
      return;
    }

    if (this.state === GAME_STATE.HOUSE_SELECT) return;

    if (this.state === GAME_STATE.VICTORY || this.state === GAME_STATE.GAME_OVER) {
      if (input.pressed('Enter')) {
        this.player.house = null;
        this.setState(GAME_STATE.TITLE);
      }
      return;
    }

    if (this.waitingForStart) {
      if (input.pressed('Enter')) {
        this.startLevel();
        this.ui.hideOverlay();
        this.waitingForStart = false;
      }
      return;
    }

    if (input.pressed('Escape')) {
      if (this.state === GAME_STATE.PAUSED) {
        this.setState(GAME_STATE.PLAYING);
        this.ui.hideOverlay();
      } else {
        this.setState(GAME_STATE.PAUSED);
      }
      return;
    }

    if (this.state === GAME_STATE.PAUSED) {
      if (input.pressed('KeyR')) {
        this.startLevel();
        this.setState(GAME_STATE.PLAYING);
        this.ui.hideOverlay();
      }
      return;
    }

    const player = this.player;
    const move = input.getMovement();

    if (input.pressed('KeyQ')) player.cycleSpell(-1);
    if (input.pressed('KeyE')) player.cycleSpell(1);

    this.ui.spellWheelOpen = input.held('Tab');
    if (this.ui.spellWheelOpen) {
      const spells = player.equippedSpells;
      const count = spells.length;
      const angle = Math.atan2(this.input.mouse.y - 360, this.input.mouse.x - 640);
      let idx = Math.round(((angle + Math.PI / 2) / (Math.PI * 2)) * count) % count;
      if (idx < 0) idx += count;
      player.spellIndex = idx;
    }

    if (input.mouse.down && !this._mouseCastHeld) {
      this._mouseCastPulse = true;
      this._mouseCastHeld = true;
    }
    if (!input.mouse.down) this._mouseCastHeld = false;

    const castPressed =
      input.pressed('KeyX') || input.pressed('KeyJ') || this._mouseCastPulse;
    if (this._mouseCastPulse) this._mouseCastPulse = false;

    if (castPressed && !this.ui.spellWheelOpen) {
      const aim = this.getAimDirection();
      const spellId = player.currentSpell;
      if (spellId === 'incendio') {
        const hit = this.spells.cast(player, spellId, aim);
        if (hit) this.level.burnVines();
      } else {
        this.spells.cast(player, spellId, aim);
      }
      if (this.spells.lumosActive) this.level.revealHidden();
    }

    player.update(move, this.level);
    this.level.update();
    this.enemies.forEach((e) => e.update(this.level, player));
    this.spells.update();

    if (this.boss?.active) {
      this.boss.update(this.level, player);
      if (this.boss.defeated) {
        this.state = GAME_STATE.VICTORY;
        player.housePoints += Math.floor(100 * player.xpMult);
        this.setState(GAME_STATE.VICTORY);
      }
    }

    this.particles.update();

    // Camera follow
    const targetX = player.x - 640 + player.w / 2;
    const maxCamX = LEVEL_DATA.width * TILE - 1280;
    this.camera.x += (Math.max(0, Math.min(maxCamX, targetX)) - this.camera.x) * 0.1;
    this.camera.y = 0;

    if (this.boss?.active) {
      this.camera.x = Math.max(this.camera.x, this.boss.x - 500);
    }

    if (this.messageTimer > 0) this.messageTimer--;
  }

  draw() {
    const ctx = this.ctx;
    const camX = this.camera.x;
    const camY = this.camera.y;

    ctx.clearRect(0, 0, 1280, 720);

    if (this.state === GAME_STATE.TITLE || this.state === GAME_STATE.HOUSE_SELECT) {
      this.drawTitleScreen(ctx);
      return;
    }

    // Dark overlay for Lumos darkness effect
    this.level.draw(ctx, camX, camY);

    if (!this.spells.lumosActive && this.state !== GAME_STATE.BOSS) {
      ctx.fillStyle = 'rgba(0, 0, 20, 0.55)';
      ctx.fillRect(0, 0, 1280, 720);
    }

    this.enemies.forEach((e) => e.draw(ctx, camX, camY));
    if (this.boss) this.boss.draw(ctx, camX, camY);
    this.player.draw(ctx, camX, camY);
    this.spells.draw(ctx, camX);
    this.particles.draw(ctx, camX);

    this.ui.drawHUD(ctx, this.player);
    this.ui.drawMessage(ctx, this.message, this.messageTimer);
  }

  drawTitleScreen(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, '#1a0a2e');
    grad.addColorStop(1, '#2d1b4e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#d4af37';
    ctx.font = '64px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Wandwork', 640, 280);
    ctx.font = '24px Georgia';
    ctx.fillStyle = '#f5e6c8';
    ctx.fillText('A Wizarding Platformer', 640, 330);
    ctx.font = '16px Georgia';
    ctx.fillStyle = '#a89070';
    ctx.fillText('Press ENTER', 640, 500);
    ctx.textAlign = 'left';
  }

  loop(timestamp) {
    this.update();
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }
}
