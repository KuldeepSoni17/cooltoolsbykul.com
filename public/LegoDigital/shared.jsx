// Shared sketchy primitives for wireframes.
const { useState, useRef, useEffect } = React;

// A small "Lego brick" rendered top-down (studs on top)
function Brick({ w = 2, h = 1, color = 'var(--lego-red)', studColor = 'rgba(255,255,255,0.55)', scale = 12, label, style }) {
  const studs = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      studs.push(
        <div key={`${x}-${y}`} style={{
          position: 'absolute',
          left: `${(x + 0.5) * scale - 4}px`,
          top: `${(y + 0.5) * scale - 4}px`,
          width: 8, height: 8,
          borderRadius: '50%',
          background: studColor,
          border: '1.5px solid var(--ink)',
        }} />
      );
    }
  }
  return (
    <div style={{
      width: w * scale, height: h * scale,
      background: color,
      border: '2px solid var(--ink)',
      borderRadius: '3px 4px 3px 4px',
      position: 'relative',
      boxShadow: 'var(--shadow-sm)',
      display: 'inline-block',
      ...style,
    }}>
      {studs}
      {label && <div style={{
        position: 'absolute', left: '50%', top: '100%',
        transform: 'translate(-50%, 4px)',
        fontFamily: 'Kalam', fontSize: 11,
        color: 'var(--ink-faded)', whiteSpace: 'nowrap',
      }}>{label}</div>}
    </div>
  );
}

// Iso brick (side view, faux-3D)
function IsoBrick({ w = 2, h = 1, depth = 1, color = 'var(--lego-red)', x = 0, y = 0, scale = 24 }) {
  const W = w * scale, D = depth * scale, H = h * scale * 0.6;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* top */}
      <polygon points={`0,${H} ${W},${H + W*0.25} ${W+D*0.7},${H - D*0.4} ${D*0.7},${-D*0.4}`}
        fill={color} stroke="var(--ink)" strokeWidth="1.5" />
      {/* front */}
      <polygon points={`0,${H} ${W},${H + W*0.25} ${W},${H + W*0.25 + H*0.8} 0,${H + H*0.8}`}
        fill={color} stroke="var(--ink)" strokeWidth="1.5" opacity="0.85" />
      {/* side */}
      <polygon points={`${W},${H + W*0.25} ${W+D*0.7},${H - D*0.4} ${W+D*0.7},${H - D*0.4 + H*0.8} ${W},${H + W*0.25 + H*0.8}`}
        fill={color} stroke="var(--ink)" strokeWidth="1.5" opacity="0.65" />
      {/* studs */}
      {Array.from({length: w}).map((_, i) =>
        Array.from({length: depth}).map((_, j) => {
          const cx = (i + 0.5) * scale + (j + 0.5) * 0.7 * (scale/depth || 0);
          // simpler: just place studs along top
          const sx = (i + 0.5) * scale + j * (D / depth) * 0.7;
          const sy = H + (i+0.5)*0 - (j+0.5) * (D / depth) * 0.4 + (i)*0;
          return null;
        })
      )}
    </g>
  );
}

// Curved hand-drawn arrow with text
function SketchArrow({ from, to, text, color = 'var(--lego-red)', flip = false, style }) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const mx = (from.x + to.x) / 2 + (flip ? -dy * 0.25 : dy * 0.25);
  const my = (from.y + to.y) / 2 + (flip ? dx * 0.25 : -dx * 0.25);
  const minX = Math.min(from.x, to.x, mx) - 40;
  const minY = Math.min(from.y, to.y, my) - 30;
  const maxX = Math.max(from.x, to.x, mx) + 80;
  const maxY = Math.max(from.y, to.y, my) + 40;
  const w = maxX - minX, h = maxY - minY;
  return (
    <svg style={{ position: 'absolute', left: minX, top: minY, width: w, height: h, pointerEvents: 'none', overflow: 'visible', ...style }}>
      <path d={`M ${from.x - minX} ${from.y - minY} Q ${mx - minX} ${my - minY} ${to.x - minX} ${to.y - minY}`}
        fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" markerEnd="url(#arrow-head)" />
      <defs>
        <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
      </defs>
      {text && <text x={mx - minX} y={my - minY - 6}
        fontFamily="Caveat" fontSize="20" fontWeight="700" fill={color}
        textAnchor="middle">{text}</text>}
    </svg>
  );
}

// A stud grid (for top-down baseplates)
function StudGrid({ cols = 16, rows = 12, size = 18, color = 'var(--lego-green)', accent }) {
  const studs = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      studs.push(<circle key={`${x}-${y}`} cx={(x + 0.5) * size} cy={(y + 0.5) * size} r="2.5"
        fill="rgba(255,255,255,0.5)" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />);
    }
  }
  return (
    <svg width={cols * size} height={rows * size} style={{ display: 'block' }}>
      <rect x="0" y="0" width={cols * size} height={rows * size} fill={color} stroke="var(--ink)" strokeWidth="2" />
      {studs}
      {accent}
    </svg>
  );
}

// "Hand drawn" wobbly rect
function WobblyRect({ width, height, fill = 'none', stroke = 'var(--ink)', strokeWidth = 2, style }) {
  // Generate wobbly path
  const pts = [];
  const sides = [
    { from: [0, 0], to: [width, 0], steps: 8 },
    { from: [width, 0], to: [width, height], steps: 6 },
    { from: [width, height], to: [0, height], steps: 8 },
    { from: [0, height], to: [0, 0], steps: 6 },
  ];
  let d = '';
  sides.forEach((s, i) => {
    const [fx, fy] = s.from, [tx, ty] = s.to;
    if (i === 0) d += `M ${fx} ${fy} `;
    for (let k = 1; k <= s.steps; k++) {
      const t = k / s.steps;
      const x = fx + (tx - fx) * t + (Math.sin(t * 12 + i) * 0.6);
      const y = fy + (ty - fy) * t + (Math.cos(t * 8 + i) * 0.6);
      d += `L ${x} ${y} `;
    }
  });
  d += 'Z';
  return (
    <svg width={width} height={height} style={style}>
      <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

// Annotation note (sticky-note style)
function StickyNote({ children, color = 'var(--lego-yellow)', rotation = -3, style }) {
  return (
    <div style={{
      background: color,
      border: '2px solid var(--ink)',
      padding: '8px 12px',
      fontFamily: 'Caveat, cursive',
      fontSize: 17,
      fontWeight: 600,
      boxShadow: '2px 3px 0 rgba(31,29,26,0.5)',
      transform: `rotate(${rotation}deg)`,
      borderRadius: '4px 7px 5px 6px',
      maxWidth: 220,
      display: 'inline-block',
      ...style,
    }}>{children}</div>
  );
}

// Small iso 3D-render of a model -- abstracted as stacked iso bricks
function IsoModelScene({ children, width = 360, height = 240 }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {/* baseplate */}
      <g transform={`translate(${width/2}, ${height*0.75})`}>
        <polygon points="-160,0 0,-50 160,0 0,50" fill="var(--lego-green)" stroke="var(--ink)" strokeWidth="2" opacity="0.85" />
        {/* baseplate studs */}
        {Array.from({length: 7}).map((_, i) =>
          Array.from({length: 5}).map((_, j) => {
            const u = (i - 3) * 22, v = (j - 2) * 14;
            return <ellipse key={`${i}-${j}`} cx={u} cy={v - u * 0.31} rx="3" ry="1.5"
              fill="rgba(255,255,255,0.4)" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />;
          })
        )}
      </g>
      {children}
    </svg>
  );
}

// A primitive iso block at unit coords
function IsoBlock({ ix = 0, iy = 0, iz = 0, w = 1, d = 1, h = 1, color = 'var(--lego-red)', cx = 180, cy = 180, ux = 24, uy = 16, uh = 18 }) {
  // ix increases to right-up, iy increases to left-up, iz vertical
  const ox = cx + (ix - iy) * ux - w * ux + d * ux;
  const oy = cy - (ix + iy) * uy - iz * uh;
  // simpler: compute corner
  const x0 = cx + (ix * ux) - (iy * ux);
  const y0 = cy - (ix * uy) - (iy * uy) - (iz * uh);
  const W = w * ux, D = d * ux, H = h * uh;
  // Top face: parallelogram
  const top = [
    [x0, y0],
    [x0 + W, y0 - W * (uy/ux)],
    [x0 + W - D, y0 - W * (uy/ux) - D * (uy/ux)],
    [x0 - D, y0 - D * (uy/ux)],
  ];
  // Front face
  const front = [
    [x0, y0],
    [x0 + W, y0 - W * (uy/ux)],
    [x0 + W, y0 - W * (uy/ux) + H],
    [x0, y0 + H],
  ];
  // Right face
  const right = [
    [x0 + W, y0 - W * (uy/ux)],
    [x0 + W - D, y0 - W * (uy/ux) - D * (uy/ux)],
    [x0 + W - D, y0 - W * (uy/ux) - D * (uy/ux) + H],
    [x0 + W, y0 - W * (uy/ux) + H],
  ];
  const toStr = pts => pts.map(p => p.join(',')).join(' ');

  // stud positions on top
  const studs = [];
  for (let sx = 0; sx < w; sx++) {
    for (let sy = 0; sy < d; sy++) {
      const sx0 = x0 - (sy + 0.5) * (ux) + (sx + 0.5) * ux;
      const sy0 = y0 - (sx + 0.5) * uy - (sy + 0.5) * uy;
      studs.push(<ellipse key={`${sx}-${sy}`} cx={sx0} cy={sy0} rx="4" ry="2"
        fill={color} stroke="var(--ink)" strokeWidth="1" />);
    }
  }
  return (
    <g>
      <polygon points={toStr(front)} fill={color} stroke="var(--ink)" strokeWidth="1.5" opacity="0.85" />
      <polygon points={toStr(right)} fill={color} stroke="var(--ink)" strokeWidth="1.5" opacity="0.6" />
      <polygon points={toStr(top)} fill={color} stroke="var(--ink)" strokeWidth="1.5" />
      {studs}
    </g>
  );
}

Object.assign(window, { Brick, IsoBrick, SketchArrow, StudGrid, WobblyRect, StickyNote, IsoModelScene, IsoBlock });
