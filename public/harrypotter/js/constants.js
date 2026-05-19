const GRAVITY = 0.55;
const FRICTION = 0.82;
const AIR_FRICTION = 0.95;
const TILE = 32;

const HOUSES = {
  gryffindor: { name: 'Gryffindor', color: '#740001', bonus: 'extraHeart', desc: '+1 heart' },
  slytherin: { name: 'Slytherin', color: '#1a472a', bonus: 'cooldown', desc: '-10% spell cooldown' },
  ravenclaw: { name: 'Ravenclaw', color: '#0e1a40', bonus: 'xp', desc: '+25% House Points' },
  hufflepuff: { name: 'Hufflepuff', color: '#ecb939', bonus: 'invuln', desc: '+1s invincibility on hit' },
};

const SPELLS = {
  lumos: {
    id: 'lumos',
    name: 'Lumos',
    color: '#fff8dc',
    mana: 0,
    cooldown: 0,
    toggle: true,
    desc: 'Light dark areas; reveal hidden platforms',
  },
  wingardium: {
    id: 'wingardium',
    name: 'Wingardium Leviosa',
    color: '#b8e0f0',
    mana: 8,
    cooldown: 45,
    desc: 'Lift objects and enemies',
  },
  alohomora: {
    id: 'alohomora',
    name: 'Alohomora',
    color: '#d4af37',
    mana: 0,
    cooldown: 30,
    desc: 'Unlock doors and chests',
  },
  expelliarmus: {
    id: 'expelliarmus',
    name: 'Expelliarmus',
    color: '#ff6b6b',
    mana: 5,
    cooldown: 20,
    damage: 1,
    desc: 'Knock back enemies',
  },
  incendio: {
    id: 'incendio',
    name: 'Incendio',
    color: '#ff4500',
    mana: 12,
    cooldown: 35,
    damage: 2,
    desc: 'Cone of fire; burns vines',
  },
  stupefy: {
    id: 'stupefy',
    name: 'Stupefy',
    color: '#da70d6',
    mana: 10,
    cooldown: 25,
    damage: 1,
    stun: 120,
    desc: 'Stun enemies briefly',
  },
  reducto: {
    id: 'reducto',
    name: 'Reducto',
    color: '#ff1493',
    mana: 18,
    cooldown: 50,
    damage: 3,
    desc: 'Explosive blast; breaks cracked walls',
  },
};

const SPELL_ORDER = ['lumos', 'expelliarmus', 'stupefy', 'incendio', 'wingardium', 'alohomora', 'reducto'];

const GAME_STATE = {
  TITLE: 'title',
  HOUSE_SELECT: 'house',
  PLAYING: 'playing',
  BOSS: 'boss',
  PAUSED: 'paused',
  VICTORY: 'victory',
  GAME_OVER: 'gameover',
};
