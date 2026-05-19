# Wizarding Platformer — Game Design Spec

*A 2D side-scrolling platformer set in a Harry Potter–style wizarding world. Working title: **"Wandwork"** (placeholder).*

---

## 1. Vision & Pitch

A 2D platformer in the spirit of *Super Mario World* and *Hollow Knight*, but where your primary verb isn't "stomp on enemy" — it's "cast the right spell." Movement is tight and Mario-like, but every challenge (combat, traversal, puzzles) is solved by picking the correct spell from a growing spellbook. As the player progresses, the game evolves into a light **Metroidvania**: new spells permanently unlock new paths through previous levels.

**Hook:** *"Most platformers give you a jump button. This one gives you a wand."*

**Target audience:** Ages 10+, fans of platformers and the Harry Potter universe. Casual-to-mid difficulty curve with optional hard "Auror Mode."

**Platforms:** PC (Steam) and Nintendo Switch primary; mobile port secondary.

---

## 2. Genre & Reference Points

- **Movement & feel:** *Super Mario World*, *Celeste*, *Rayman Legends*
- **Progression & exploration:** *Hollow Knight*, *Ori and the Blind Forest*
- **Spell/ability variety:** *Castlevania: Symphony of the Night*, *Hogwarts Legacy* (spell wheel concept, simplified for 2D)
- **Auto-scrolling broom sections:** *Donkey Kong Country* mine-cart, *Rayman* helicopter levels

---

## 3. Core Gameplay Loop

1. Explore a themed level (castle wing, forest, alley, etc.).
2. Encounter platforming challenges and enemies.
3. Choose the right spell from your spellbook to solve each.
4. Collect **wand cores**, **chocolate frog cards**, and **golden snitches** scattered through levels.
5. Complete the level → gain **House Points**, sometimes a new spell, advance the story.
6. Return to earlier levels with new spells to reach previously blocked areas.

---

## 4. Player Character

The player is a young wizard/witch enrolling at the school of magic. Character is **customizable** at the start:

- House (Gryffindor / Slytherin / Hufflepuff / Ravenclaw) — affects cosmetics, dialogue flavor, and a small passive bonus:
  - Gryffindor: +1 hit point
  - Slytherin: -10% spell cooldowns
  - Ravenclaw: +25% experience gain
  - Hufflepuff: +1 second invincibility on hit
- Hair, skin tone, robe trim color
- Wand cosmetic (functionally identical)

Base stats:
- **3 hearts** (upgradeable to 8)
- **Mana bar** for high-cost spells (regenerates over time)
- **Carries:** wand (always), spellbook (menu), broom (unlocked mid-game), invisibility cloak (late game)

---

## 5. Controls

### 5.1 Core control scheme (Gamepad — primary)

| Action | Button |
|---|---|
| Move left / right | Left stick or D-pad ← → |
| Look up / crouch | ↑ / ↓ on D-pad |
| Jump | A (south face button) |
| Sprint (hold) | B (east face button) |
| **Cast equipped spell** | X (west face button) |
| **Switch spell (cycle)** | L1 / R1 (shoulders) |
| **Spell wheel (radial menu, slows time)** | Hold L2 |
| Interact / pick up / talk | Y (north face button) |
| Mount/dismount broom (where allowed) | R2 |
| Pause / spellbook menu | Start |
| Map | Select |

### 5.2 Keyboard & mouse (PC)

- **WASD** — movement
- **Space** — jump
- **Shift** — sprint
- **Left mouse** — cast spell (aim with cursor — adds precision the gamepad doesn't)
- **Right mouse** — hold to open spell wheel
- **Q / E** — cycle spells
- **F** — interact
- **R** — mount broom

### 5.3 Suggested additional inputs beyond up/down/forward/backward

You asked what else is needed beyond directional movement. Recommended:

1. **Jump** (separate from "up") — pressing up should look upward, not jump. This avoids accidental jumps and lets you aim spells upward.
2. **Sprint** — holding sprint while running enables longer jumps; needed for some gap puzzles.
3. **Cast** — primary spell action button.
4. **Switch spell** — needed because the game has 10+ spells. A radial menu (hold to open) is far better than long cycle lists.
5. **Aim modifier** — hold to fire spells diagonally (8 directions) instead of just forward. Critical for combat verticality.
6. **Crouch / slide** — duck under low passages; sliding into a sprint becomes a slide attack.
7. **Wall-jump** — unlocked late-game via a movement spell (*Arresto Momentum*).

---

## 6. The Spell System (Core Mechanic)

Spells are learned over the course of the campaign. Each is **both a combat tool and a traversal/puzzle tool** — this is the heart of the design. The player can hold up to **6 spells equipped** at once, swapped via the radial menu.

### 6.1 Spell list

| Spell | Effect | Combat use | Puzzle / traversal use | Cost |
|---|---|---|---|---|
| **Lumos** | Lights a small radius around the player | Reveals invisible enemies; blinds Bogarts briefly | Lights dark caves and hidden passages; reveals invisible platforms | Free (toggle) |
| **Wingardium Leviosa** | Lifts a targeted object | Lifts an enemy, then drop it on others | Levitate crates onto pressure plates; ride lifted platforms | Low mana |
| **Alohomora** | Unlocks locks | None | Opens locked doors and chests | Free |
| **Expelliarmus** | Disarms / knocks back | Disarms armed enemies; medium ranged damage | Pushes objects across gaps | Low mana |
| **Incendio** | Cone of fire | High damage; burns plant enemies | Burns vines, lights torches, melts ice walls | Medium mana |
| **Aguamenti** | Jet of water | Douses fire enemies; pushes targets | Extinguishes fire blocks, grows magical plants, fills containers | Medium mana |
| **Stupefy** | Stunning bolt | Stuns enemies briefly; lets you stomp them | Activates rune switches | Medium mana |
| **Protego** | Magical shield | Blocks incoming spells/projectiles for 2 sec | Blocks falling rocks; reflects boss attacks | High mana |
| **Reducto** | Explosive blast | Heavy damage; staggers shielded foes | Breaks cracked walls and weak floors | High mana |
| **Accio** | Pull object/item to you | Yanks shield off an enemy; pulls items mid-air | Grab distant ledges (grapple-style); pull collectibles through bars | Medium mana |
| **Riddikulus** | Mockery spell | Only works on Boggarts — required for those bosses | None | Free vs Boggarts |
| **Petrificus Totalus** | Full-body bind | Freezes one enemy as a solid platform | Petrified enemies become temporary platforms — a key puzzle mechanic | High mana |
| **Patronus Charm** | Conjures a spirit animal | Only spell that damages Dementors | Lights the way through Dementor-infested zones | Very high mana, charge-up cast |
| **Arresto Momentum** | Slows your fall + enables wall-cling | None directly | Long fall safely; wall-jump up shafts; slow-motion air control | Per-use mana |

### 6.2 Casting feel

- Each spell has a distinct **wand motion** (visualized as a colored trail), distinct **sound**, and distinct **screen-shake/feedback profile**. The radial menu shows wand-motion icons so spells feel like physical actions, not menu picks.
- **Mana** is a soft limiter so players don't spam Reducto everywhere. Lumos and Alohomora are free, encouraging exploration. Mana regenerates faster when standing still or near friendly NPCs.

---

## 7. Broom Flight Mechanics

Unlocked at the start of "Year 2" (mid-game). The broom transforms the game into auto-scrolling flight sections and a few free-flight exploration zones.

### 7.1 Broom controls

- Left stick / arrow keys: free 360° movement
- Sprint button: **dive** (speed boost, narrow hitbox)
- Cast button: still casts spells while flying
- Jump: **barrel roll** (i-frames for ~0.4s)
- Crouch: pull up sharply

### 7.2 Broom level types

1. **Quidditch challenges** — chase a Golden Snitch through a 3D-ish parallax stadium while dodging Bludgers. Catching it under par time awards a bonus collectible.
2. **Auto-scrolling chase** — escape a dragon, outrun a storm, race a rival. Camera forces forward motion.
3. **Free-flight exploration** — open sky zones with floating islands, hidden caves, and collectibles. Used in 2–3 hub-style levels.
4. **Aerial boss fights** — see Section 9.

---

## 8. Enemies & Hazards

### 8.1 Common enemies

| Enemy | Behavior | Counter |
|---|---|---|
| Cornish Pixie | Fast, erratic; swarms in groups | Incendio cone or Stupefy |
| Garden Gnome | Burrows, pops up; slow but tanky | Wingardium Leviosa (lift and toss) |
| Devil's Snare vine | Static; grabs you if you stand near | Incendio or Lumos |
| Acromantula (small) | Charges; spits webs | Reducto or Incendio (burns webs) |
| Doxy | Flying; bites | Stupefy + jump on |
| Inferius | Slow zombie; resists damage | Incendio (only fire works) |
| Hooded cultist | Shoots back curses | Protego + Expelliarmus |
| Troll | Heavy; swings club; armored | Wingardium Leviosa the club out of its hands, then Reducto |

### 8.2 Hazards

- Moving suits of armor, swinging pendulum axes (castle)
- Trapped staircases that shift mid-jump (Hogwarts-style)
- Lava / fire in dungeons (use Aguamenti)
- Frozen lakes (slippery + breakable ice)
- Dementor zones (drain mana over time; only Patronus banishes them)
- Trick portraits (some are platforms, some attack)

---

## 9. Bosses

One major boss per "Year" (Act). Each is a multi-phase fight that **specifically rewards spell variety** — no single spell works for all phases.

1. **Year 1: Mountain Troll** — physical, throws debris. Phase 1: Wingardium Leviosa its club, hit head. Phase 2: Reducto on cracked floor under it.
2. **Year 2: Basilisk** — can't look at it directly (closed-eyes mode, audio cues). Use Protego mirror reflection.
3. **Year 3: Werewolf chase** — auto-scroll on broom; Stupefy at moonlight crystals to slow it.
4. **Year 4: Hungarian Horntail (Dragon)** — broom dogfight, three rings of Aguamenti to cool its breath, then Reducto on chains.
5. **Year 5: Dementor swarm** — Patronus-only damage; mana management puzzle.
6. **Year 6: Possessed professor** — multiple Boggart forms; Riddikulus phase changes each round.
7. **Year 7: Dark Lord** — multi-stage final fight; every spell you've learned is required across phases. Last phase is a one-on-one Expelliarmus duel — a rhythm/QTE wand-lock mini-game.

---

## 10. World & Level Design

The world is a **central hub (the castle)** that connects out to themed level zones.

### 10.1 Hub: The Castle

- Top-down explorable castle interior between levels
- Common Room (save point, customize loadout)
- Great Hall (shop — buy wand upgrades, potions, cosmetics)
- Library (look up lore on Chocolate Frog Cards)
- Greenhouse (mini-games for stat upgrades)
- Headmaster's office (story progression gate)

### 10.2 Zones (each = 3–5 levels + boss)

1. **Diagon Alley** — tutorial; teaches movement, Lumos, Wingardium Leviosa.
2. **Forbidden Forest** — Devil's Snare, Acromantulas. Teaches Incendio.
3. **The Great Lake** — underwater section (Bubble-Head Charm slows movement). Teaches Aguamenti.
4. **Quidditch Pitch & Sky Zone** — broom introduction. Teaches broom controls.
5. **Dungeons of the Castle** — puzzle-heavy. Teaches Petrificus Totalus, Accio.
6. **Hogsmeade & Shrieking Shack** — stealth/cloak section. Teaches Arresto Momentum.
7. **Ministry of Magic** — vertical scrolling chase. Teaches Patronus.
8. **The Final Battle: Castle Siege** — all skills tested. Ends in the final boss.

Each zone has a visual theme, palette, music motif, and at least one unique enemy and one unique level mechanic.

---

## 11. Progression & Unlocks

- **Linear story** with optional backtracking. Each new spell **adds collectibles you can now reach** in older levels (Metroidvania-lite).
- **House Points** are the primary XP — earn them by completing levels, finding hidden items, and beating optional challenges. They unlock cosmetics, lore, and the True Ending.
- **Wand upgrades** at the shop: +1 mana max, +1 spell slot, faster cast, longer range.
- **Heart Pieces** scattered in hidden areas (4 pieces = 1 heart, like *Zelda*).

---

## 12. Collectibles & Economy

| Item | Purpose | Rarity |
|---|---|---|
| Galleons (currency) | Shop purchases | Common |
| Chocolate Frog Cards | Lore unlocks (60 total) | Uncommon, hidden |
| Golden Snitch | One per broom level; bonus House Points | Rare |
| Heart Piece | +HP | Hidden (24 total = 6 hearts) |
| Mana Crystal | +Mana max | Hidden (16 total) |
| Spell Tome | Unlocks an **optional 4th-tier spell** (e.g., Fiendfyre, Sectumsempra) | Very rare, side quest only |

---

## 13. UI & HUD

Keep it **minimal** — readable at a glance:

- **Top-left:** Hearts, mana bar
- **Top-right:** Currently equipped spell icon + name; small ghost icons of next/prev in cycle
- **Bottom-left:** Mini-map (off by default; toggle)
- **Center on action:** Spell wheel appears when L2 held, time slows to ~20%
- **House crest** corner watermark — flashes when earning House Points
- All HUD elements fade out after 2s of inactivity for screenshot-friendly play.

---

## 14. Art & Audio Direction

### 14.1 Art

- **Hand-painted 2D**, soft watercolor textures with crisp ink outlines — think *Cuphead* technical quality with *Don't Starve*'s storybook feel.
- 4-layer parallax backgrounds
- Spell effects are **bright, saturated** against muted level palettes — spells should always pop visually.
- Character animation: 24fps frame-by-frame for principal animations, tween for secondary.

### 14.2 Audio

- Orchestral score with **a leitmotif per zone** and a wand/spell musical sting per cast.
- Spells have distinct sound signatures (whoosh + element + impact layer).
- **Ambient diegetic** sounds in hub (chatter, ghosts, paintings whispering).
- Voice acting limited to grunts, casting cries, and short emotive lines — full dialogue is text, like classic JRPGs (saves cost, allows more dialogue).

---

## 15. Technical Specs

- **Engine:** Unity 2022 LTS or Godot 4 (Godot preferred — open source, strong 2D pipeline)
- **Resolution:** native 1920×1080; assets authored at 2× for retina/4K scale
- **Target framerate:** 60 fps locked on all platforms
- **Save system:** 3 save slots, auto-save at level entry + manual save in Common Room
- **Localization:** EN launch; FR, DE, ES, JA, KO, ZH-S, BR-PT planned within 6 months
- **Accessibility:**
  - Full button remap
  - Color-blind palette options for spell colors
  - "Auror Mode" hard / "Apprentice Mode" easy (more hearts, regenerating mana, generous platforming)
  - Subtitle size + speaker name + background opacity
  - Optional **assist toggles**: invincibility, infinite mana, slow-mo platforming

---

## 16. Stretch Features (Post-Launch)

- **Local co-op** — Player 2 plays a sidekick (Hermione-style mage or Ron-style melee). Drop-in/out.
- **Daily Challenge** — randomized level with fixed loadout; global leaderboard.
- **Level Editor** — share custom levels with House Points incentives.
- **DLC year/season** — a "Tournament of Champions"-style triathlon DLC: maze level, underwater level, dragon level.

---

## 17. Risks & Open Questions

- **IP / Licensing — critical.** Harry Potter is owned by J.K. Rowling and Warner Bros. Spell names, character names, "Hogwarts," house names, and creature names are protected. **Two paths forward:**
  1. **License the IP** through Warner Bros Interactive (expensive, contractual constraints, but you get the brand).
  2. **File the serial numbers off** — keep mechanics, reskin: a young-mage academy with original spells (e.g. *Levitas* instead of *Wingardium Leviosa*), a different school name, original characters. Cheaper, fewer restrictions, but loses the brand pull. This spec is fully portable to a generic wizard-school setting.
- Spell wheel UX on mobile — the radial menu doesn't translate cleanly; needs a separate touch design.
- Broom physics tuning — needs early prototype, since flight feel will make or break those sections.
- Balancing free spells (Lumos, Alohomora) so they don't become trivially-spammed solves.

---

## 18. Production Estimate (Rough)

| Phase | Duration | Team |
|---|---|---|
| Pre-production / vertical slice | 4 months | 4 people |
| Production | 14 months | 8–12 people |
| Polish + cert | 4 months | 8 people |
| **Total to launch** | **~22 months** | Avg. 8 FTE |

Estimated budget: **$1.5M–$3M** depending on licensing path and platform count.

---

*End of spec. Next steps: prototype the vertical slice — Diagon Alley level + first boss — to validate spell-as-verb design.*
