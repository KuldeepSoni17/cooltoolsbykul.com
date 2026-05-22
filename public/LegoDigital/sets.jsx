// ====== Predefined Lego sets ======
// Each set: ordered "steps" — each step has 1-N bricks placed at once.
// Brick: { x, y, z, w, d, h?, color, type?, slopeDir?, noStuds? }

// ---------- Flying Ford Anglia (small blue car) ----------
function buildFordAnglia() {
  const steps = [];
  // Footprint: 14 × 7 baseplate (tan road).
  // Car body along x=1..11, width y=1..6 (5 wide).

  // s1: 4 round wheels at the corners
  steps.push({
    name: 'Mount the four wheels',
    note: 'Black round wheels — classic Lego look — at each corner.',
    bricks: [
      { x: 2, y: 1, z: 0, w: 2, d: 1, color: 'black', type: 'wheel' },
      { x: 2, y: 5, z: 0, w: 2, d: 1, color: 'black', type: 'wheel' },
      { x: 8, y: 1, z: 0, w: 2, d: 1, color: 'black', type: 'wheel' },
      { x: 8, y: 5, z: 0, w: 2, d: 1, color: 'black', type: 'wheel' },
    ],
  });
  // s2: chassis runners
  steps.push({
    name: 'Lay the chassis runners',
    note: 'Long dark grey bars connect the wheels.',
    bricks: [
      { x: 2, y: 2, z: 0, w: 8, d: 1, color: 'grey' },
      { x: 2, y: 4, z: 0, w: 8, d: 1, color: 'grey' },
    ],
  });
  // s3: chassis floor
  steps.push({
    name: 'Drop in the floor pan',
    note: 'A blue 8×2 floor brick covers the chassis.',
    bricks: [
      { x: 2, y: 3, z: 0, w: 8, d: 1, color: 'blue' },
    ],
  });
  // s4: lower body
  steps.push({
    name: 'Walls of the lower body',
    note: 'Three blue 2×2 bricks build the lower side walls.',
    bricks: [
      { x: 2, y: 2, z: 1, w: 8, d: 1, color: 'blue' },
      { x: 2, y: 4, z: 1, w: 8, d: 1, color: 'blue' },
      { x: 2, y: 3, z: 1, w: 1, d: 1, color: 'blue' },
      { x: 9, y: 3, z: 1, w: 1, d: 1, color: 'blue' },
    ],
  });
  // s5: hood (sloped)
  steps.push({
    name: 'Sloped hood up front',
    note: 'A blue slope makes the recognizable Anglia bonnet.',
    bricks: [
      { x: 1, y: 2, z: 1, w: 1, d: 3, color: 'blue', type: 'slope', slopeDir: 'E' },
    ],
  });
  // s6: headlights + grille
  steps.push({
    name: 'Headlights & grille',
    note: 'Yellow round headlamps and a grey grille.',
    bricks: [
      { x: 0, y: 2, z: 1, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 0, y: 4, z: 1, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 0, y: 3, z: 1, w: 1, d: 1, color: 'grey' },
    ],
  });
  // s7: windshield (clear)
  steps.push({
    name: 'Windshield (clear)',
    note: 'A transparent slope rises from the hood to the cabin.',
    bricks: [
      { x: 4, y: 3, z: 2, w: 1, d: 1, color: 'trans', type: 'slope', slopeDir: 'E' },
    ],
  });
  // s8: cabin walls
  steps.push({
    name: 'Cabin walls',
    note: 'Cabin sides made of blue 4×1 bricks.',
    bricks: [
      { x: 5, y: 2, z: 2, w: 4, d: 1, color: 'blue' },
      { x: 5, y: 4, z: 2, w: 4, d: 1, color: 'blue' },
    ],
  });
  // s9: side windows
  steps.push({
    name: 'Side windows',
    note: 'Transparent panels for the doors.',
    bricks: [
      { x: 5, y: 2, z: 2, w: 4, d: 1, color: 'trans', type: 'window' },
      { x: 5, y: 4, z: 2, w: 4, d: 1, color: 'trans', type: 'window' },
    ],
  });
  // s10: rear window
  steps.push({
    name: 'Rear window',
    note: 'A clear window across the back of the cabin.',
    bricks: [
      { x: 9, y: 3, z: 2, w: 1, d: 1, color: 'trans', type: 'window' },
    ],
  });
  // s11: roof
  steps.push({
    name: 'Cabin roof',
    note: 'A flat blue tile caps the cabin.',
    bricks: [
      { x: 5, y: 2, z: 3, w: 4, d: 3, color: 'blue', type: 'tile' },
    ],
  });
  // s12: rear
  steps.push({
    name: 'Rear bumper & tail lights',
    note: 'Grey bumper and red tail-light tiles.',
    bricks: [
      { x: 10, y: 2, z: 1, w: 1, d: 3, color: 'grey' },
      { x: 10, y: 2, z: 2, w: 1, d: 1, color: 'red', type: 'tile' },
      { x: 10, y: 4, z: 2, w: 1, d: 1, color: 'red', type: 'tile' },
    ],
  });
  // s13: door handles
  steps.push({
    name: 'Yellow door handles',
    note: 'Two tiny yellow handles on each side door.',
    bricks: [
      { x: 6, y: 1, z: 2, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 6, y: 5, z: 2, w: 1, d: 1, color: 'yellow', type: 'tile' },
    ],
  });
  // s14: roof rack & luggage
  steps.push({
    name: 'Strap luggage on top',
    note: 'A brown trunk on the roof — wizards travel heavy.',
    bricks: [
      { x: 6, y: 3, z: 4, w: 2, d: 1, color: 'brown' },
    ],
  });
  // s15: driver (minifig)
  steps.push({
    name: 'Drop in Mr. Weasley',
    note: 'A minifig driver sits in the cabin.',
    bricks: [
      { x: 6, y: 3, z: 2, w: 1, d: 1, h: 2, color: 'yellow', type: 'minifig' },
    ],
  });
  return {
    id: 'anglia',
    name: 'Flying Ford Anglia',
    sub: 'Wizarding World · vehicle',
    summary: 'Open the doors, fold down the roof, lift it off the ground — Harry & Ron sold separately.',
    diff: 2,
    time: '15 min',
    baseSize: { w: 14, d: 7 },
    baseColor: '#cdbf95',
    steps,
  };
}

// ---------- Hogwarts Express (red train) ----------
function buildHogwartsExpress() {
  const steps = [];
  // Scene: 26 × 7. Tracks run along x.
  // s1 ties
  steps.push({
    name: 'Lay the railway ties',
    note: 'Brown sleepers run across the track every other stud.',
    bricks: [
      ...Array.from({ length: 13 }).map((_, i) => ({ x: i * 2, y: 2, z: 0, w: 1, d: 3, color: 'brown' })),
    ],
  });
  // s2 rails
  steps.push({
    name: 'Lay the rails',
    note: 'Two thin grey rails atop the sleepers.',
    bricks: [
      { x: 0, y: 2, z: 1, w: 26, d: 1, color: 'grey', type: 'tile' },
      { x: 0, y: 4, z: 1, w: 26, d: 1, color: 'grey', type: 'tile' },
    ],
  });
  // s3 loco wheels — real round wheels
  steps.push({
    name: 'Mount the locomotive wheels',
    note: '6 round black wheels carry the engine.',
    bricks: [
      { x: 4,  y: 2, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 6,  y: 2, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 8,  y: 2, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 4,  y: 4, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 6,  y: 4, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 8,  y: 4, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
    ],
  });
  // s4 floor
  steps.push({
    name: 'Floor the locomotive',
    note: 'A red 8×3 floor brick over the wheels.',
    bricks: [
      { x: 3, y: 2, z: 2, w: 8, d: 3, color: 'red' },
    ],
  });
  // s5 boiler (cylindrical)
  steps.push({
    name: 'Build the boiler (cylindrical)',
    note: 'Red cylinder sections form the long boiler.',
    bricks: [
      { x: 3, y: 2, z: 3, w: 4, d: 3, color: 'red', type: 'cylinder' },
      { x: 3, y: 2, z: 4, w: 4, d: 3, color: 'red', type: 'cylinder' },
    ],
  });
  // s6 boiler front + headlamp
  steps.push({
    name: 'Boiler front + headlamp',
    note: 'A short red cap and yellow round headlamp at the front.',
    bricks: [
      { x: 2, y: 2, z: 3, w: 1, d: 3, color: 'red', type: 'cylinder' },
      { x: 1, y: 3, z: 3, w: 1, d: 1, color: 'yellow', type: 'tile' },
    ],
  });
  // s7 smokestack — CONE!
  steps.push({
    name: 'Smokestack (cone)',
    note: 'A black cone rises from the boiler — proper steam-locomotive look.',
    bricks: [
      { x: 4, y: 3, z: 5, w: 1, d: 1, color: 'black' },
      { x: 4, y: 3, z: 6, w: 1, d: 1, h: 2, color: 'black', type: 'cone' },
    ],
  });
  // s8 steam dome
  steps.push({
    name: 'Brass steam dome',
    note: 'A small yellow dome sits behind the smokestack.',
    bricks: [
      { x: 6, y: 3, z: 5, w: 1, d: 1, color: 'yellow', type: 'cylinder' },
    ],
  });
  // s9 cab walls
  steps.push({
    name: 'Driver\'s cab walls',
    note: 'Red walls form the cab behind the boiler.',
    bricks: [
      { x: 8, y: 2, z: 3, w: 3, d: 1, color: 'red' },
      { x: 8, y: 4, z: 3, w: 3, d: 1, color: 'red' },
      { x: 10, y: 3, z: 3, w: 1, d: 1, color: 'red' },
    ],
  });
  // s10 cab windows
  steps.push({
    name: 'Cab windows',
    note: 'Clear windows on three sides of the cab.',
    bricks: [
      { x: 8, y: 2, z: 4, w: 3, d: 1, color: 'trans', type: 'window' },
      { x: 8, y: 4, z: 4, w: 3, d: 1, color: 'trans', type: 'window' },
      { x: 10, y: 3, z: 4, w: 1, d: 1, color: 'trans', type: 'window' },
    ],
  });
  // s11 cab roof
  steps.push({
    name: 'Cab roof',
    note: 'A black flat roof caps the cab.',
    bricks: [
      { x: 8, y: 2, z: 5, w: 3, d: 3, color: 'black', type: 'tile' },
    ],
  });
  // s12 boiler band decoration
  steps.push({
    name: 'Decorative yellow trim',
    note: 'A thin yellow line runs along the top edges of the boiler.',
    bricks: [
      { x: 3, y: 2, z: 5, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 7, y: 2, z: 5, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 3, y: 4, z: 5, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 7, y: 4, z: 5, w: 1, d: 1, color: 'yellow', type: 'tile' },
    ],
  });
  // s13 coupling
  steps.push({
    name: 'Coupling',
    note: 'A grey brick connects engine to tender.',
    bricks: [
      { x: 11, y: 3, z: 2, w: 1, d: 1, color: 'grey' },
    ],
  });
  // s14 tender wheels
  steps.push({
    name: 'Tender wheels',
    note: '4 round wheels under the tender.',
    bricks: [
      { x: 13, y: 2, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 15, y: 2, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 13, y: 4, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 15, y: 4, z: 1, w: 1, d: 1, color: 'black', type: 'wheel' },
    ],
  });
  // s15 tender body
  steps.push({
    name: 'Tender body',
    note: 'A red coal car behind the engine.',
    bricks: [
      { x: 12, y: 2, z: 2, w: 5, d: 3, color: 'red' },
      { x: 12, y: 2, z: 3, w: 5, d: 1, color: 'red' },
      { x: 12, y: 4, z: 3, w: 5, d: 1, color: 'red' },
      { x: 12, y: 3, z: 3, w: 1, d: 1, color: 'red' },
      { x: 16, y: 3, z: 3, w: 1, d: 1, color: 'red' },
    ],
  });
  // s16 coal
  steps.push({
    name: 'Pile in the coal',
    note: 'A few black 1×1 pieces fill the tender.',
    bricks: [
      { x: 13, y: 3, z: 3, w: 1, d: 1, color: 'black' },
      { x: 14, y: 3, z: 3, w: 1, d: 1, color: 'black' },
      { x: 15, y: 3, z: 3, w: 1, d: 1, color: 'black' },
      { x: 14, y: 3, z: 4, w: 1, d: 1, color: 'black' },
    ],
  });
  // s17 number plate
  steps.push({
    name: 'Number plate "5972"',
    note: 'Yellow plates on the side of the boiler.',
    bricks: [
      { x: 5, y: 1, z: 4, w: 2, d: 1, color: 'yellow', type: 'tile' },
      { x: 5, y: 5, z: 4, w: 2, d: 1, color: 'yellow', type: 'tile' },
    ],
  });
  // s18 conductor
  steps.push({
    name: 'Conductor in the cab',
    note: 'A wizarding conductor minifig.',
    bricks: [
      { x: 9, y: 3, z: 3, w: 1, d: 1, h: 2, color: 'yellow', type: 'minifig' },
    ],
  });
  return {
    id: 'express',
    name: 'Hogwarts Express',
    sub: 'Wizarding World · train',
    summary: 'Locomotive 5972 with cylindrical boiler, cone smokestack, real round wheels, and her tender.',
    diff: 4,
    time: '25 min',
    baseSize: { w: 26, d: 7 },
    baseColor: '#7fa56a',
    steps,
  };
}

// ---------- Hogwarts Castle (stylized) ----------
function buildHogwartsCastle() {
  const steps = [];
  // 20 × 16 baseplate (dark green grass). Lake on one side.
  // s1 foundation
  steps.push({
    name: 'Lay the castle foundations',
    note: 'Stone-grey footprint marks where the castle sits.',
    bricks: [
      { x: 3, y: 2, z: 0, w: 14, d: 10, color: 'grey' },
    ],
  });
  // s2 great hall walls
  steps.push({
    name: 'Walls of the Great Hall',
    note: 'Two courses of tan stone — Hogwarts\' famous sandy hue.',
    bricks: [
      { x: 7, y: 4, z: 1, w: 6, d: 6, color: 'tan' },
      { x: 7, y: 4, z: 2, w: 6, d: 6, color: 'tan' },
    ],
  });
  // s3 great hall windows
  steps.push({
    name: 'Arched Great Hall windows',
    note: 'Glowing yellow windows along the side walls.',
    bricks: [
      { x: 7, y: 4, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 9, y: 4, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 11, y: 4, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 7, y: 9, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 9, y: 9, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 11, y: 9, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
    ],
  });
  // s4 hall upper course
  steps.push({
    name: 'Upper wall course',
    note: 'Tan bricks finish the top of the Great Hall walls.',
    bricks: [
      { x: 7, y: 4, z: 3, w: 6, d: 1, color: 'tan' },
      { x: 7, y: 9, z: 3, w: 6, d: 1, color: 'tan' },
      { x: 7, y: 5, z: 3, w: 1, d: 4, color: 'tan' },
      { x: 12, y: 5, z: 3, w: 1, d: 4, color: 'tan' },
    ],
  });
  // s5 pitched roof — slopes
  steps.push({
    name: 'Pitched roof — Great Hall',
    note: 'Dark brown roof slopes — proper Hogwarts pitched look.',
    bricks: [
      { x: 7, y: 5, z: 4, w: 6, d: 2, color: 'brown', type: 'slope', slopeDir: 'N' },
      { x: 7, y: 7, z: 4, w: 6, d: 2, color: 'brown', type: 'slope', slopeDir: 'S' },
      { x: 7, y: 6, z: 5, w: 6, d: 2, color: 'brown' },
    ],
  });
  // s6 astronomy tower base (west)
  steps.push({
    name: 'Astronomy Tower base',
    note: 'Tall narrow tower on the west side.',
    bricks: [
      { x: 4, y: 3, z: 1, w: 3, d: 3, color: 'tan' },
      { x: 4, y: 3, z: 2, w: 3, d: 3, color: 'tan' },
      { x: 4, y: 3, z: 3, w: 3, d: 3, color: 'tan' },
    ],
  });
  // s7 astronomy tower top + window
  steps.push({
    name: 'Astronomy Tower upper',
    note: 'Three more courses + a glowing window.',
    bricks: [
      { x: 4, y: 3, z: 4, w: 3, d: 3, color: 'tan' },
      { x: 4, y: 3, z: 5, w: 3, d: 3, color: 'tan' },
      { x: 4, y: 3, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 4, y: 3, z: 5, w: 1, d: 1, color: 'yellow', type: 'window' },
    ],
  });
  // s8 astronomy CONE roof — finally a proper pointed roof!
  steps.push({
    name: 'Astronomy Tower cone roof',
    note: 'A dark brown cone tops the tower — a real spire.',
    bricks: [
      { x: 4, y: 3, z: 6, w: 3, d: 3, h: 3, color: 'brown', type: 'cone' },
      { x: 5, y: 4, z: 9, w: 1, d: 1, color: 'red', type: 'tile' },
    ],
  });
  // s9 center spire — tallest tower
  steps.push({
    name: 'Central spire base',
    note: 'The tallest tower rises from the middle of the castle.',
    bricks: [
      { x: 9, y: 6, z: 4, w: 2, d: 2, color: 'tan' },
      { x: 9, y: 6, z: 5, w: 2, d: 2, color: 'tan' },
      { x: 9, y: 6, z: 6, w: 2, d: 2, color: 'tan' },
      { x: 9, y: 6, z: 7, w: 2, d: 2, color: 'tan' },
      { x: 9, y: 6, z: 6, w: 1, d: 1, color: 'yellow', type: 'window' },
    ],
  });
  // s10 central spire cone
  steps.push({
    name: 'Central spire cone roof',
    note: 'A tall narrow cone — the most iconic tower.',
    bricks: [
      { x: 9, y: 6, z: 8, w: 2, d: 2, h: 4, color: 'brown', type: 'cone' },
    ],
  });
  // s11 east tower
  steps.push({
    name: 'East tower',
    note: 'Squat tower on the east side.',
    bricks: [
      { x: 13, y: 4, z: 1, w: 3, d: 3, color: 'tan' },
      { x: 13, y: 4, z: 2, w: 3, d: 3, color: 'tan' },
      { x: 13, y: 4, z: 3, w: 3, d: 3, color: 'tan' },
      { x: 13, y: 4, z: 4, w: 3, d: 3, color: 'tan' },
      { x: 13, y: 4, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
    ],
  });
  // s12 east tower cone
  steps.push({
    name: 'East tower cone',
    note: 'Cone roof.',
    bricks: [
      { x: 13, y: 4, z: 5, w: 3, d: 3, h: 2, color: 'brown', type: 'cone' },
    ],
  });
  // s13 south tower
  steps.push({
    name: 'South tower',
    note: 'A short tower on the south corner with a cone roof.',
    bricks: [
      { x: 13, y: 8, z: 1, w: 3, d: 3, color: 'tan' },
      { x: 13, y: 8, z: 2, w: 3, d: 3, color: 'tan' },
      { x: 13, y: 8, z: 3, w: 3, d: 3, color: 'tan' },
      { x: 13, y: 9, z: 3, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 13, y: 8, z: 4, w: 3, d: 3, h: 2, color: 'brown', type: 'cone' },
    ],
  });
  // s14 entrance door
  steps.push({
    name: 'The main entrance',
    note: 'Big wooden doors with a yellow handle.',
    bricks: [
      { x: 9, y: 3, z: 1, w: 2, d: 1, h: 2, color: 'brown', type: 'door' },
      { x: 8, y: 2, z: 1, w: 4, d: 1, color: 'grey', type: 'tile' },
    ],
  });
  // s15 lake
  steps.push({
    name: 'The Black Lake',
    note: 'Dark blue water in front of the castle.',
    bricks: [
      { x: 3, y: 13, z: 0, w: 14, d: 3, color: 'dblue', type: 'tile' },
    ],
  });
  // s16 hagrid's hut
  steps.push({
    name: "Hagrid's hut",
    note: 'A tiny brown hut by the lake with a red roof.',
    bricks: [
      { x: 4, y: 12, z: 1, w: 2, d: 1, color: 'brown' },
      { x: 4, y: 12, z: 2, w: 2, d: 1, h: 1, color: 'red', type: 'slope', slopeDir: 'S' },
      { x: 4, y: 12, z: 1, w: 1, d: 1, color: 'yellow', type: 'window' },
    ],
  });
  // s17 whomping willow
  steps.push({
    name: 'Plant the Whomping Willow',
    note: 'Brown trunk and a green canopy.',
    bricks: [
      { x: 16, y: 12, z: 1, w: 1, d: 1, color: 'brown', type: 'cylinder' },
      { x: 16, y: 12, z: 2, w: 1, d: 1, color: 'brown', type: 'cylinder' },
      { x: 15, y: 11, z: 3, w: 3, d: 3, color: 'green' },
      { x: 16, y: 12, z: 4, w: 1, d: 1, color: 'green' },
    ],
  });
  // s18 wizard minifig
  steps.push({
    name: 'Dumbledore on the steps',
    note: 'A minifig in front of the doors.',
    bricks: [
      { x: 9, y: 1, z: 1, w: 1, d: 1, h: 2, color: 'yellow', type: 'minifig' },
    ],
  });
  return {
    id: 'castle',
    name: 'Hogwarts Castle',
    sub: 'Wizarding World · official set',
    summary: 'Hogwarts with cone-roofed towers, arched windows, the Black Lake, and the Whomping Willow.',
    diff: 5,
    time: '40 min',
    baseSize: { w: 20, d: 16 },
    baseColor: '#3f7b48',
    steps,
  };
}

// ---------- Starter: Cozy House ----------
function buildCozyHouse() {
  const steps = [];
  // 10x8 baseplate
  steps.push({
    name: 'Lay the foundation',
    note: 'A grey stone footprint marks where the house sits.',
    bricks: [
      { x: 1, y: 1, z: 0, w: 8, d: 6, color: 'grey', type: 'tile' },
    ],
  });
  steps.push({
    name: 'Build the front and back walls',
    note: 'Tan brick walls for the front and back of the house.',
    bricks: [
      { x: 1, y: 1, z: 1, w: 8, d: 1, color: 'tan' },
      { x: 1, y: 6, z: 1, w: 8, d: 1, color: 'tan' },
    ],
  });
  steps.push({
    name: 'Side walls',
    note: 'Two short tan walls close in the sides.',
    bricks: [
      { x: 1, y: 2, z: 1, w: 1, d: 4, color: 'tan' },
      { x: 8, y: 2, z: 1, w: 1, d: 4, color: 'tan' },
    ],
  });
  steps.push({
    name: 'Front door and windows',
    note: 'A brown door + two yellow windows on the front wall.',
    bricks: [
      { x: 4, y: 1, z: 1, w: 2, d: 1, h: 2, color: 'brown', type: 'door' },
      { x: 2, y: 1, z: 1, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 7, y: 1, z: 1, w: 1, d: 1, color: 'yellow', type: 'window' },
    ],
  });
  steps.push({
    name: 'Upper wall course',
    note: 'A second course of tan brick around the perimeter.',
    bricks: [
      { x: 1, y: 1, z: 2, w: 8, d: 1, color: 'tan' },
      { x: 1, y: 6, z: 2, w: 8, d: 1, color: 'tan' },
      { x: 1, y: 2, z: 2, w: 1, d: 4, color: 'tan' },
      { x: 8, y: 2, z: 2, w: 1, d: 4, color: 'tan' },
    ],
  });
  steps.push({
    name: 'Back windows',
    note: 'Yellow windows on the back wall too.',
    bricks: [
      { x: 3, y: 6, z: 2, w: 1, d: 1, color: 'yellow', type: 'window' },
      { x: 6, y: 6, z: 2, w: 1, d: 1, color: 'yellow', type: 'window' },
    ],
  });
  steps.push({
    name: 'Pitched roof — left slope',
    note: 'Red roof slopes rising to the ridge.',
    bricks: [
      { x: 1, y: 1, z: 3, w: 8, d: 3, color: 'red', type: 'slope', slopeDir: 'N' },
    ],
  });
  steps.push({
    name: 'Pitched roof — right slope',
    note: 'Mirrored red roof slope on the other side.',
    bricks: [
      { x: 1, y: 4, z: 3, w: 8, d: 3, color: 'red', type: 'slope', slopeDir: 'S' },
    ],
  });
  steps.push({
    name: 'Roof ridge',
    note: 'A flat red tile caps the top ridge.',
    bricks: [
      { x: 1, y: 3, z: 4, w: 8, d: 1, color: 'red', type: 'tile' },
    ],
  });
  steps.push({
    name: 'Chimney',
    note: 'A small grey chimney rises from the roof.',
    bricks: [
      { x: 7, y: 3, z: 5, w: 1, d: 1, color: 'grey' },
      { x: 7, y: 3, z: 6, w: 1, d: 1, color: 'grey' },
    ],
  });
  steps.push({
    name: 'Garden path',
    note: 'Tan tiles lead from the door to the edge.',
    bricks: [
      { x: 4, y: 0, z: 0, w: 2, d: 1, color: 'tan', type: 'tile' },
    ],
  });
  return {
    id: 'house',
    name: 'Cozy House',
    sub: 'Starter · home',
    summary: 'A simple two-window home with a pitched red roof and a brick chimney.',
    diff: 1,
    time: '10 min',
    baseSize: { w: 10, d: 8 },
    baseColor: '#dccdac',
    starter: true,
    steps,
  };
}

// ---------- Starter: Modern Car ----------
function buildModernCar() {
  const steps = [];
  // 10x6 baseplate (road)
  steps.push({
    name: 'Mount the four wheels',
    note: 'Round black wheels at each corner of the chassis.',
    bricks: [
      { x: 2, y: 1, z: 0, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 2, y: 4, z: 0, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 6, y: 1, z: 0, w: 1, d: 1, color: 'black', type: 'wheel' },
      { x: 6, y: 4, z: 0, w: 1, d: 1, color: 'black', type: 'wheel' },
    ],
  });
  steps.push({
    name: 'Chassis floor',
    note: 'A red 6×4 brick forms the car body floor.',
    bricks: [
      { x: 1, y: 1, z: 0, w: 1, d: 4, color: 'grey' },
      { x: 7, y: 1, z: 0, w: 1, d: 4, color: 'grey' },
      { x: 3, y: 1, z: 0, w: 3, d: 4, color: 'red' },
    ],
  });
  steps.push({
    name: 'Body sides',
    note: 'Two red bricks form the side walls.',
    bricks: [
      { x: 1, y: 1, z: 1, w: 7, d: 1, color: 'red' },
      { x: 1, y: 4, z: 1, w: 7, d: 1, color: 'red' },
    ],
  });
  steps.push({
    name: 'Sloped hood',
    note: 'A red slope at the front gives the car its profile.',
    bricks: [
      { x: 1, y: 2, z: 1, w: 1, d: 2, color: 'red', type: 'slope', slopeDir: 'E' },
    ],
  });
  steps.push({
    name: 'Headlights & grille',
    note: 'Yellow round tile headlamps and a grey grille.',
    bricks: [
      { x: 0, y: 1, z: 1, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 0, y: 4, z: 1, w: 1, d: 1, color: 'yellow', type: 'tile' },
      { x: 0, y: 2, z: 1, w: 1, d: 2, color: 'grey' },
    ],
  });
  steps.push({
    name: 'Cabin walls',
    note: 'Walls for the cabin roof.',
    bricks: [
      { x: 3, y: 1, z: 2, w: 4, d: 1, color: 'red' },
      { x: 3, y: 4, z: 2, w: 4, d: 1, color: 'red' },
    ],
  });
  steps.push({
    name: 'Windshield + windows',
    note: 'Transparent panels for the cabin.',
    bricks: [
      { x: 3, y: 2, z: 2, w: 1, d: 2, color: 'trans', type: 'slope', slopeDir: 'E' },
      { x: 3, y: 1, z: 2, w: 4, d: 1, color: 'trans', type: 'window' },
      { x: 3, y: 4, z: 2, w: 4, d: 1, color: 'trans', type: 'window' },
      { x: 6, y: 2, z: 2, w: 1, d: 2, color: 'trans', type: 'window' },
    ],
  });
  steps.push({
    name: 'Roof',
    note: 'A flat red tile caps the cabin.',
    bricks: [
      { x: 3, y: 1, z: 3, w: 4, d: 4, color: 'red', type: 'tile' },
    ],
  });
  steps.push({
    name: 'Driver minifig',
    note: 'Hop in!',
    bricks: [
      { x: 5, y: 2, z: 2, w: 1, d: 1, h: 2, color: 'yellow', type: 'minifig' },
    ],
  });
  return {
    id: 'car',
    name: 'Modern Car',
    sub: 'Starter · vehicle',
    summary: 'A clean little red car with round wheels, a sloped hood, and a clear windshield.',
    diff: 1,
    time: '10 min',
    baseSize: { w: 10, d: 6 },
    baseColor: '#cdbf95',
    starter: true,
    steps,
  };
}

// ---------- Starter: Pine Tree ----------
function buildPineTree() {
  const steps = [];
  steps.push({
    name: 'Lay the grass',
    note: 'A patch of dark green tile under the tree.',
    bricks: [
      { x: 1, y: 1, z: 0, w: 4, d: 4, color: 'dgreen', type: 'tile' },
    ],
  });
  steps.push({
    name: 'Plant the trunk',
    note: 'Stack two brown cylinders as the trunk.',
    bricks: [
      { x: 2, y: 2, z: 1, w: 1, d: 1, color: 'brown', type: 'cylinder' },
      { x: 2, y: 2, z: 2, w: 1, d: 1, color: 'brown', type: 'cylinder' },
    ],
  });
  steps.push({
    name: 'First canopy layer',
    note: 'A wide green cone for the bottom of the canopy.',
    bricks: [
      { x: 1, y: 1, z: 3, w: 3, d: 3, h: 2, color: 'green', type: 'cone' },
    ],
  });
  steps.push({
    name: 'Mid canopy',
    note: 'A smaller green cone in the middle.',
    bricks: [
      { x: 1, y: 1, z: 5, w: 2, d: 2, h: 2, color: 'green', type: 'cone' },
    ],
  });
  steps.push({
    name: 'Top of the tree',
    note: 'A tiny green cone caps the tree.',
    bricks: [
      { x: 2, y: 2, z: 7, w: 1, d: 1, h: 2, color: 'green', type: 'cone' },
    ],
  });
  return {
    id: 'tree',
    name: 'Pine Tree',
    sub: 'Starter · nature',
    summary: 'A stacked-cone pine tree on a patch of grass — the easiest build.',
    diff: 1,
    time: '5 min',
    baseSize: { w: 6, d: 6 },
    baseColor: '#bccfa5',
    starter: true,
    steps,
  };
}

// Pre-build all the sets once
const SETS = {
  // Starters
  house: buildCozyHouse(),
  car: buildModernCar(),
  tree: buildPineTree(),
  // Harry Potter
  anglia: buildFordAnglia(),
  express: buildHogwartsExpress(),
  castle: buildHogwartsCastle(),
};

function flattenSet(set) {
  const bricks = [];
  let id = 1;
  set.steps.forEach((s, si) => {
    s.bricks.forEach(b => {
      bricks.push({ ...b, h: b.h ?? 1, id: `s${si}-${id++}`, step: si });
    });
  });
  return bricks;
}

Object.assign(window, { SETS, flattenSet });
