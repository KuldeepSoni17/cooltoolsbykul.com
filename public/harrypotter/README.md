# Wandwork — Wizarding Platformer

A playable **vertical slice** of the wizarding platformer described in `wizarding_platformer_spec.md`. Built as an HTML5 canvas game so you can play immediately in any browser.

## How to Play

1. Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).
2. Or run a local server:
   ```bash
   cd /Users/kuldeep/Documents/HarryPotterGame
   python3 -m http.server 8080
   ```
   Then visit http://localhost:8080

## Controls

| Action | Keys |
|--------|------|
| Move | A / D or Arrow keys |
| Jump | Space |
| Sprint | Shift |
| Crouch | S |
| Cast spell | X or J or Left click |
| Cycle spells | Q / E |
| Spell wheel | Hold Tab |
| Pause | Esc |
| Restart (paused) | R |

## What's Included (Vertical Slice)

- **Diagon Alley** — first zone with platforms, shops parallax, collectibles
- **7 spells** — Lumos, Expelliarmus, Stupefy, Incendio, Wingardium Leviosa, Alohomora, Reducto
- **Enemies** — Cornish Pixies, Garden Gnomes
- **Puzzles** — locked door (Alohomora), vines (Incendio), hidden platform (Lumos), cracked wall (Reducto)
- **Collectibles** — Galleons, Chocolate Frog Cards, Golden Snitch, Heart Piece
- **House selection** — Gryffindor, Slytherin, Hufflepuff, Ravenclaw with passive bonuses
- **Year 1 Boss** — Mountain Troll (two-phase fight)

## File Structure

```
HarryPotterGame/
├── index.html
├── css/game.css
├── js/
│   ├── constants.js   # Spells, houses, config
│   ├── particles.js   # Visual effects
│   ├── spells.js      # Spell casting & projectiles
│   ├── level.js       # Diagon Alley tilemap & collision
│   ├── enemies.js     # Pixies & gnomes
│   ├── boss.js        # Mountain Troll
│   ├── player.js      # Movement, stats, collision
│   ├── ui.js          # Menus & HUD
│   ├── engine.js      # Game loop, input, states
│   └── main.js        # Entry point
└── wizarding_platformer_spec.md
```

## Next Steps (Full Game)

Per the spec, future work includes Godot 4 port, more zones, broom flight, remaining spells, and Metroidvania backtracking.
