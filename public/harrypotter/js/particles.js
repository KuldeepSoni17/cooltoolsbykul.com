class Particle {
  constructor(x, y, vx, vy, color, life, size = 4) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.life--;
    return this.life > 0;
  }

  draw(ctx, camX) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camX, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, color, spread = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * spread + 1;
      this.particles.push(
        new Particle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - 1,
          color,
          20 + Math.random() * 20,
          2 + Math.random() * 4
        )
      );
    }
  }

  emitSpell(x, y, color, direction) {
    for (let i = 0; i < 12; i++) {
      const spread = (Math.random() - 0.5) * 0.8;
      this.particles.push(
        new Particle(
          x,
          y,
          direction * (4 + Math.random() * 3) + spread * 2,
          (Math.random() - 0.5) * 3,
          color,
          15 + Math.random() * 15,
          3 + Math.random() * 3
        )
      );
    }
  }

  update() {
    this.particles = this.particles.filter((p) => p.update());
  }

  draw(ctx, camX) {
    this.particles.forEach((p) => p.draw(ctx, camX));
  }
}
