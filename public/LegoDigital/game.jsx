// ====== LegoDigital — main game ======
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Piece palette: basic bricks + tiles + specials. Each entry is one click-to-pick item.
const PIECE_PALETTE = [
  // Bricks
  { key: '1x1',     w: 1, d: 1, label: '1×1',     type: 'brick', cat: 'bricks' },
  { key: '1x2',     w: 1, d: 2, label: '1×2',     type: 'brick', cat: 'bricks' },
  { key: '1x3',     w: 1, d: 3, label: '1×3',     type: 'brick', cat: 'bricks' },
  { key: '1x4',     w: 1, d: 4, label: '1×4',     type: 'brick', cat: 'bricks' },
  { key: '2x2',     w: 2, d: 2, label: '2×2',     type: 'brick', cat: 'bricks' },
  { key: '2x3',     w: 2, d: 3, label: '2×3',     type: 'brick', cat: 'bricks' },
  { key: '2x4',     w: 2, d: 4, label: '2×4',     type: 'brick', cat: 'bricks' },
  { key: '2x6',     w: 2, d: 6, label: '2×6',     type: 'brick', cat: 'bricks' },
  { key: '4x4',     w: 4, d: 4, label: '4×4',     type: 'brick', cat: 'bricks' },
  // Tiles (no studs on top)
  { key: 't1x1',    w: 1, d: 1, label: 'tile 1×1', type: 'tile',  cat: 'tiles' },
  { key: 't2x2',    w: 2, d: 2, label: 'tile 2×2', type: 'tile',  cat: 'tiles' },
  { key: 't2x4',    w: 2, d: 4, label: 'tile 2×4', type: 'tile',  cat: 'tiles' },
  // Slopes
  { key: 'slS',     w: 1, d: 2, label: 'slope ↑', type: 'slope', slopeDir: 'S', cat: 'slopes' },
  { key: 'slE',     w: 2, d: 1, label: 'slope →', type: 'slope', slopeDir: 'E', cat: 'slopes' },
  { key: 'slN',     w: 1, d: 2, label: 'slope ↓', type: 'slope', slopeDir: 'N', cat: 'slopes' },
  { key: 'slW',     w: 2, d: 1, label: 'slope ←', type: 'slope', slopeDir: 'W', cat: 'slopes' },
  // Specials
  { key: 'wheel',   w: 1, d: 1, label: 'wheel',   type: 'wheel',    cat: 'specials' },
  { key: 'cone1',   w: 1, d: 1, label: 'cone 1×1', type: 'cone',    cat: 'specials', h: 2 },
  { key: 'cone2',   w: 2, d: 2, label: 'cone 2×2', type: 'cone',    cat: 'specials', h: 2 },
  { key: 'cyl',     w: 1, d: 1, label: 'cylinder', type: 'cylinder', cat: 'specials' },
  { key: 'win',     w: 1, d: 1, label: 'window',   type: 'window',   cat: 'specials' },
  { key: 'door',    w: 1, d: 1, label: 'door',     type: 'door',     cat: 'specials', h: 2 },
  { key: 'fig',     w: 1, d: 1, label: 'minifig',  type: 'minifig',  cat: 'specials', h: 2 },
];
const PALETTE_CATS = ['bricks', 'tiles', 'slopes', 'specials'];

const SANDBOX_BASE = { w: 20, d: 16 };

// Helpers
function computeViewBox(baseSize, maxZ = 10) {
  const padX = 60, padY = 60;
  const W = baseSize.w, D = baseSize.d;
  const left = -D * ISO.TW - padX;
  const right = W * ISO.TW + padX;
  const top = -maxZ * ISO.UH - padY;
  const bottom = (W + D) * ISO.TH + padY;
  return `${left} ${top} ${right - left} ${bottom - top}`;
}

// Download a JS object as a JSON file
function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// ============================================================
// Camera control component
// ============================================================
function CameraControls({ view, setView, zoom, setZoom, hideAboveZ, setHideAboveZ, maxZ, showGrid, setShowGrid, topView, setTopView }) {
  return (
    <div className="vp-camera">
      <div className="cam-orbit">
        <button className="sk-btn sm" title="orbit left" onClick={() => setView((view + 3) % 4)} disabled={topView}>↺</button>
        <span className="sk-label tiny" style={{ minWidth: 56, textAlign: 'center' }}>
          {topView ? 'top-down' : `view ${view * 90}°`}
        </span>
        <button className="sk-btn sm" title="orbit right" onClick={() => setView((view + 1) % 4)} disabled={topView}>↻</button>
      </div>
      {setTopView && (
        <div className="cam-mode">
          <button className={`sk-btn sm ${!topView ? 'on' : ''}`}
                  onClick={() => setTopView(false)}
                  style={!topView ? { background: 'var(--lego-yellow)' } : null}>iso</button>
          <button className={`sk-btn sm ${topView ? 'on' : ''}`}
                  onClick={() => setTopView(true)}
                  style={topView ? { background: 'var(--lego-yellow)' } : null}>top</button>
        </div>
      )}
      <div className="cam-zoom">
        <button className="sk-btn sm" onClick={() => setZoom(z => Math.max(0.4, z / 1.2))}>−</button>
        <span className="sk-label tiny" style={{ minWidth: 36, textAlign: 'center' }}>{zoom.toFixed(1)}×</span>
        <button className="sk-btn sm" onClick={() => setZoom(z => Math.min(2.5, z * 1.2))}>+</button>
        <button className="sk-btn sm" onClick={() => setZoom(1)}>⌂</button>
      </div>
      {setShowGrid && (
        <div className="cam-grid">
          <button className={`sk-btn sm ${showGrid ? 'on' : ''}`}
                  title="show/hide A1 grid coordinates"
                  onClick={() => setShowGrid(g => !g)}
                  style={showGrid ? { background: 'var(--lego-yellow)' } : null}>
            A1 grid {showGrid ? 'on' : 'off'}
          </button>
        </div>
      )}
      {setHideAboveZ && (
        <div className="cam-layer">
          <span className="sk-label tiny">layer ≤</span>
          <input type="range" min="1" max={maxZ + 1} value={hideAboveZ ?? maxZ + 1}
                 onChange={e => setHideAboveZ(parseInt(e.target.value, 10))} />
          <span className="sk-label tiny">{hideAboveZ ?? '∞'}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Build-instructions panel: derives chess-style steps from any brick list
// ============================================================
function describeBrick(b) {
  const col = colLabel(b.x);
  const row = b.y + 1;
  const sizeStr = `${b.w}×${b.d}` + ((b.h ?? 1) !== 1 ? `×${b.h}` : '');
  const typeStr = b.type && b.type !== 'brick' ? b.type : 'brick';
  return { col, row, sizeStr, typeStr, color: b.color };
}

function InstructionsPanel({ bricks, onClose }) {
  const sorted = React.useMemo(() => {
    return [...bricks].sort((a, b) => {
      if (a.z !== b.z) return a.z - b.z;
      if ((a.x + a.y) !== (b.x + b.y)) return (a.x + a.y) - (b.x + b.y);
      return a.x - b.x;
    });
  }, [bricks]);

  const text = React.useMemo(() => {
    return sorted.map((b, i) => {
      const d = describeBrick(b);
      const zStr = b.z > 0 ? `, layer ${b.z + 1}` : '';
      return `${i + 1}. Pick a ${d.sizeStr} ${d.color} ${d.typeStr} — place at ${d.col}${d.row}${zStr}`;
    }).join('\n');
  }, [sorted]);

  const copy = () => {
    navigator.clipboard?.writeText(text).then(
      () => alert('Instructions copied to clipboard'),
      () => alert('Could not copy — select and Ctrl/⌘+C from the panel instead.')
    );
  };

  return (
    <div className="instructions-modal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="instructions-modal-card">
        <div className="instructions-modal-head">
          <h3>Build instructions</h3>
          <span className="sk-label tiny">{sorted.length} pieces · sorted bottom-up</span>
          <span style={{ flex: 1 }} />
          <button className="sk-btn sm" onClick={copy}>📋 copy</button>
          <button className="sk-btn sm" onClick={onClose}>✕ close</button>
        </div>
        <div className="instructions-modal-body">
          {sorted.length === 0 ? (
            <div className="sk-label tiny">No pieces placed yet — drop a brick on the baseplate and come back!</div>
          ) : (
            <ol className="instr-list">
              {sorted.map((b, i) => {
                const d = describeBrick(b);
                return (
                  <li key={b.id || i}>
                    Pick a <b>{d.sizeStr} {d.color} {d.typeStr}</b> — place at <b>{d.col}{d.row}</b>
                    {b.z > 0 && <span className="sk-label tiny"> · layer {b.z + 1}</span>}
                    <span className="instr-preview">
                      <PiecePreview piece={{ w: b.w, d: b.d, h: b.h, type: b.type || 'brick', slopeDir: b.slopeDir }} color={b.color} />
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
        <div className="instructions-modal-foot sk-label tiny">
          Coords use A1 chess notation: A-Z columns (X), 1-N rows (Y). z=0 is the baseplate.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sandbox mode
// ============================================================
function SandboxScreen({ initialBricks = [], initialBase = SANDBOX_BASE, onExit, setName = 'untitled' }) {
  const [bricks, setBricks] = useState(initialBricks);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [baseSize, setBaseSize] = useState(initialBase);
  const [paletteCat, setPaletteCat] = useState('bricks');
  const [selectedPiece, setSelectedPiece] = useState(0);
  const [color, setColor] = useState('red');
  const [tool, setTool] = useState('place');
  const [rot, setRot] = useState(0);
  const [view, setView] = useState(0);
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [hideAboveZ, setHideAboveZ] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [topView, setTopView] = useState(false);
  const idRef = useRef(1);
  const fileInputRef = useRef(null);

  // Persist
  useEffect(() => {
    if (initialBricks.length > 0) return;
    const saved = localStorage.getItem('legodigital:sandbox');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data.bricks)) {
        setBricks(data.bricks);
        if (data.baseSize) setBaseSize(data.baseSize);
        let maxId = 0;
        data.bricks.forEach(b => {
          const m = parseInt(String(b.id).replace(/\D/g, ''), 10);
          if (!isNaN(m)) maxId = Math.max(maxId, m);
        });
        idRef.current = maxId + 1;
      }
    } catch (e) { /* ignore */ }
  }, []); // eslint-disable-line

  useEffect(() => {
    localStorage.setItem('legodigital:sandbox', JSON.stringify({ bricks, baseSize, savedAt: Date.now() }));
  }, [bricks, baseSize]);

  // Filter palette
  const visiblePalette = useMemo(() => PIECE_PALETTE.filter(p => p.cat === paletteCat), [paletteCat]);

  // Ensure selectedPiece is valid for current category
  useEffect(() => {
    if (selectedPiece >= visiblePalette.length) setSelectedPiece(0);
  }, [paletteCat, visiblePalette.length, selectedPiece]);

  const piece = visiblePalette[selectedPiece] || PIECE_PALETTE[0];
  const efW = rot ? piece.d : piece.w;
  const efD = rot ? piece.w : piece.d;

  const pushHistory = () => {
    setHistory(h => [...h, bricks].slice(-50));
    setFuture([]);
  };
  const doUndo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture(f => [bricks, ...f].slice(0, 50));
      setBricks(prev);
      return h.slice(0, -1);
    });
  };
  const doRedo = () => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory(h => [...h, bricks].slice(-50));
      setBricks(next);
      return f.slice(1);
    });
  };

  const doDelete = (b) => {
    pushHistory();
    setBricks(bs => bs.filter(x => x.id !== b.id));
    setSelected(null);
  };
  const doPaint = (b) => {
    pushHistory();
    setBricks(bs => bs.map(x => x.id === b.id ? { ...x, color } : x));
  };

  // Maps mouse cell (in current view) to placement params in original world
  function computePlacement(rotCell) {
    const rotBase = viewedBaseSize(baseSize, view);
    let rgx = rotCell.x, rgy = rotCell.y;
    if (rgx + efW > rotBase.w) rgx = rotBase.w - efW;
    if (rgy + efD > rotBase.d) rgy = rotBase.d - efD;
    if (rgx < 0 || rgy < 0) return null;
    const orig = invView(rgx, rgy, efW, efD, view, baseSize);
    const z = topZAt(bricks, orig.x, orig.y, orig.w, orig.d);
    return { ...orig, z };
  }

  // Pick the ground cell at a click in whichever scene mode we're in.
  function cellAt(sx, sy) {
    const rotBase = viewedBaseSize(baseSize, view);
    return topView ? pickTopCell(sx, sy, { x: 0, y: 0 }, rotBase)
                   : pickGroundCell(sx, sy, { x: 0, y: 0 }, rotBase);
  }
  function brickAt(sx, sy) {
    const rotatedBricks = bricks.map(b => ({ ...applyView(b, view, baseSize), _origId: b.id }));
    return topView ? pickTopBrick(sx, sy, rotatedBricks, { x: 0, y: 0 })
                   : pickBrick(sx, sy, rotatedBricks, { x: 0, y: 0 });
  }

  const onPointerMove = ({ sx, sy }) => {
    if (tool === 'place') {
      const cell = cellAt(sx, sy);
      if (!cell) { setHover(null); return; }
      const plc = computePlacement(cell);
      if (!plc) { setHover(null); return; }
      setHover({
        x: plc.x, y: plc.y, z: plc.z, w: plc.w, d: plc.d,
        color, h: piece.h ?? 1, type: piece.type, slopeDir: piece.slopeDir,
        id: '__ghost',
      });
    } else {
      const target = brickAt(sx, sy);
      if (target) {
        const orig = bricks.find(b => b.id === target._origId);
        setHover(orig ? { ...orig, _hover: true } : null);
      } else setHover(null);
    }
  };

  const onSceneClick = ({ sx, sy }) => {
    if (tool === 'place') {
      const cell = cellAt(sx, sy);
      if (!cell) return;
      const plc = computePlacement(cell);
      if (!plc) return;
      pushHistory();
      const nb = {
        x: plc.x, y: plc.y, z: plc.z, w: plc.w, d: plc.d,
        color, h: piece.h ?? 1, type: piece.type, slopeDir: piece.slopeDir,
        id: `sb-${idRef.current++}`,
      };
      setBricks(bs => [...bs, nb]);
    } else {
      const target = brickAt(sx, sy);
      if (!target) { setSelected(null); return; }
      const orig = bricks.find(b => b.id === target._origId);
      if (!orig) return;
      if (tool === 'select') setSelected(orig);
      else if (tool === 'delete') doDelete(orig);
      else if (tool === 'paint') doPaint(orig);
    }
  };

  const onSceneContext = ({ sx, sy }) => {
    const target = brickAt(sx, sy);
    if (!target) return;
    const orig = bricks.find(b => b.id === target._origId);
    if (orig) doDelete(orig);
  };

  const clearAll = () => {
    if (!window.confirm('Clear the entire build?')) return;
    pushHistory();
    setBricks([]);
    setSelected(null);
  };

  // Keyboard
  useEffect(() => {
    const handler = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') setRot(r => r ? 0 : 1);
      if (e.key === 'Delete' && selected) doDelete(selected);
      if (e.key === 'p' || e.key === 'P') setTool('place');
      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'b' || e.key === 'B') setTool('paint');
      if (e.key === 'd' || e.key === 'D') setTool('delete');
      if (e.key === 'q' || e.key === 'Q') setView(v => (v + 3) % 4);
      if (e.key === 'e' || e.key === 'E') setView(v => (v + 1) % 4);
      if ((e.key === 'z' || e.key === 'Z') && (e.metaKey || e.ctrlKey)) {
        if (e.shiftKey) doRedo(); else doUndo();
      }
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < visiblePalette.length) setSelectedPiece(idx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, bricks, visiblePalette.length]); // eslint-disable-line

  // Download / upload
  const handleDownload = () => {
    const payload = {
      format: 'LegoDigital.v1',
      name: setName || 'untitled',
      baseSize, bricks,
      savedAt: new Date().toISOString(),
    };
    downloadJSON(payload, `${(setName || 'untitled').replace(/[^a-z0-9_-]/gi, '_')}.lego.json`);
  };
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleUploadFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.bricks)) throw new Error('No bricks array');
        pushHistory();
        setBricks(data.bricks.map((b, i) => ({ ...b, id: b.id || `up-${i}` })));
        if (data.baseSize) setBaseSize(data.baseSize);
        let maxId = 0;
        data.bricks.forEach(b => {
          const m = parseInt(String(b.id || '').replace(/\D/g, ''), 10);
          if (!isNaN(m)) maxId = Math.max(maxId, m);
        });
        idRef.current = maxId + 1;
        alert(`Loaded ${data.bricks.length} bricks from ${file.name}`);
      } catch (err) {
        alert('Could not load file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const maxZ = useMemo(() => bricks.reduce((m, b) => Math.max(m, b.z + (b.h ?? 1)), 6), [bricks]);
  const isoVB = computeViewBox(viewedBaseSize(baseSize, view), Math.max(maxZ, 6) / zoom);
  const topVB = computeTopViewBox(viewedBaseSize(baseSize, view));
  const viewBox = topView ? topVB : isoVB;

  // Live ghost-info string for the HUD
  const ghostInfo = (tool === 'place' && hover && !hover._hover) ? {
    coord: `${colLabel(hover.x)}${hover.y + 1}`,
    layer: hover.z + 1,
    piece: `${piece.w}×${piece.d}${piece.h && piece.h > 1 ? `×${piece.h}` : ''} ${color} ${piece.type === 'brick' ? 'brick' : piece.type}`,
  } : null;

  return (
    <div className="game-frame">
      <div className="game-top">
        <button className="sk-btn sm" onClick={onExit}>← back to library</button>
        <span className="file-name">~/builds/{setName}.lego</span>
        <span style={{ flex: 1 }} />
        <button className="sk-btn sm" onClick={doUndo} disabled={!history.length}>↶ undo</button>
        <button className="sk-btn sm" onClick={doRedo} disabled={!future.length}>↷ redo</button>
        <button className="sk-btn sm" onClick={() => setShowInstructions(true)}>📋 instructions</button>
        <button className="sk-btn sm" onClick={handleUploadClick}>⤒ upload</button>
        <button className="sk-btn sm" onClick={handleDownload}>⤓ download</button>
        <button className="sk-btn sm" onClick={clearAll}>✕ clear</button>
        <span className="sk-label tiny" style={{ marginLeft: 8 }}>{bricks.length} pcs</span>
        <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleUploadFile} />
      </div>

      <div className="game-body sandbox-grid">
        {/* Tool rail */}
        <div className="tool-rail">
          {[
            { id: 'place',  icon: '✚', label: 'place' },
            { id: 'select', icon: '✥', label: 'select' },
            { id: 'paint',  icon: '🪣', label: 'paint' },
            { id: 'delete', icon: '⌫', label: 'delete' },
          ].map(t => (
            <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={`tool ${tool === t.id ? 'on' : ''}`} onClick={() => setTool(t.id)} title={t.label}>{t.icon}</div>
              <div className="tool-label">{t.label}</div>
            </div>
          ))}
          <div style={{ height: 10 }} />
          <div className={`tool ${rot ? 'on' : ''}`} onClick={() => setRot(r => r ? 0 : 1)} title="rotate piece (R)">↻</div>
          <div className="tool-label">R rot</div>
        </div>

        {/* Viewport */}
        <div className="viewport" style={{ position: 'relative' }}>
          <div className="vp-hud">
            tool: <b>{tool}</b> · piece: <b>{piece.label}{rot ? ' (R)' : ''}</b> · {topView ? 'top-down' : `view ${view * 90}°`} · zoom {zoom.toFixed(1)}×
          </div>
          {ghostInfo && (
            <div className="ghost-hud">
              <span className="ghost-hud-label">Next →</span>
              <span className="ghost-hud-coord">{ghostInfo.coord}</span>
              <span className="ghost-hud-layer">layer {ghostInfo.layer}</span>
              <span className="ghost-hud-piece">{ghostInfo.piece}</span>
            </div>
          )}
          <CameraControls view={view} setView={setView}
            zoom={zoom} setZoom={setZoom}
            hideAboveZ={hideAboveZ} setHideAboveZ={setHideAboveZ} maxZ={maxZ}
            showGrid={showGrid} setShowGrid={setShowGrid}
            topView={topView} setTopView={setTopView} />
          {topView ? (
            <TopDownScene
              bricks={bricks}
              baseSize={baseSize}
              origin={{ x: 0, y: 0 }}
              view={view}
              ghost={tool === 'place' ? hover : null}
              selectedId={selected ? selected.id : (hover && hover._hover ? hover.id : null)}
              viewBox={viewBox}
              style={{ width: '100%', height: '100%', display: 'block', cursor: tool === 'place' ? 'crosshair' : 'default' }}
              onPointerMove={onPointerMove}
              onSceneClick={onSceneClick}
              onSceneContext={onSceneContext}
              hideAboveZ={hideAboveZ}
              showGrid={showGrid}
            />
          ) : (
            <IsoScene
              bricks={bricks}
              baseSize={baseSize}
              origin={{ x: 0, y: 0 }}
              view={view}
              ghost={tool === 'place' ? hover : null}
              selectedId={selected ? selected.id : (hover && hover._hover ? hover.id : null)}
              viewBox={viewBox}
              style={{ width: '100%', height: '100%', display: 'block', cursor: tool === 'place' ? 'crosshair' : 'default' }}
              onPointerMove={onPointerMove}
              onSceneClick={onSceneClick}
              onSceneContext={onSceneContext}
              hideAboveZ={hideAboveZ}
              showGrid={showGrid}
            />
          )}
        </div>

        {/* Inspector */}
        <div className="inspector">
          <h3>Inspector</h3>
          {selected ? (
            <>
              <div className="sk-label tiny">
                <b>{selected.type || 'brick'}</b> · {selected.w}×{selected.d}×{selected.h ?? 1} · {selected.color}
              </div>
              <div className="sk-box thin" style={{ padding: 8 }}>
                <div className="row"><span>X</span><b>{selected.x}</b></div>
                <div className="row"><span>Y</span><b>{selected.y}</b></div>
                <div className="row"><span>Z</span><b>{selected.z}</b></div>
                {selected.slopeDir && <div className="row"><span>slope</span><b>{selected.slopeDir}</b></div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="sk-btn sm" onClick={() => doPaint(selected)}>recolor</button>
                <button className="sk-btn sm danger" onClick={() => doDelete(selected)}>delete</button>
              </div>
            </>
          ) : (
            <div className="sk-label tiny">click a brick to inspect</div>
          )}

          <hr className="sk-divider" />

          <div>
            <div className="sk-label">Color</div>
            <div className="swatch-row" style={{ marginTop: 6 }}>
              {COLOR_ORDER.map(c =>
                <div key={c} className={`swatch ${color === c ? 'on' : ''}`}
                  style={{ background: COLORS[c] }} title={c}
                  onClick={() => setColor(c)} />
              )}
            </div>
            <div className="sk-label tiny" style={{ marginTop: 4 }}>{color}</div>
          </div>

          <hr className="sk-divider" />

          <div>
            <div className="sk-label">Shortcuts</div>
            <div className="sk-label tiny">
              1–9: piece · R: rotate · P/V/B/D: tools<br/>
              Q/E: orbit camera ←→<br/>
              ⌘Z undo · ⇧⌘Z redo<br/>
              right-click: delete brick
            </div>
          </div>
        </div>
      </div>

      {/* Piece palette */}
      <div className="palette">
        <div className="palette-tabs">
          {PALETTE_CATS.map(c =>
            <span key={c} className={`pt ${paletteCat === c ? 'on' : ''}`} onClick={() => setPaletteCat(c)}>
              {c}
            </span>
          )}
          <span style={{ marginLeft: 'auto', alignSelf: 'center', paddingRight: 14 }} className="sk-label tiny">
            click a piece to select it
          </span>
        </div>
        <div className="palette-bin">
          {visiblePalette.map((p, i) => (
            <div key={p.key} className={`item ${selectedPiece === i ? 'on' : ''}`}
                 onClick={() => { setSelectedPiece(i); setTool('place'); }}>
              <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PiecePreview piece={p} color={color} />
              </div>
              <div className="name">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {showInstructions && <InstructionsPanel bricks={bricks} onClose={() => setShowInstructions(false)} />}
    </div>
  );
}

// Small palette preview (renders a single piece via IsoScene)
function PiecePreview({ piece, color }) {
  const fake = {
    x: 0, y: 0, z: 0,
    w: piece.w, d: piece.d, h: piece.h ?? 1,
    color, type: piece.type, slopeDir: piece.slopeDir,
    id: 'preview',
  };
  const vbW = (piece.w + piece.d) * ISO.TW + 20;
  const vbH = (piece.w + piece.d) * ISO.TH + (piece.h ?? 1) * ISO.UH + 14;
  const ox = piece.d * ISO.TW + 8;
  const oy = (piece.h ?? 1) * ISO.UH + 4;
  return (
    <svg viewBox={`${-ox} ${-oy} ${vbW} ${vbH}`} width="60" height="36" style={{ overflow: 'visible' }}>
      <BrickShape brick={fake} origin={{ x: 0, y: 0 }} />
    </svg>
  );
}

// ============================================================
// Instructions mode
// ============================================================
function InstructionsScreen({ set, onExit, onSwitchToSandbox }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [topView, setTopView] = useState(false);
  const allBricks = useMemo(() => flattenSet(set), [set]);
  const totalSteps = set.steps.length;

  const placedBricks = useMemo(
    () => allBricks.filter(b => b.step < stepIdx),
    [allBricks, stepIdx]
  );
  const currentBricks = useMemo(
    () => allBricks.filter(b => b.step === stepIdx),
    [allBricks, stepIdx]
  );

  useEffect(() => {
    localStorage.setItem(`legodigital:progress:${set.id}`, String(stepIdx));
  }, [stepIdx, set.id]);
  useEffect(() => {
    const v = localStorage.getItem(`legodigital:progress:${set.id}`);
    if (v != null) {
      const n = parseInt(v, 10);
      if (!isNaN(n) && n <= totalSteps) setStepIdx(n);
    }
    // eslint-disable-next-line
  }, [set.id]);

  const next = () => setStepIdx(i => Math.min(totalSteps, i + 1));
  const prev = () => setStepIdx(i => Math.max(0, i - 1));

  const currentStep = stepIdx < totalSteps ? set.steps[stepIdx] : null;
  const progress = stepIdx / totalSteps;

  const maxZ = useMemo(() => allBricks.reduce((m, b) => Math.max(m, b.z + (b.h ?? 1)), 6), [allBricks]);
  const isoVB = computeViewBox(viewedBaseSize(set.baseSize, view), Math.max(maxZ, 6) / zoom);
  const topVB = computeTopViewBox(viewedBaseSize(set.baseSize, view));
  const viewBox = topView ? topVB : isoVB;

  const stepPieceSummary = useMemo(() => {
    if (!currentStep) return [];
    const map = new Map();
    currentStep.bricks.forEach(b => {
      const k = `${b.type || 'brick'}-${b.w}x${b.d}-${b.color}`;
      if (!map.has(k)) map.set(k, { type: b.type || 'brick', w: b.w, d: b.d, color: b.color, h: b.h ?? 1, slopeDir: b.slopeDir, count: 0 });
      map.get(k).count++;
    });
    return [...map.values()];
  }, [currentStep]);

  // Per-piece coord lines for this step, e.g. "Place 2×4 red brick at A2 (layer 1)"
  const stepCoords = useMemo(() => {
    if (!currentStep) return [];
    return currentStep.bricks.map(b => ({
      coord: `${colLabel(b.x)}${b.y + 1}`,
      layer: b.z + 1,
      sizeStr: `${b.w}×${b.d}${(b.h ?? 1) !== 1 ? `×${b.h}` : ''}`,
      typeStr: (b.type && b.type !== 'brick') ? b.type : 'brick',
      color: b.color,
    }));
  }, [currentStep]);

  const finished = stepIdx >= totalSteps;
  // Show placed + ghost-style preview of current step
  const sceneBricks = useMemo(() => [
    ...placedBricks,
    ...currentBricks.map(b => ({ ...b, color: 'yellow' /* highlight current step */, _ghost: true })),
  ], [placedBricks, currentBricks]);

  return (
    <div className="game-frame">
      <div className="game-top">
        <button className="sk-btn sm" onClick={onExit}>← back to library</button>
        <span className="file-name">{set.name} · step {Math.min(stepIdx + 1, totalSteps)} / {totalSteps}</span>
        <span style={{ flex: 1 }} />
        <button className="sk-btn sm" onClick={onSwitchToSandbox}>open in sandbox</button>
      </div>

      <div className="wf-toolbar" style={{ gap: 14 }}>
        <span className="sk-label" style={{ minWidth: 110 }}>Step {Math.min(stepIdx + 1, totalSteps)} / {totalSteps}</span>
        <div className="progress" style={{ flex: 1 }}>
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        <button className="sk-btn sm" onClick={() => setStepIdx(0)}>↺ restart</button>
        <button className="sk-btn sm" onClick={() => setStepIdx(totalSteps)}>⏭ skip to end</button>
      </div>

      <div className="game-body instructions-grid">
        <div className="step-panel">
          <h3>Steps</h3>
          <div className="step-list">
            {set.steps.map((s, i) => {
              const cls = i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'upcoming';
              return (
                <div key={i} className={`step ${cls}`} onClick={() => setStepIdx(i)}>
                  <span className="num">{i + 1}.</span>
                  <span>{s.name}</span>
                </div>
              );
            })}
            <div className={`step ${finished ? 'current' : 'upcoming'}`} onClick={() => setStepIdx(totalSteps)}>
              <span className="num">★</span>
              <span>Build complete!</span>
            </div>
          </div>
        </div>

        <div className="instruction-card">
          {currentStep ? (
            <>
              <div className="sk-label">Step {stepIdx + 1}</div>
              <h2 style={{ fontSize: 26, lineHeight: 1.05, marginTop: 4 }}>{currentStep.name}</h2>
              <p style={{ fontFamily: 'Kalam', fontWeight: 300, fontSize: 16, color: 'var(--ink-soft)', margin: '8px 0' }}>
                {currentStep.note}
              </p>

              <div className="sk-label" style={{ marginTop: 8 }}>Pieces for this step</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '8px 4px' }}>
                {stepPieceSummary.map((p, i) => (
                  <div key={i} style={{ textAlign: 'center', minWidth: 60 }}>
                    <PiecePreview piece={p} color={p.color} />
                    <div className="sk-label tiny" style={{ marginTop: 4 }}>
                      {p.type !== 'brick' ? `${p.type} ` : ''}{p.w}×{p.d} · ×{p.count}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sk-label" style={{ marginTop: 8 }}>Exact placements</div>
              <ol className="step-coords">
                {stepCoords.map((s, i) => (
                  <li key={i}>
                    Place <b>{s.sizeStr} {s.color} {s.typeStr}</b> at <b>{s.coord}</b>
                    {s.layer > 1 && <span className="sk-label tiny"> · layer {s.layer}</span>}
                  </li>
                ))}
              </ol>

              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button className="sk-btn" onClick={prev} disabled={stepIdx === 0}>← previous</button>
                <button className="sk-btn primary lg" onClick={next}>place + next →</button>
              </div>
              <div className="sk-label tiny" style={{ marginTop: 6 }}>
                Yellow ghost bricks show where this step's pieces go. Use orbit / top-down to look around.
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 36 }}>Done!</h2>
              <p style={{ fontFamily: 'Kalam', fontSize: 16 }}>
                You built the entire {set.name}.
              </p>
              <button className="sk-btn lg primary" onClick={onSwitchToSandbox}>open in sandbox</button>
            </>
          )}
        </div>

        <div className="viewport" style={{ position: 'relative' }}>
          <div className="vp-hud">live build · {placedBricks.length} of {allBricks.length} pieces placed</div>
          <CameraControls view={view} setView={setView} zoom={zoom} setZoom={setZoom} maxZ={maxZ}
                          showGrid={showGrid} setShowGrid={setShowGrid}
                          topView={topView} setTopView={setTopView} />
          {topView ? (
            <TopDownScene
              bricks={sceneBricks}
              baseSize={set.baseSize}
              origin={{ x: 0, y: 0 }}
              view={view}
              viewBox={viewBox}
              style={{ width: '100%', height: '100%', display: 'block' }}
              showGrid={showGrid}
            />
          ) : (
            <IsoScene
              bricks={sceneBricks}
              baseSize={set.baseSize}
              baseColor={set.baseColor}
              origin={{ x: 0, y: 0 }}
              view={view}
              viewBox={viewBox}
              style={{ width: '100%', height: '100%', display: 'block' }}
              showGrid={showGrid}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sets library home
// ============================================================
function HomeScreen({ onOpenSandbox, onOpenDetail }) {
  const setList = Object.values(SETS);
  const starters = setList.filter(s => s.starter);
  const hp = setList.filter(s => !s.starter);
  const savedBuild = (() => {
    try {
      const raw = localStorage.getItem('legodigital:sandbox');
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.bricks && data.bricks.length > 0) return data;
    } catch (e) {}
    return null;
  })();

  return (
    <div className="home">
      <div className="home-hero">
        <div>
          <h1 style={{ fontSize: 56, lineHeight: 1 }}>LegoDigital</h1>
          <div className="sk-label" style={{ marginTop: 6 }}>
            Snap virtual bricks. Build the wizarding world. Or whatever you want.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="sk-btn primary lg" onClick={() => onOpenSandbox({ fresh: true })}>+ New Sandbox</button>
          {savedBuild && (
            <button className="sk-btn" onClick={() => onOpenSandbox({ fresh: false })}>
              ↩ Resume last sandbox ({savedBuild.bricks.length} pcs)
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, margin: '24px 0 12px' }}>
        <h2 style={{ fontSize: 32 }}>Starter Builds</h2>
        <span className="sk-label tiny">{starters.length} quick builds · learn the basics</span>
      </div>
      <div className="set-grid">
        {starters.map(set => <SetCard key={set.id} set={set} onClick={() => onOpenDetail(set.id)} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, margin: '32px 0 12px' }}>
        <h2 style={{ fontSize: 32 }}>★ Harry Potter Playables</h2>
        <span className="sk-label tiny">{hp.length} builds · official sets</span>
      </div>
      <div className="set-grid">
        {hp.map(set => <SetCard key={set.id} set={set} onClick={() => onOpenDetail(set.id)} />)}
      </div>

      <div className="footnote" style={{ marginTop: 32 }}>
        ✎ A working Lego sandbox + 3 guided HP builds. Click a card to see the detail page, then either
        start the guided instructions or pop the model open in the sandbox. Sandbox supports orbit (Q/E),
        rotate piece (R), download/upload, and many piece types — wheels, cones, slopes, windows, doors, minifigs.
      </div>
    </div>
  );
}

function SetCard({ set, onClick }) {
  const previewBricks = useMemo(() => flattenSet(set), [set]);
  const maxZ = useMemo(() => previewBricks.reduce((m, b) => Math.max(m, b.z + (b.h ?? 1)), 4) + 2, [previewBricks]);
  const viewBox = computeViewBox(set.baseSize, maxZ);

  return (
    <div className="set-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="ribbon">{set.diff >= 4 ? 'Hero build' : 'Quick'}</div>
      <div className="thumb thumb-iso">
        <IsoScene
          bricks={previewBricks}
          baseSize={set.baseSize}
          baseColor={set.baseColor}
          origin={{ x: 0, y: 0 }}
          viewBox={viewBox}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="body">
        <h3>{set.name}</h3>
        <div className="sk-label tiny">{set.sub}</div>
        <div className="stats">
          <span>pieces · <b>{previewBricks.length}</b></span>
          <span>build · <b>{set.time}</b></span>
          <span>diff · <b>{'★'.repeat(set.diff)}{'☆'.repeat(5 - set.diff)}</b></span>
        </div>
        <div className="actions">
          <button className="sk-btn primary" onClick={e => { e.stopPropagation(); onClick(); }}>▶ Start Build</button>
          <span className="sk-label tiny" style={{ marginLeft: 'auto' }}>★ 4.{set.diff + 4}</span>
        </div>
      </div>
    </div>
  );
}

function SetDetail({ setId, onBack, onStartInstructions, onOpenInSandbox }) {
  const set = SETS[setId];
  const previewBricks = useMemo(() => flattenSet(set), [set]);
  const maxZ = useMemo(() => previewBricks.reduce((m, b) => Math.max(m, b.z + (b.h ?? 1)), 4) + 2, [previewBricks]);
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [topView, setTopView] = useState(false);
  const isoVB = computeViewBox(viewedBaseSize(set.baseSize, view), maxZ / zoom);
  const topVB = computeTopViewBox(viewedBaseSize(set.baseSize, view));
  const viewBox = topView ? topVB : isoVB;
  const progress = parseInt(localStorage.getItem(`legodigital:progress:${set.id}`) || '0', 10);

  return (
    <div className="detail-frame">
      <div className="game-top">
        <button className="sk-btn sm" onClick={onBack}>← back to library</button>
        <span className="file-name">{set.name}</span>
      </div>
      <div className="detail-body">
        <div className="detail-hero" style={{ position: 'relative' }}>
          <CameraControls view={view} setView={setView} zoom={zoom} setZoom={setZoom} maxZ={maxZ}
                          showGrid={showGrid} setShowGrid={setShowGrid}
                          topView={topView} setTopView={setTopView} />
          {topView ? (
            <TopDownScene
              bricks={previewBricks}
              baseSize={set.baseSize}
              origin={{ x: 0, y: 0 }}
              view={view}
              viewBox={viewBox}
              style={{ width: '100%', height: '100%' }}
              showGrid={showGrid}
            />
          ) : (
            <IsoScene
              bricks={previewBricks}
              baseSize={set.baseSize}
              baseColor={set.baseColor}
              origin={{ x: 0, y: 0 }}
              view={view}
              viewBox={viewBox}
              style={{ width: '100%', height: '100%' }}
              showGrid={showGrid}
            />
          )}
        </div>
        <div className="detail-info">
          <h2 style={{ fontSize: 48, lineHeight: 1 }}>{set.name}</h2>
          <div className="sk-label">{set.sub}</div>
          <p style={{ fontFamily: 'Kalam', fontWeight: 300, fontSize: 17, color: 'var(--ink-soft)', maxWidth: 420 }}>
            {set.summary}
          </p>

          <div className="sk-box" style={{ padding: 14, background: 'var(--paper-2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Stat label="pieces" value={previewBricks.length.toLocaleString()} />
              <Stat label="est. build" value={set.time} />
              <Stat label="difficulty" value={'★'.repeat(set.diff) + '☆'.repeat(5 - set.diff)} />
              <Stat label="steps" value={set.steps.length} />
              <Stat label="base size" value={`${set.baseSize.w} × ${set.baseSize.d}`} />
              <Stat label="released" value="2026 · official" />
            </div>
          </div>

          <div>
            <div className="sk-label">Start as:</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <button className="sk-btn primary lg" onClick={onStartInstructions}>📖 Guided Instructions</button>
              <button className="sk-btn lg" onClick={onOpenInSandbox}>🛠 Open in Sandbox</button>
            </div>
          </div>

          {progress > 0 && progress < set.steps.length && (
            <div className="sk-box thin" style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Patrick Hand', fontSize: 16, fontWeight: 700 }}>Resume your build</div>
                <div className="sk-label tiny">step {progress} of {set.steps.length}</div>
                <div className="progress" style={{ marginTop: 4 }}>
                  <i style={{ width: `${(progress / set.steps.length) * 100}%` }} />
                </div>
              </div>
              <button className="sk-btn go" onClick={onStartInstructions}>resume →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="sk-label tiny" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: 'Patrick Hand', fontSize: 19, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// ============================================================
// Root App
// ============================================================
function App() {
  const [route, setRoute] = useState({ kind: 'home' });

  const openSandbox = ({ fresh, initial, name } = {}) => {
    if (fresh) localStorage.removeItem('legodigital:sandbox');
    setRoute({ kind: 'sandbox', initial: initial || [], name: name || 'untitled-build' });
  };
  const openDetail = id => setRoute({ kind: 'detail', id });
  const openInstructions = id => setRoute({ kind: 'instructions', id });

  let body;
  if (route.kind === 'home') {
    body = <HomeScreen onOpenSandbox={openSandbox} onOpenDetail={openDetail} />;
  } else if (route.kind === 'detail') {
    body = <SetDetail setId={route.id}
      onBack={() => setRoute({ kind: 'home' })}
      onStartInstructions={() => openInstructions(route.id)}
      onOpenInSandbox={() => {
        const initial = flattenSet(SETS[route.id]).map(b => ({ ...b, id: 'sb-' + b.id }));
        openSandbox({ fresh: true, initial, name: SETS[route.id].id });
      }}
    />;
  } else if (route.kind === 'sandbox') {
    body = <SandboxScreen
      initialBricks={route.initial}
      setName={route.name}
      onExit={() => setRoute({ kind: 'home' })} />;
  } else if (route.kind === 'instructions') {
    body = <InstructionsScreen
      set={SETS[route.id]}
      onExit={() => setRoute({ kind: 'home' })}
      onSwitchToSandbox={() => {
        const initial = flattenSet(SETS[route.id]).map(b => ({ ...b, id: 'sb-' + b.id }));
        openSandbox({ fresh: true, initial, name: SETS[route.id].id });
      }} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="shell-brand" onClick={() => setRoute({ kind: 'home' })} style={{ cursor: 'pointer' }}>
          <span className="brick-logo" />
          LegoDigital
        </div>
        <div className="app-nav">
          <span className={route.kind === 'home' ? 'on' : ''} onClick={() => setRoute({ kind: 'home' })}>Library</span>
          <span className={route.kind === 'sandbox' ? 'on' : ''} onClick={() => openSandbox({ fresh: false })}>Sandbox</span>
        </div>
      </header>
      <main className="app-main">{body}</main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
