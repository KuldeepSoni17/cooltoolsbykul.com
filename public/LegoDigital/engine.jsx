// ====== Iso 3D Engine for LegoDigital ======
// Pure-SVG isometric scene: projection, painter's-sort, picking, view rotation, piece-type rendering.

// 30° dimetric instead of the squashed 2:1 pixel-art iso (TH/TW = 0.5).
// TH/TW ≈ 0.66 separates L-shape arms more clearly without losing top-face
// visibility for stud counting — matches what Lego instruction renders use.
const ISO = { TW: 22, TH: 15, UH: 28 };

const COLORS = {
  red:    '#d01012',
  yellow: '#f5c518',
  blue:   '#0d68b1',
  green:  '#2a8a3e',
  orange: '#e8741a',
  white:  '#f6f3eb',
  black:  '#222222',
  grey:   '#9ea0a3',
  brown:  '#7a4a2a',
  pink:   '#e91e63',
  purple: '#7e3fb5',
  tan:    '#d8c4a0',
  dgreen: '#16572a',
  dblue:  '#0a3a64',
  dred:   '#7a0a0c',
  trans:  '#a8d8e8',
};

const COLOR_ORDER = ['red','yellow','blue','green','orange','white','black','grey','brown','pink','purple','tan','dgreen','dblue','dred','trans'];

// Piece types — special rendering on top of the basic cuboid frame.
const PIECE_TYPES = ['brick','tile','wheel','slope','cone','cylinder','window','door','minifig'];

function darken(hex, f) {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const c = v => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2,'0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function iso(wx, wy, wz) {
  return { x: (wx - wy) * ISO.TW, y: (wx + wy) * ISO.TH - wz * ISO.UH };
}

function effSize(b) {
  return b.rot ? { w: b.d, d: b.w } : { w: b.w, d: b.d };
}

// ---------- View rotation ----------
// view ∈ {0,1,2,3} — rotates the world around the baseplate center, 90° CCW per step.
function applyView(b, view, base) {
  if (!view) return b;
  const ef = effSize(b);
  let nx, ny, nw, nd, slopeDir = b.slopeDir;
  if (view === 1) { nx = b.y;                    ny = base.w - b.x - ef.w; nw = ef.d; nd = ef.w; }
  else if (view === 2) { nx = base.w - b.x - ef.w; ny = base.d - b.y - ef.d; nw = ef.w; nd = ef.d; }
  else /* view === 3 */ { nx = base.d - b.y - ef.d; ny = b.x;                    nw = ef.d; nd = ef.w; }
  // Rotate slope direction too: slopeDir ∈ 'N' | 'E' | 'S' | 'W' (which way the high edge faces)
  const dirCycle = ['N','E','S','W'];
  if (slopeDir) {
    const i = dirCycle.indexOf(slopeDir);
    if (i >= 0) slopeDir = dirCycle[(i + view) % 4];
  }
  return { ...b, x: nx, y: ny, w: nw, d: nd, rot: 0, slopeDir };
}

function viewedBaseSize(base, view) {
  return view % 2 === 0 ? base : { w: base.d, d: base.w };
}

// Inverse: given a placement in view-rotated coords (rgx, rgy, rw, rd), what (x, y, w, d) in original?
function invView(rgx, rgy, rw, rd, view, base) {
  if (!view) return { x: rgx, y: rgy, w: rw, d: rd };
  if (view === 1) return { x: base.w - rgy - rd, y: rgx,                    w: rd, d: rw };
  if (view === 2) return { x: base.w - rgx - rw, y: base.d - rgy - rd,       w: rw, d: rd };
  /* view 3 */     return { x: rgy,                y: base.d - rgx - rw,       w: rd, d: rw };
}

// ---------- Geometry ----------
function brickGeometry(b, origin) {
  const w = b.w, d = b.d;
  const gx = b.x, gy = b.y, gz = b.z;
  const h = b.h ?? 1;
  const O = origin;
  const P = (x, y, z) => {
    const p = iso(x, y, z); return { x: p.x + O.x, y: p.y + O.y };
  };
  const c000 = P(gx,   gy,   gz);
  const c100 = P(gx+w, gy,   gz);
  const c010 = P(gx,   gy+d, gz);
  const c110 = P(gx+w, gy+d, gz);
  const c001 = P(gx,   gy,   gz+h);
  const c101 = P(gx+w, gy,   gz+h);
  const c011 = P(gx,   gy+d, gz+h);
  const c111 = P(gx+w, gy+d, gz+h);
  return {
    c000, c100, c010, c110, c001, c101, c011, c111,
    top:   [c001, c101, c111, c011],
    front: [c000, c100, c101, c001],
    right: [c100, c110, c111, c101],
    // Convex-hull silhouette (clockwise around outside): top, top-right, right,
    // bottom, left, top-left. This is the correct outline regardless of brick
    // aspect ratio — c000 and c111 are interior points for tall narrow bricks
    // and including them produces a self-intersecting polygon.
    silhouette: [c001, c101, c100, c110, c010, c011],
  };
}

// Rotate a single world point around the baseplate center, matching applyView.
function rotPoint(x, y, view, base) {
  if (!view) return { x, y };
  if (view === 1) return { x: y,             y: base.w - x };
  if (view === 2) return { x: base.w - x,    y: base.d - y };
  /* view 3 */     return { x: base.d - y,   y: x };
}

// "0 → A, 25 → Z, 26 → AA, …"
function colLabel(i) {
  let s = '';
  let n = i | 0;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function studPositions(b, origin, coveredCells) {
  if (b.type === 'tile' || b.type === 'wheel' || b.type === 'cylinder' || b.type === 'cone' || b.type === 'door' || b.type === 'window' || b.type === 'minifig' || b.noStuds) return [];
  const studs = [];
  for (let i = 0; i < b.w; i++) {
    for (let j = 0; j < b.d; j++) {
      // Hide studs that have a brick clipped on top of them — otherwise the
      // back-row studs poke out below the upper brick's silhouette in iso view
      // and make stacked bricks look like they sit at the wrong height.
      if (coveredCells && coveredCells.has(`${b.x + i},${b.y + j},${b.z + (b.h ?? 1)}`)) continue;
      const c = iso(b.x + i + 0.5, b.y + j + 0.5, b.z + (b.h ?? 1));
      studs.push({ x: c.x + origin.x, y: c.y + origin.y });
    }
  }
  return studs;
}

// Build a Set of "(x,y,z)" cells that are occupied by some brick — used to
// hide studs on the top face of a brick that has another piece directly above.
function buildCoveredCells(bricks) {
  const s = new Set();
  for (const b of bricks) {
    const h = b.h ?? 1;
    for (let i = 0; i < b.w; i++) {
      for (let j = 0; j < b.d; j++) {
        for (let k = 0; k < h; k++) {
          s.add(`${b.x + i},${b.y + j},${b.z + k}`);
        }
      }
    }
  }
  return s;
}

function paintOrder(bricks) {
  const n = bricks.length;
  if (n <= 1) return [...bricks];

  // For axis-aligned non-overlapping boxes in iso view (camera at +x_far, -y_far,
  // +z_far looking at origin), A is in front of B (A drawn after B) iff A is
  // separated from B along one of these axes in the "front" direction AND they
  // overlap in the other two axes' screen projection:
  //   - A is above B in z       (A.z_min >= B.z_max)
  //   - A is in front in y      (A.y_max <= B.y_min)   // smaller y is camera-side
  //   - A is to the right in x  (A.x_min >= B.x_max)   // larger x is camera-side
  function inFrontOf(a, b) {
    const ax = a.x, ay = a.y, az = a.z, aw = a.w, ad = a.d, ah = a.h ?? 1;
    const bx = b.x, by = b.y, bz = b.z, bw = b.w, bd = b.d, bh = b.h ?? 1;
    if (az >= bz + bh
        && ax < bx + bw && bx < ax + aw
        && ay < by + bd && by < ay + ad) return true;
    if (ay + ad <= by
        && ax < bx + bw && bx < ax + aw
        && az < bz + bh && bz < az + ah) return true;
    if (ax >= bx + bw
        && ay < by + bd && by < ay + ad
        && az < bz + bh && bz < az + ah) return true;
    return false;
  }

  // Build dependency graph and run Kahn's algorithm.
  const deps = new Array(n).fill(0);
  const rev = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (inFrontOf(bricks[i], bricks[j])) {
        deps[i]++;
        rev[j].push(i);
      }
    }
  }
  const queue = [];
  for (let i = 0; i < n; i++) if (deps[i] === 0) queue.push(i);
  const out = [];
  while (queue.length) {
    // Pop the candidate with the lowest "depth proxy" (z then x+y descending)
    // so the order is deterministic and matches intuition when there are ties.
    let bestIdx = 0;
    for (let k = 1; k < queue.length; k++) {
      const a = bricks[queue[k]], b = bricks[queue[bestIdx]];
      if (a.z !== b.z) { if (a.z < b.z) bestIdx = k; }
      else if ((a.x + a.y) !== (b.x + b.y)) { if ((a.x + a.y) > (b.x + b.y)) bestIdx = k; }
    }
    const i = queue.splice(bestIdx, 1)[0];
    out.push(bricks[i]);
    for (const j of rev[i]) {
      if (--deps[j] === 0) queue.push(j);
    }
  }
  if (out.length < n) {
    // Shouldn't happen for non-overlapping boxes — fall back so we never lose pieces.
    for (let i = 0; i < n; i++) if (!out.includes(bricks[i])) out.push(bricks[i]);
  }
  return out;
}

function unproject(sx, sy, z) {
  const a = sx / ISO.TW;
  const b = (sy + z * ISO.UH) / ISO.TH;
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

function pickGroundCell(sx, sy, origin, baseSize) {
  const w = unproject(sx - origin.x, sy - origin.y, 0);
  const gx = Math.floor(w.x), gy = Math.floor(w.y);
  if (gx < 0 || gy < 0 || gx >= baseSize.w || gy >= baseSize.d) return null;
  return { x: gx, y: gy };
}

function topZAt(bricks, gx, gy, w, d) {
  let topZ = 0;
  for (const b of bricks) {
    const ef = effSize(b);
    if (b.x + ef.w <= gx) continue;
    if (gx + w <= b.x) continue;
    if (b.y + ef.d <= gy) continue;
    if (gy + d <= b.y) continue;
    const top = b.z + (b.h ?? 1);
    if (top > topZ) topZ = top;
  }
  return topZ;
}

function pip(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y))
      && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pickBrick(sx, sy, viewedBricks, origin) {
  const sorted = paintOrder(viewedBricks).slice().reverse();
  for (const b of sorted) {
    const g = brickGeometry(b, origin);
    if (pip({x: sx, y: sy}, g.silhouette)) {
      return b;
    }
  }
  return null;
}

function svgPoint(evt, svg) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function colorHex(c) {
  return c && c.startsWith && c.startsWith('#') ? c : (COLORS[c] || COLORS.red);
}

// Compute a viewBox that tightly fits the visible content (bricks + a small
// baseplate frame around them). Used by IsoScene so a build that occupies a
// corner of a big baseplate still fills the viewport instead of looking lost.
function computeIsoViewBox(bricks, baseSize, view, opts = {}) {
  const padX = opts.padX ?? 80, padY = opts.padY ?? 80;
  const minScale = opts.minScale ?? 8; // baseplate cells of margin around bricks
  const base = viewedBaseSize(baseSize, view);
  // Always include the rotated baseplate corners at z=0 so the boundary frame
  // shows up; but clip them to a window around the bricks so we don't pan all
  // the way out to the empty corner of a huge baseplate.
  let minX = 0, minY = 0, maxX = base.w, maxY = base.d;
  if (bricks.length > 0) {
    const rotated = bricks.map(b => applyView(b, view, baseSize));
    let bxMin = Infinity, byMin = Infinity, bzMin = 0;
    let bxMax = -Infinity, byMax = -Infinity, bzMax = 1;
    for (const b of rotated) {
      bxMin = Math.min(bxMin, b.x);
      byMin = Math.min(byMin, b.y);
      bxMax = Math.max(bxMax, b.x + b.w);
      byMax = Math.max(byMax, b.y + b.d);
      bzMax = Math.max(bzMax, b.z + (b.h ?? 1));
    }
    // Window around bricks with a margin in baseplate cells
    minX = Math.max(0, bxMin - minScale);
    minY = Math.max(0, byMin - minScale);
    maxX = Math.min(base.w, bxMax + minScale);
    maxY = Math.min(base.d, byMax + minScale);
    // Need to project the maxZ of bricks too
    opts.maxZ = Math.max(opts.maxZ || 0, bzMax + 1);
  }
  const maxZ = opts.maxZ ?? 6;
  // Project the 8 corners of the visible 3D bounding box and take screen extent
  const sx = [], sy = [];
  for (const x of [minX, maxX]) {
    for (const y of [minY, maxY]) {
      for (const z of [0, maxZ]) {
        const p = iso(x, y, z);
        sx.push(p.x); sy.push(p.y);
      }
    }
  }
  const left = Math.min(...sx) - padX;
  const right = Math.max(...sx) + padX;
  const top = Math.min(...sy) - padY;
  const bottom = Math.max(...sy) + padY;
  return `${left} ${top} ${right - left} ${bottom - top}`;
}

// ---------- Brick shape rendering (dispatch on type) ----------
function toStr(poly) { return poly.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '); }

function BrickShape({ brick, origin, selected, ghost, dim, coveredCells }) {
  const type = brick.type || 'brick';
  switch (type) {
    case 'wheel':    return <WheelShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} />;
    case 'cone':     return <ConeShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} />;
    case 'slope':    return <SlopeShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} />;
    case 'cylinder': return <CylinderShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} />;
    case 'window':   return <WindowShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} />;
    case 'door':     return <DoorShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} />;
    case 'minifig':  return <MinifigShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} />;
    case 'tile':
    case 'brick':
    default:         return <CuboidShape brick={brick} origin={origin} selected={selected} ghost={ghost} dim={dim} showStuds={type === 'brick'} coveredCells={coveredCells} />;
  }
}

function CuboidShape({ brick, origin, selected, ghost, dim, showStuds = true, coveredCells }) {
  const g = brickGeometry(brick, origin);
  const studs = showStuds ? studPositions(brick, origin, coveredCells) : [];
  const hex = colorHex(brick.color || 'red');
  const isTrans = brick.color === 'trans';
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const top = hex;
  const front = darken(hex, 0.78);
  const right = darken(hex, 0.55);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  return (
    <g opacity={opacity} style={{ pointerEvents: ghost ? 'none' : 'auto' }}>
      {/* Solid base: covers the whole silhouette so studs underneath can't bleed through gaps */}
      {!isTrans && <polygon points={toStr(g.silhouette)} fill={right} stroke="none" />}
      <polygon points={toStr(g.front)} fill={isTrans ? 'rgba(168,216,232,0.6)' : front} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={toStr(g.right)} fill={isTrans ? 'rgba(120,170,190,0.6)' : right} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={toStr(g.top)}   fill={isTrans ? 'rgba(200,232,240,0.6)' : top}   stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* Crisp outer outline drawn last */}
      <polygon points={toStr(g.silhouette)} fill="none" stroke="#1f1d1a" strokeWidth={selected ? 2.4 : 1.2} strokeLinejoin="round" />
      {/* Studs as cylindrical pegs: side strip + lit top + tiny highlight. */}
      {(() => {
        const sr = ISO.TW * 0.28;  // stud horizontal radius
        const sy = ISO.TW * 0.14;  // stud vertical radius (half-height ellipse)
        const sh = 6;              // stud height in screen pixels above brick top
        const sideFill = darken(hex, 0.62);
        const topFill = hex;
        return studs.map((s, i) => (
          <g key={i}>
            {/* attachment shadow at the brick top */}
            <ellipse cx={s.x} cy={s.y + 1} rx={sr * 1.05} ry={sy * 1.05} fill="rgba(0,0,0,0.28)" />
            {/* stud cylindrical body (the visible curved side) */}
            <path d={`M ${s.x - sr} ${s.y} L ${s.x - sr} ${s.y - sh}
                      A ${sr} ${sy} 0 0 0 ${s.x + sr} ${s.y - sh}
                      L ${s.x + sr} ${s.y}
                      A ${sr} ${sy} 0 0 1 ${s.x - sr} ${s.y} Z`}
                  fill={sideFill} stroke="#1f1d1a" strokeWidth="0.7" strokeLinejoin="round" />
            {/* stud top — lit ellipse */}
            <ellipse cx={s.x} cy={s.y - sh} rx={sr} ry={sy} fill={topFill} stroke="#1f1d1a" strokeWidth="0.7" />
            {/* highlight glint */}
            <ellipse cx={s.x - sr * 0.35} cy={s.y - sh - sy * 0.25}
                     rx={sr * 0.35} ry={sy * 0.35} fill="rgba(255,255,255,0.45)" />
          </g>
        ));
      })()}
    </g>
  );
}

// Wheel: black cuboid with a tire circle on the visible side faces
function WheelShape({ brick, origin, selected, ghost, dim }) {
  const g = brickGeometry(brick, origin);
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  // Compute approximate front/right face centers + radii
  const cFront = { x: (g.c000.x + g.c101.x) / 2, y: (g.c000.y + g.c101.y) / 2 };
  const cRight = { x: (g.c100.x + g.c111.x) / 2, y: (g.c100.y + g.c111.y) / 2 };
  const r = Math.min(ISO.UH, ISO.TW) * 0.45 * (brick.h ?? 1);
  return (
    <g opacity={opacity}>
      <polygon points={toStr(g.silhouette)} fill="#1a1a1a" stroke="none" />
      <polygon points={toStr(g.front)} fill="#1a1a1a" stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.right)} fill="#0e0e0e" stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.top)}   fill="#222" stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.silhouette)} fill="none" stroke="#1f1d1a" strokeWidth={1.2} />
      {/* tire rings on front/right */}
      <ellipse cx={cFront.x} cy={cFront.y} rx={r} ry={r * 0.95} fill="#0a0a0a" stroke="#1f1d1a" strokeWidth="1" />
      <ellipse cx={cFront.x} cy={cFront.y} rx={r * 0.4} ry={r * 0.4} fill="#7a7a7a" stroke="#1f1d1a" strokeWidth="0.8" />
      <ellipse cx={cFront.x} cy={cFront.y} rx={r * 0.15} ry={r * 0.15} fill="#1f1f1f" />
      <ellipse cx={cRight.x} cy={cRight.y} rx={r * 0.55} ry={r * 0.95} fill="#0a0a0a" stroke="#1f1d1a" strokeWidth="1" />
      <ellipse cx={cRight.x} cy={cRight.y} rx={r * 0.25} ry={r * 0.4} fill="#7a7a7a" stroke="#1f1d1a" strokeWidth="0.8" />
    </g>
  );
}

// Cone: pyramid base → apex at top center
function ConeShape({ brick, origin, selected, ghost, dim }) {
  const g = brickGeometry(brick, origin);
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  const hex = colorHex(brick.color || 'brown');
  // Apex at center top
  const apexW = iso(brick.x + brick.w / 2, brick.y + brick.d / 2, brick.z + (brick.h ?? 1));
  const apex = { x: apexW.x + origin.x, y: apexW.y + origin.y };
  const front = darken(hex, 0.78);
  const right = darken(hex, 0.55);
  // Front face triangle: c000 — c100 — apex
  const frontTri = [g.c000, g.c100, apex];
  const rightTri = [g.c100, g.c110, apex];
  const leftTri  = [g.c000, g.c010, apex]; // back-left face (will be drawn behind)
  return (
    <g opacity={opacity}>
      <polygon points={toStr(frontTri)} fill={front} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={toStr(rightTri)} fill={right} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
}

// Slope: top face slants from front (high) to back (low).
// slopeDir indicates which side is HIGH: 'N' = high side at y=gy+d, 'S' = high at y=gy,
// 'E' = high at x=gx+w, 'W' = high at x=gx.  Default 'S' (high on front face toward viewer).
function SlopeShape({ brick, origin, selected, ghost, dim }) {
  const g = brickGeometry(brick, origin);
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  const hex = colorHex(brick.color || 'red');
  const dir = brick.slopeDir || 'S';
  const top = hex, front = darken(hex, 0.78), right = darken(hex, 0.55);
  // Map slope: pick "tall" corners (z+h) and "low" corners (z) by direction.
  // Always 2 corners stay high (forming the high edge), other 2 stay low.
  // Direction maps:
  let highTop1, highTop2, lowBot1, lowBot2;
  if (dir === 'S') { highTop1 = g.c001; highTop2 = g.c101; lowBot1 = g.c010; lowBot2 = g.c110; }
  else if (dir === 'N') { highTop1 = g.c011; highTop2 = g.c111; lowBot1 = g.c000; lowBot2 = g.c100; }
  else if (dir === 'W') { highTop1 = g.c001; highTop2 = g.c011; lowBot1 = g.c100; lowBot2 = g.c110; }
  else /* 'E' */ { highTop1 = g.c101; highTop2 = g.c111; lowBot1 = g.c000; lowBot2 = g.c010; }
  // Slanted top quad
  const slantTop = [highTop1, highTop2, lowBot2, lowBot1];
  // Visible vertical faces (depending on dir)
  // For 'S' slope: front face is full tall rect (c000→c100→c101→c001), right face is a triangle (c100→c110→c101).
  // For 'E' slope: right face full (c100→c110→c111→c101), front face triangle (c000→c100→c101).
  // For 'N' or 'W': the slope goes UP at the back/left, so front becomes a triangle and right becomes a triangle.
  const isTrans = brick.color === 'trans';
  // Determine visible verticals
  const facesToDraw = [];
  if (dir === 'S') {
    facesToDraw.push({ pts: g.front, fill: front });
    facesToDraw.push({ pts: [g.c100, g.c110, g.c101], fill: right });
  } else if (dir === 'E') {
    facesToDraw.push({ pts: g.right, fill: right });
    facesToDraw.push({ pts: [g.c000, g.c100, g.c101], fill: front });
  } else if (dir === 'N') {
    // Front face: triangle low-front-left, low-front-right, going up to top-back via slope (visible front face becomes wedge)
    facesToDraw.push({ pts: [g.c000, g.c100, g.c111, g.c011], fill: front, isQuad: true });
    facesToDraw.push({ pts: [g.c100, g.c110, g.c111], fill: right });
  } else {
    facesToDraw.push({ pts: [g.c100, g.c110, g.c111, g.c101], fill: right });
    facesToDraw.push({ pts: [g.c000, g.c100, g.c101, g.c011], fill: front });
  }
  return (
    <g opacity={opacity}>
      {facesToDraw.map((f, i) => (
        <polygon key={i} points={toStr(f.pts)} fill={isTrans ? 'rgba(168,216,232,0.6)' : f.fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      ))}
      <polygon points={toStr(slantTop)} fill={isTrans ? 'rgba(200,232,240,0.6)' : top} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={toStr(g.silhouette)} fill="none" stroke="#1f1d1a" strokeWidth={1.2} />
    </g>
  );
}

// Cylinder: round-topped piece (looks like a curved boiler segment)
function CylinderShape({ brick, origin, selected, ghost, dim }) {
  const g = brickGeometry(brick, origin);
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  const hex = colorHex(brick.color || 'red');
  const top = hex, front = darken(hex, 0.78), right = darken(hex, 0.55);
  // Just render cuboid, then overlay a "rim" ellipse on top and side circles
  return (
    <g opacity={opacity}>
      <polygon points={toStr(g.silhouette)} fill={right} stroke="none" />
      <polygon points={toStr(g.front)} fill={front} stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.right)} fill={right} stroke={stroke} strokeWidth={sw} />
      {/* approximate cylindrical top by drawing an ellipse capping the top face */}
      <polygon points={toStr(g.top)} fill={top} stroke={stroke} strokeWidth={sw} />
      <ellipse
        cx={(g.c001.x + g.c111.x) / 2}
        cy={(g.c001.y + g.c111.y) / 2}
        rx={Math.abs(g.c101.x - g.c011.x) / 2 * 0.95}
        ry={Math.abs(g.c001.y - g.c111.y) / 2 * 0.9}
        fill={darken(hex, 0.9)}
        stroke={stroke}
        strokeWidth={sw}
      />
      <polygon points={toStr(g.silhouette)} fill="none" stroke="#1f1d1a" strokeWidth={1.4} />
    </g>
  );
}

// Window: open-frame brick (transparent middle)
function WindowShape({ brick, origin, selected, ghost, dim }) {
  const g = brickGeometry(brick, origin);
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  const hex = colorHex(brick.color || 'white');
  const top = hex, front = darken(hex, 0.85), right = darken(hex, 0.65);
  // Render a thin frame around the cuboid, with a translucent pane in the middle
  return (
    <g opacity={opacity}>
      <polygon points={toStr(g.front)} fill="rgba(168,216,232,0.45)" stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.right)} fill="rgba(120,170,190,0.45)" stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.top)}   fill={top} stroke={stroke} strokeWidth={sw} />
      {/* frame */}
      <polygon points={toStr(g.silhouette)} fill="none" stroke="#1f1d1a" strokeWidth={2.4} />
      {/* mullion cross */}
      <line x1={(g.c000.x + g.c100.x)/2} y1={(g.c000.y + g.c100.y)/2}
            x2={(g.c001.x + g.c101.x)/2} y2={(g.c001.y + g.c101.y)/2}
            stroke={front} strokeWidth={1.4} />
    </g>
  );
}

// Door: brown panel with a small handle dot
function DoorShape({ brick, origin, selected, ghost, dim }) {
  const g = brickGeometry(brick, origin);
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  const hex = colorHex(brick.color || 'brown');
  const top = hex, front = darken(hex, 0.7), right = darken(hex, 0.55);
  // Handle position (front face, middle-right area)
  const fx = (g.c000.x * 0.4 + g.c100.x * 0.6);
  const fy = (g.c000.y * 0.5 + g.c001.y * 0.5);
  return (
    <g opacity={opacity}>
      <polygon points={toStr(g.front)} fill={front} stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.right)} fill={right} stroke={stroke} strokeWidth={sw} />
      <polygon points={toStr(g.top)}   fill={top} stroke={stroke} strokeWidth={sw} />
      <circle cx={fx} cy={fy} r="2.5" fill="#f5c518" stroke="#1f1d1a" strokeWidth="1" />
      <polygon points={toStr(g.silhouette)} fill="none" stroke="#1f1d1a" strokeWidth={1.4} />
    </g>
  );
}

// Minifig: simple humanoid (1×1 footprint, h=2 tall)
function MinifigShape({ brick, origin, selected, ghost, dim }) {
  const g = brickGeometry(brick, origin);
  const opacity = ghost ? 0.45 : (dim ? 0.3 : 1);
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1;
  const hex = colorHex(brick.color || 'yellow');
  // Approximate head (top third), torso (middle), legs (bottom)
  const cx = (g.c000.x + g.c100.x + g.c010.x + g.c110.x) / 4;
  const cyTop = g.c001.y;
  const cyBot = g.c000.y;
  const w = Math.abs(g.c100.x - g.c000.x) * 0.8;
  const total = cyBot - cyTop;
  return (
    <g opacity={opacity}>
      {/* legs (blue) */}
      <rect x={cx - w/2} y={cyBot - total * 0.4} width={w} height={total * 0.4} fill="#0d68b1" stroke={stroke} strokeWidth={sw} />
      {/* torso (red) */}
      <rect x={cx - w/2 - 1} y={cyBot - total * 0.7} width={w + 2} height={total * 0.3} fill="#d01012" stroke={stroke} strokeWidth={sw} />
      {/* head (yellow) */}
      <circle cx={cx} cy={cyBot - total * 0.82} r={w * 0.45} fill={hex} stroke={stroke} strokeWidth={sw} />
      {/* eyes */}
      <circle cx={cx - w*0.15} cy={cyBot - total * 0.83} r="1" fill="#1f1d1a" />
      <circle cx={cx + w*0.15} cy={cyBot - total * 0.83} r="1" fill="#1f1d1a" />
      {/* mouth */}
      <path d={`M ${cx - w*0.12} ${cyBot - total*0.78} Q ${cx} ${cyBot - total*0.76} ${cx + w*0.12} ${cyBot - total*0.78}`} stroke="#1f1d1a" strokeWidth="0.8" fill="none" />
    </g>
  );
}

// ---------- Whole scene ----------
function IsoScene({
  bricks, baseSize, baseColor = COLORS.green, origin,
  view = 0, ghost, selectedId,
  onPointerMove, onSceneClick, onSceneContext,
  viewBox, style,
  hideAboveZ, // optional clip layer
  showGrid = false,
}) {
  const svgRef = React.useRef(null);
  const base = viewedBaseSize(baseSize, view);

  // Apply view rotation to each brick and ghost
  const rotatedBricks = React.useMemo(() => {
    let bs = bricks.map(b => ({ ...applyView(b, view, baseSize), _origId: b.id }));
    if (typeof hideAboveZ === 'number') bs = bs.filter(b => b.z < hideAboveZ);
    return paintOrder(bs);
  }, [bricks, view, baseSize, hideAboveZ]);

  const coveredCells = React.useMemo(() => buildCoveredCells(rotatedBricks), [rotatedBricks]);

  const rotatedGhost = ghost ? applyView(ghost, view, baseSize) : null;

  const O = origin;
  const bp = [iso(0,0,0), iso(base.w,0,0), iso(base.w,base.d,0), iso(0,base.d,0)]
    .map(p => `${(p.x+O.x).toFixed(1)},${(p.y+O.y).toFixed(1)}`).join(' ');

  const handleMove = e => {
    if (!onPointerMove) return;
    const p = svgPoint(e, svgRef.current);
    onPointerMove({ sx: p.x, sy: p.y, evt: e });
  };
  const handleClick = e => {
    if (!onSceneClick) return;
    const p = svgPoint(e, svgRef.current);
    onSceneClick({ sx: p.x, sy: p.y, evt: e });
  };
  const handleContext = e => {
    e.preventDefault();
    if (!onSceneContext) return;
    const p = svgPoint(e, svgRef.current);
    onSceneContext({ sx: p.x, sy: p.y, evt: e });
  };

  // Build grid-line endpoints (in viewed coords) for the interior cell divisions.
  // Lines at every integer 0..base.w and 0..base.d; we skip the outer 0 / base
  // because those coincide with the boundary polygon.
  const shift = p => `${(p.x + O.x).toFixed(1)},${(p.y + O.y).toFixed(1)}`;
  const gridLines = [];
  for (let x = 1; x < base.w; x++) {
    const a = iso(x, 0, 0), b = iso(x, base.d, 0);
    gridLines.push({ x1: a.x + O.x, y1: a.y + O.y, x2: b.x + O.x, y2: b.y + O.y, key: `vx-${x}` });
  }
  for (let y = 1; y < base.d; y++) {
    const a = iso(0, y, 0), b = iso(base.w, y, 0);
    gridLines.push({ x1: a.x + O.x, y1: a.y + O.y, x2: b.x + O.x, y2: b.y + O.y, key: `vy-${y}` });
  }

  return (
    <svg ref={svgRef} viewBox={viewBox} style={style}
         onMouseMove={handleMove} onClick={handleClick} onContextMenu={handleContext}>
      {/* Paper-coloured baseplate top, no green fill, no studs.
          The boundary is a crisp ink outline that is always drawn — that is
          the "boundary" the user wants. Grid lines on top are gated by
          showGrid alongside the chess-style labels. */}
      <polygon points={bp} fill="rgba(244,237,224,0.55)" stroke="none" />
      {showGrid && gridLines.map(l => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="#7a6b58" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.55" />
      ))}
      <polygon points={bp} fill="none" stroke="#1f1d1a" strokeWidth="1.8" strokeLinejoin="round" />
      {/* subtle drop shadow under the sheet so the page still feels grounded */}
      {(() => {
        const c0 = iso(0,0,0), cW = iso(base.w,0,0), cD = iso(0,base.d,0), cWD = iso(base.w,base.d,0);
        const h = 0.18;
        const c0d = iso(0,0,-h), cWd = iso(base.w,0,-h), cDd = iso(0,base.d,-h), cWDd = iso(base.w,base.d,-h);
        return (
          <g opacity="0.4">
            <polygon points={[c0,cW,cWd,c0d].map(shift).join(' ')} fill="#9a8e7a" stroke="#1f1d1a" strokeWidth="0.8" />
            <polygon points={[cW,cWD,cWDd,cWd].map(shift).join(' ')} fill="#7a6e58" stroke="#1f1d1a" strokeWidth="0.8" />
          </g>
        );
      })()}
      {/* Chess-style grid labels (A,B,C… along columns; 1,2,3… along rows).
          Labels are anchored to world cells but their screen position rotates
          with the camera, so coords like "A1" always identify the same world
          cell regardless of view. */}
      {showGrid && (() => {
        const labels = [];
        for (let i = 0; i < baseSize.w; i++) {
          const r = rotPoint(i + 0.5, -0.7, view, baseSize);
          const p = iso(r.x, r.y, 0);
          labels.push(
            <text key={`col-${i}`}
              x={p.x + O.x} y={p.y + O.y + 4}
              fontFamily="Patrick Hand, cursive" fontSize="14" fontWeight="700"
              textAnchor="middle" fill="#3a2f24"
              style={{ pointerEvents: 'none', paintOrder: 'stroke' }}
              stroke="rgba(244,237,224,0.92)" strokeWidth="3.5">
              {colLabel(i)}
            </text>
          );
        }
        for (let j = 0; j < baseSize.d; j++) {
          const r = rotPoint(-0.7, j + 0.5, view, baseSize);
          const p = iso(r.x, r.y, 0);
          labels.push(
            <text key={`row-${j}`}
              x={p.x + O.x} y={p.y + O.y + 4}
              fontFamily="Patrick Hand, cursive" fontSize="14" fontWeight="700"
              textAnchor="middle" fill="#3a2f24"
              style={{ pointerEvents: 'none', paintOrder: 'stroke' }}
              stroke="rgba(244,237,224,0.92)" strokeWidth="3.5">
              {j + 1}
            </text>
          );
        }
        return labels;
      })()}
      {/* Drop shadows on the baseplate — one parallelogram per brick footprint
          at z=0, slightly larger than the brick, so each piece feels grounded. */}
      {rotatedBricks.filter(b => b.z === 0).map(b => {
        const corners = [
          iso(b.x - 0.08, b.y - 0.08, 0),
          iso(b.x + b.w + 0.08, b.y - 0.08, 0),
          iso(b.x + b.w + 0.08, b.y + b.d + 0.08, 0),
          iso(b.x - 0.08, b.y + b.d + 0.08, 0),
        ].map(p => `${(p.x + O.x).toFixed(1)},${(p.y + O.y).toFixed(1)}`).join(' ');
        return <polygon key={`sh-${b._origId || b.id}`} points={corners} fill="rgba(31,29,26,0.18)" stroke="none" />;
      })}
      {rotatedBricks.map(b => (
        <BrickShape key={b._origId || b.id} brick={b} origin={O}
          coveredCells={coveredCells}
          selected={selectedId === (b._origId || b.id)} />
      ))}
      {rotatedGhost && <BrickShape brick={rotatedGhost} origin={O} ghost />}
    </svg>
  );
}

// ============================================================
// Top-down view: orthographic projection, no z-skew, flat squares.
// ============================================================
const TOPSTEP = 28;

function pickTopCell(sx, sy, origin, baseSize) {
  const gx = Math.floor((sx - origin.x) / TOPSTEP);
  const gy = Math.floor((sy - origin.y) / TOPSTEP);
  if (gx < 0 || gx >= baseSize.w || gy < 0 || gy >= baseSize.d) return null;
  return { x: gx, y: gy };
}

function pickTopBrick(sx, sy, viewedBricks, origin) {
  // Topmost first (highest z) — viewedBricks are pre-rotated. Iterate by z desc.
  const sorted = [...viewedBricks].sort((a, b) => b.z - a.z);
  for (const b of sorted) {
    const x = b.x * TOPSTEP + origin.x;
    const y = b.y * TOPSTEP + origin.y;
    if (sx >= x && sx < x + b.w * TOPSTEP && sy >= y && sy < y + b.d * TOPSTEP) return b;
  }
  return null;
}

function TopBrick({ brick, origin, ghost, selected }) {
  const x = brick.x * TOPSTEP + origin.x;
  const y = brick.y * TOPSTEP + origin.y;
  const w = brick.w * TOPSTEP;
  const h = brick.d * TOPSTEP;
  const hex = colorHex(brick.color);
  const isTrans = brick.color === 'trans';
  const opacity = ghost ? 0.5 : 1;
  const stroke = selected ? '#f5c518' : '#1f1d1a';
  const sw = selected ? 2.4 : 1.2;
  const type = brick.type || 'brick';

  if (type === 'wheel') {
    const cx = x + w / 2, cy = y + h / 2;
    const r = Math.min(w, h) * 0.45;
    return (
      <g opacity={opacity} style={{ pointerEvents: ghost ? 'none' : 'auto' }}>
        <circle cx={cx} cy={cy} r={r} fill="#1a1a1a" stroke={stroke} strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r * 0.42} fill="#7a7a7a" stroke="#1f1d1a" strokeWidth="0.7" />
        <circle cx={cx} cy={cy} r={r * 0.14} fill="#1f1f1f" />
      </g>
    );
  }
  if (type === 'cone') {
    const cx = x + w / 2;
    return (
      <g opacity={opacity}>
        <rect x={x} y={y} width={w} height={h} fill={darken(hex, 0.8)} stroke={stroke} strokeWidth={sw} />
        <polygon points={`${x + 2},${y + h - 2} ${cx},${y + 2} ${x + w - 2},${y + h - 2}`}
                 fill={hex} stroke={stroke} strokeWidth={sw - 0.2} />
      </g>
    );
  }
  if (type === 'cylinder') {
    const cx = x + w / 2, cy = y + h / 2;
    return (
      <g opacity={opacity}>
        <ellipse cx={cx} cy={cy} rx={w / 2 - 1} ry={h / 2 - 1} fill={hex} stroke={stroke} strokeWidth={sw} />
        <ellipse cx={cx} cy={cy} rx={(w / 2 - 1) * 0.7} ry={(h / 2 - 1) * 0.7} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
      </g>
    );
  }
  if (type === 'slope') {
    const arrow = brick.slopeDir === 'N' ? '↑' : brick.slopeDir === 'S' ? '↓' :
                  brick.slopeDir === 'E' ? '→' : '←';
    return (
      <g opacity={opacity}>
        <rect x={x} y={y} width={w} height={h} fill={hex} stroke={stroke} strokeWidth={sw} />
        <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontFamily="Patrick Hand"
              fontSize={Math.min(w, h) * 0.5} fontWeight="700" fill="rgba(0,0,0,0.55)">{arrow}</text>
      </g>
    );
  }
  if (type === 'window') {
    return (
      <g opacity={opacity}>
        <rect x={x} y={y} width={w} height={h} fill="rgba(168,216,232,0.55)" stroke={stroke} strokeWidth={sw * 1.4} />
        <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={stroke} strokeWidth={sw * 0.7} />
        <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={stroke} strokeWidth={sw * 0.7} />
      </g>
    );
  }
  if (type === 'door') {
    return (
      <g opacity={opacity}>
        <rect x={x} y={y} width={w} height={h} fill={hex} stroke={stroke} strokeWidth={sw} />
        <circle cx={x + w * 0.78} cy={y + h * 0.5} r={Math.min(w, h) * 0.07} fill="#f5c518" stroke="#1f1d1a" strokeWidth="0.8" />
      </g>
    );
  }
  if (type === 'minifig') {
    const cx = x + w / 2, cy = y + h / 2;
    return (
      <g opacity={opacity}>
        <rect x={x} y={y} width={w} height={h} fill="rgba(244,237,224,0.4)" stroke="#bcb29a" strokeWidth="0.6" strokeDasharray="2 2" />
        <circle cx={cx} cy={cy} r={Math.min(w, h) * 0.32} fill={hex} stroke="#1f1d1a" strokeWidth="1" />
        <circle cx={cx - w * 0.07} cy={cy - h * 0.02} r="1" fill="#1f1d1a" />
        <circle cx={cx + w * 0.07} cy={cy - h * 0.02} r="1" fill="#1f1d1a" />
      </g>
    );
  }
  // tile or default brick
  const studs = [];
  if (type === 'brick') {
    for (let i = 0; i < brick.w; i++) {
      for (let j = 0; j < brick.d; j++) {
        studs.push({ cx: x + (i + 0.5) * TOPSTEP, cy: y + (j + 0.5) * TOPSTEP });
      }
    }
  }
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h}
            fill={isTrans ? 'rgba(168,216,232,0.55)' : hex} stroke={stroke} strokeWidth={sw} />
      {studs.map((s, i) =>
        <circle key={i} cx={s.cx} cy={s.cy} r={TOPSTEP * 0.22}
                fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.45)" strokeWidth="0.7" />
      )}
    </g>
  );
}

function TopDownScene({
  bricks, baseSize, origin, view = 0, ghost, selectedId,
  onPointerMove, onSceneClick, onSceneContext,
  viewBox, style, showGrid = false, hideAboveZ,
}) {
  const svgRef = React.useRef(null);
  const base = viewedBaseSize(baseSize, view);

  const rotatedBricks = React.useMemo(() => {
    let bs = bricks.map(b => ({ ...applyView(b, view, baseSize), _origId: b.id }));
    if (typeof hideAboveZ === 'number') bs = bs.filter(b => b.z < hideAboveZ);
    return [...bs].sort((a, b) => a.z - b.z);
  }, [bricks, view, baseSize, hideAboveZ]);
  const rotatedGhost = ghost ? applyView(ghost, view, baseSize) : null;

  const W = base.w * TOPSTEP, H = base.d * TOPSTEP;
  const O = origin;

  const handleMove = e => {
    if (!onPointerMove) return;
    const p = svgPoint(e, svgRef.current);
    onPointerMove({ sx: p.x, sy: p.y, evt: e });
  };
  const handleClick = e => {
    if (!onSceneClick) return;
    const p = svgPoint(e, svgRef.current);
    onSceneClick({ sx: p.x, sy: p.y, evt: e });
  };
  const handleContext = e => {
    e.preventDefault();
    if (!onSceneContext) return;
    const p = svgPoint(e, svgRef.current);
    onSceneContext({ sx: p.x, sy: p.y, evt: e });
  };

  return (
    <svg ref={svgRef} viewBox={viewBox} style={style}
         onMouseMove={handleMove} onClick={handleClick} onContextMenu={handleContext}>
      <rect x={O.x} y={O.y} width={W} height={H} fill="rgba(244,237,224,0.65)" stroke="none" />
      {showGrid && Array.from({ length: base.w - 1 }).map((_, i) =>
        <line key={`vx-${i}`} x1={O.x + (i + 1) * TOPSTEP} y1={O.y} x2={O.x + (i + 1) * TOPSTEP} y2={O.y + H}
              stroke="#7a6b58" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.55" />
      )}
      {showGrid && Array.from({ length: base.d - 1 }).map((_, j) =>
        <line key={`hy-${j}`} x1={O.x} y1={O.y + (j + 1) * TOPSTEP} x2={O.x + W} y2={O.y + (j + 1) * TOPSTEP}
              stroke="#7a6b58" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.55" />
      )}
      <rect x={O.x} y={O.y} width={W} height={H} fill="none" stroke="#1f1d1a" strokeWidth="1.8" />
      {/* World-relative labels (same convention as iso): "A1" always = world (0,0).
          For top-down at a rotated view, we project each world cell's label through
          rotPoint so it lands at the *visually* correct edge of the rotated baseplate. */}
      {showGrid && Array.from({ length: baseSize.w }).map((_, i) => {
        const r = rotPoint(i + 0.5, -0.7, view, baseSize);
        return <text key={`cl-${i}`} x={O.x + r.x * TOPSTEP} y={O.y + r.y * TOPSTEP + 4}
              fontFamily="Patrick Hand" fontSize="14" fontWeight="700" textAnchor="middle"
              fill="#3a2f24" style={{ pointerEvents: 'none', paintOrder: 'stroke' }}
              stroke="rgba(244,237,224,0.92)" strokeWidth="3">{colLabel(i)}</text>;
      })}
      {showGrid && Array.from({ length: baseSize.d }).map((_, j) => {
        const r = rotPoint(-0.7, j + 0.5, view, baseSize);
        return <text key={`rl-${j}`} x={O.x + r.x * TOPSTEP} y={O.y + r.y * TOPSTEP + 4}
              fontFamily="Patrick Hand" fontSize="14" fontWeight="700" textAnchor="middle"
              fill="#3a2f24" style={{ pointerEvents: 'none', paintOrder: 'stroke' }}
              stroke="rgba(244,237,224,0.92)" strokeWidth="3">{j + 1}</text>;
      })}
      {rotatedBricks.map(b => (
        <TopBrick key={b._origId || b.id} brick={b} origin={O}
                  selected={selectedId === (b._origId || b.id)} />
      ))}
      {rotatedGhost && <TopBrick brick={rotatedGhost} origin={O} ghost />}
    </svg>
  );
}

function computeTopViewBox(baseSize) {
  const padX = 36, padY = 40;
  const W = baseSize.w * TOPSTEP, H = baseSize.d * TOPSTEP;
  return `${-padX} ${-padY} ${W + 2 * padX} ${H + padY + padX}`;
}

Object.assign(window, {
  ISO, TOPSTEP, COLORS, COLOR_ORDER, PIECE_TYPES, darken, iso, unproject,
  effSize, brickGeometry, studPositions, paintOrder,
  pickGroundCell, topZAt, pickBrick, svgPoint, colorHex,
  applyView, viewedBaseSize, invView, rotPoint, colLabel,
  pickTopCell, pickTopBrick, computeTopViewBox, computeIsoViewBox,
  BrickShape, IsoScene, TopDownScene,
});
