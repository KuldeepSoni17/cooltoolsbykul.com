class UI {
  constructor(game) {
    this.game = game;
    this.overlay = document.getElementById('overlay');
    this.overlayContent = document.getElementById('overlay-content');
    this.hudAlpha = 1;
    this.hudTimer = 0;
    this.spellWheelOpen = false;
    this.spellWheelAngle = 0;
  }

  showOverlay(html) {
    this.overlayContent.innerHTML = html;
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  showTitle() {
    this.showOverlay(`
      <h1>Wandwork</h1>
      <p class="subtitle">A Wizarding Platformer — Vertical Slice</p>
      <p>Most platformers give you a jump button.<br>This one gives you a wand.</p>
      <p class="start-hint">Press ENTER to begin</p>
    `);
  }

  showHouseSelect() {
    this.showOverlay(`
      <h2>Choose Your House</h2>
      <p class="subtitle">Each house grants a unique passive bonus</p>
      <div class="house-grid">
        <button class="house-btn gryffindor" data-house="gryffindor">🦁 Gryffindor<br><small>+1 heart</small></button>
        <button class="house-btn slytherin" data-house="slytherin">🐍 Slytherin<br><small>-10% cooldowns</small></button>
        <button class="house-btn hufflepuff" data-house="hufflepuff">🦡 Hufflepuff<br><small>+1s invincibility</small></button>
        <button class="house-btn ravenclaw" data-house="ravenclaw">🦅 Ravenclaw<br><small>+25% House Points</small></button>
      </div>
    `);
    this.overlayContent.querySelectorAll('.house-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.game.selectHouse(btn.dataset.house);
      });
    });
  }

  showControls() {
    this.showOverlay(`
      <h2>Diagon Alley — Year 1</h2>
      <ul class="controls-list">
        <li><kbd>A</kbd> <kbd>D</kbd> — Move</li>
        <li><kbd>W</kbd> — Look up / aim up</li>
        <li><kbd>S</kbd> — Crouch</li>
        <li><kbd>Space</kbd> — Jump</li>
        <li><kbd>Shift</kbd> — Sprint</li>
        <li><kbd>X</kbd> or <kbd>J</kbd> — Cast spell</li>
        <li><kbd>Q</kbd> / <kbd>E</kbd> — Cycle spells</li>
        <li><kbd>Tab</kbd> (hold) — Spell wheel</li>
        <li><kbd>F</kbd> — Interact</li>
        <li><kbd>Esc</kbd> — Pause</li>
      </ul>
      <p><strong>Spells:</strong> Lumos reveals hidden platforms. Alohomora unlocks doors. Incendio burns vines. Reducto breaks cracked walls.</p>
      <p class="start-hint">Press ENTER to start your adventure</p>
    `);
  }

  showPause() {
    this.showOverlay(`
      <h2>Paused</h2>
      <p>Press ESC to resume</p>
      <p class="start-hint">Press R to restart level</p>
    `);
  }

  showVictory() {
    const p = this.game.player;
    this.showOverlay(`
      <h1>Year 1 Complete!</h1>
      <p>You defeated the Mountain Troll!</p>
      <p>House Points: ${p.housePoints}</p>
      <p>Galleons: ${p.galleons} | Chocolate Frog Cards: ${p.cards}</p>
      <p class="subtitle">The Forbidden Forest awaits in the full game...</p>
      <p class="start-hint">Press ENTER to play again</p>
    `);
  }

  showGameOver() {
    this.showOverlay(`
      <h2>Game Over</h2>
      <p>Your wand clatters to the cobblestones...</p>
      <p class="start-hint">Press ENTER to try again</p>
    `);
  }

  drawHUD(ctx, player) {
    if (!player) return;

    const inactive = this.game.input.isInactive();
    if (!inactive) {
      this.hudAlpha = 1;
      this.hudTimer = 120;
    } else if (this.hudTimer > 0) {
      this.hudTimer--;
    } else {
      this.hudAlpha = Math.max(0.3, this.hudAlpha - 0.02);
    }
    ctx.globalAlpha = this.hudAlpha;

    // Hearts
    for (let i = 0; i < player.maxHearts; i++) {
      ctx.fillStyle = i < player.hearts ? '#e74c3c' : '#444';
      ctx.beginPath();
      const hx = 20 + i * 28;
      ctx.arc(hx + 6, 28, 6, 0, Math.PI * 2);
      ctx.arc(hx + 18, 28, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(hx + 4, 30, 16, 10);
    }

    // Mana bar
    ctx.fillStyle = '#222';
    ctx.fillRect(20, 48, 120, 10);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(20, 48, 120 * (player.mana / player.maxMana), 10);
    ctx.strokeStyle = '#d4af37';
    ctx.strokeRect(20, 48, 120, 10);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = '10px Georgia';
    ctx.fillText('Mana', 22, 46);

    // Current spell
    const spell = SPELLS[player.currentSpell];
    ctx.fillStyle = 'rgba(20, 10, 30, 0.7)';
    ctx.fillRect(1080, 16, 180, 56);
    ctx.strokeStyle = spell.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(1080, 16, 180, 56);
    ctx.fillStyle = spell.color;
    ctx.beginPath();
    ctx.arc(1110, 44, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5e6c8';
    ctx.font = '14px Georgia';
    ctx.fillText(spell.name, 1130, 40);
    ctx.font = '10px Georgia';
    ctx.fillStyle = '#a89070';
    ctx.fillText(spell.desc.substring(0, 28) + '...', 1130, 56);

    // Spell cycle hints
    const prev = SPELLS[player.equippedSpells[(player.spellIndex - 1 + player.equippedSpells.length) % player.equippedSpells.length]];
    const next = SPELLS[player.equippedSpells[(player.spellIndex + 1) % player.equippedSpells.length]];
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = prev.color;
    ctx.fillRect(1050, 30, 10, 10);
    ctx.fillStyle = next.color;
    ctx.fillRect(1270, 30, 10, 10);
    ctx.globalAlpha = this.hudAlpha;

    // House points
    ctx.fillStyle = '#d4af37';
    ctx.font = '16px Georgia';
    ctx.fillText(`House Points: ${player.housePoints}`, 20, 80);
    ctx.font = '12px Georgia';
    ctx.fillStyle = '#a89070';
    ctx.fillText(`Galleons: ${player.galleons}  Cards: ${player.cards}`, 20, 98);

    // Zone name
    ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
    ctx.font = '18px Georgia';
    ctx.textAlign = 'center';
    const zoneName = this.game.state === GAME_STATE.BOSS ? 'Boss Arena' : 'Diagon Alley';
    ctx.fillText(zoneName, 640, 30);
    ctx.textAlign = 'left';

    // Boss hint
    if (this.game.boss?.active && !this.game.boss.defeated) {
      ctx.fillStyle = '#f5e6c8';
      ctx.font = '12px Georgia';
      ctx.textAlign = 'center';
      if (this.game.boss.phase === 1) {
        ctx.fillText('Phase 1: Wingardium Leviosa the club, then attack!', 640, 680);
      } else {
        ctx.fillText('Phase 2: Reducto the cracked floor beneath the troll!', 640, 680);
      }
      ctx.textAlign = 'left';
    }

    ctx.globalAlpha = 1;

    if (this.spellWheelOpen) {
      this.drawSpellWheel(ctx, player);
    }
  }

  drawSpellWheel(ctx, player) {
    ctx.fillStyle = 'rgba(10, 6, 18, 0.4)';
    ctx.fillRect(0, 0, 1280, 720);

    const cx = 640;
    const cy = 360;
    const radius = 120;
    const spells = player.equippedSpells;
    const count = spells.length;

    spells.forEach((id, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const sx = cx + Math.cos(angle) * radius;
      const sy = cy + Math.sin(angle) * radius;
      const spell = SPELLS[id];
      const selected = id === player.currentSpell;

      ctx.fillStyle = selected ? spell.color : 'rgba(40, 30, 50, 0.9)';
      ctx.beginPath();
      ctx.arc(sx, sy, selected ? 36 : 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = spell.color;
      ctx.lineWidth = selected ? 3 : 1;
      ctx.stroke();

      ctx.fillStyle = '#f5e6c8';
      ctx.font = selected ? '11px Georgia' : '9px Georgia';
      ctx.textAlign = 'center';
      const label = spell.name.split(' ')[0];
      ctx.fillText(label, sx, sy + 4);
    });
    ctx.textAlign = 'left';
  }

  drawMessage(ctx, text, timer) {
    if (timer <= 0) return;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(340, 320, 600, 50);
    ctx.strokeStyle = '#d4af37';
    ctx.strokeRect(340, 320, 600, 50);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = '18px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(text, 640, 352);
    ctx.textAlign = 'left';
  }
}
