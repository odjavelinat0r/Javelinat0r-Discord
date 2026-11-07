/**
 * @name LeCanard
 * @author Kerminat0r
 * @version 2.1.0
 * @description Un jeu incrémental dans Discord : clique sur le canard pour gagner des Coins, clic droit pour ouvrir la boutique. Tes vocaux, tes visiteurs et tes pings rapportent aussi.
 */

const PLUGIN = "LeCanard";
const DUCK_ID = "le-canard";
const GOLD_ID = "le-canard-dore";
const PANEL_ID = "le-canard-boutique";
const WORLD_ID = "le-canard-domaine";
const STRIP = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPIAAAAWCAYAAAD6vcEwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGCSURBVHhe7dkxTgJBGEfxbYwlpacwsfEixEMYz2HhFWz1GFaew9pwA9s13zyHHSbgwsLXvZf8A4Tht1RLwTCYmZmZmVl2Lw/D2K5/f2m6pEu6lOIGNG5W4/jzxjari+C6pEu6lOLuoPHY7OluOa5LuqRLWe4E/20YhrF0JqxLuqRLvdtukfv5OIx1z7cTHl+4fOmFsC7pki4dcsOKLXIL9Dot8PX1hMe+P672wnFHade+p0u6pEtZbimgdj369c6dop6v0NyFdUmXdCnL3dYfbtF2cxfu0yVd0qUsdwfuV+8K++4Oc7Au6ZIuZbn/wu0Ci7MVnYN1SZd0KcudhQOq2PrmeFiXdEmXstxSHOjBilakwu3z3unTJV3SpSz3IBwfbtdfpHf6dEmXdCnLLQVef9bbn/d9u+fP8aPSJV3SpSy31N8F+gV4Mqq7TZd0KcstxZ/VFejXnz0lXdIlXcpyS4G3ry+C6m7TJV3KctNgXdIlXUpxK1ofK3ourku6pEtL3F9Nh0t/+trLfwAAAABJRU5ErkJggg==";
const FRAMES = 11;
const CELL = 22;
const ZOOM = 2;
const SIZE = CELL * ZOOM;
const FRAME_MS = 110;
const SPEED = { walk: 0.8, stand: 0, sprint: 5, panic: 7 };
const SPRINT_MS = 3000;
const PANIC_MS = 6000;
const STAND_MS = 1500;
const PANIC_PINGS = 3;
const PANIC_WINDOW_MS = 30000;
const WATCH_MS = 1000;
const TICK_MS = 250;
const SAVE_MS = 15000;
const MAX_TICK_S = 60;
const OFFLINE_MAX_S = 8 * 3600;
const OFFLINE_MIN_S = 60;
const OFFLINE_RATE = 0.5;
const COST_GROWTH = 1.15;
const VOICE_BONUS = 1.5;
const FRENZY_BONUS = 5;
const FRENZY_MS = 30000;
const GOLD_SPEED = 3;
const GOLD_MIN_MS = 4 * 60000;
const GOLD_MAX_MS = 9 * 60000;
const VISITOR_SECONDS = 15;
const PING_SECONDS = 5;
const PRESTIGE_STEP = 1e6;
const FEATHER_BONUS = 0.1;
const WORLD_HEIGHT = 76;
const PIXEL = 2;
const CHAIN_MAX = 100;
const SHOW_MAX = 40;
const PATH_STEP = 2;
const CHAIN_GAP = 13;
const POP_MS = 450;
const GOLDEN_RATIO = 0.618034;
const COLORS = { g: "#3fa34d", b: "#2f7fd1", l: "#8fd0ff", r: "#c8383e", R: "#8e2428", w: "#f2efe6", s: "#9aa3ad", S: "#5c636c", d: "#8a5a2b", D: "#4f3219", p: "#f0c29a", y: "#f2c230", Y: "#b98a12", o: "#ef8a2c" };
const ART = {
  mare: [
    "........gg......gg........",
    "....bbbbbbbbbbbbbbbbbb....",
    "..bbbbllbbbbbbbbbbbbbbbb..",
    ".bbbbbbbbbbbbllbbbbbbbbbb.",
    "bbbbbbbbbbbbbbbbbbbbllbbbb",
    ".bbbllbbbbbbbbbbbbbbbbbbb.",
    "..bbbbbbbbbbbbbllbbbbbbb..",
    "....bbbbbbbbbbbbbbbbbb...."
  ],
  eleveur: [
    "...yyyy...",
    "..yyyyyy..",
    ".yyyyyyyy.",
    "...pppp...",
    "...pppp...",
    "..bbbbbb..",
    ".pbbbbbbp.",
    ".pbbbbbbp.",
    "..bbbbbb..",
    "..bb..bb..",
    "..bb..bb..",
    "..DD..DD.."
  ],
  ferme: [
    ".........rr.........",
    ".......rrrrrr.......",
    ".....rrrrrrrrrr.....",
    "...rrrrrwwwwrrrrr...",
    ".rrrrrrrwwwwrrrrrrr.",
    "rrrrrrrrrrrrrrrrrrrr",
    "DDDDDDDDDDDDDDDDDDDD",
    ".RRRRRRRRRRRRRRRRRR.",
    ".RRwwRRRRRRRRRRwwRR.",
    ".RRwwRRRRRRRRRRwwRR.",
    ".RRRRRRwwwwwwRRRRRR.",
    ".RRRRRRwRRRRwRRRRRR.",
    ".RRRRRRwRRRRwRRRRRR.",
    ".RRRRRRwRRRRwRRRRRR."
  ],
  usine: [
    "..SS.....SS...........",
    "..SS.....SS...........",
    "..SS.....SS...........",
    "..SS.....SS...........",
    "..SS.....SS.......s...",
    "ssSSsssssSSssss..sss..",
    "sssssssssssssss.sssss.",
    "ssssssssssssssssssssss",
    "ssyysssyysssyysssyysss",
    "ssyysssyysssyysssyysss",
    "ssssssssssssssssssssss",
    "ssyysssyysssyysssyysss",
    "ssyysssyysssyysssyysss",
    "ssssssssssssssssssssss",
    "SSSSSSSSSSSSSSSSSSSSSS"
  ],
  empire: [
    "............rr............",
    "............rrr...........",
    "............Y.............",
    "..y..y.....yyy.....y..y...",
    "..yyyy.....yyy.....yyyy...",
    "..yyyy....yyyyy....yyyy...",
    "..yyyy....yYyYy....yyyy...",
    "..yyyy.y.yyyyyyy.y.yyyy...",
    "..yyyyyyyyyyyyyyyyyyyyy...",
    "..yYyyyyyyyyyyyyyyyyyYy...",
    "..yyyyyyYyyyyyyyYyyyyyy...",
    "..yyyyyyyyyyyyyyyyyyyyy...",
    "..yyyyyyyyyDDDyyyyyyyyy...",
    "..yyyyyyyyDDDDDyyyyyyyy...",
    "..yyyyyyyyDDDDDyyyyyyyy...",
    "..yyyyyyyyDDDDDyyyyyyyy..."
  ]
};
const WORLD_ORDER = ["empire", "usine", "ferme", "mare", "eleveur"];
const SOUND_GAP_MS = 250;

const GENERATORS = [
  { id: "caneton", name: "Caneton", base: 15, rate: 0.1 },
  { id: "mare", name: "Mare", base: 100, rate: 1 },
  { id: "eleveur", name: "Éleveur", base: 1100, rate: 8 },
  { id: "ferme", name: "Ferme à canards", base: 12000, rate: 47 },
  { id: "usine", name: "Usine à coins", base: 130000, rate: 260 },
  { id: "empire", name: "Empire canard", base: 1400000, rate: 1400 }
];

const UPGRADES = [
  { id: "bec", name: "Bec renforcé", note: "Clics ×2", cost: 100 },
  { id: "pain", name: "Pain rassis", note: "Canetons ×2", cost: 500 },
  { id: "nenuphars", name: "Nénuphars", note: "Mares ×2", cost: 5000 },
  { id: "palmes", name: "Palmes dorées", note: "Clics ×3", cost: 10000 },
  { id: "synergie", name: "Coin-coin collectif", note: "Chaque clic ajoute 2 % de ton /s", cost: 50000 },
  { id: "syndicat", name: "Syndicat des canards", note: "Toute la production ×2", cost: 500000 }
];

const fresh = () => ({ coins: 0, run: 0, lifetime: 0, clicks: 0, feathers: 0, owned: {}, upgrades: [], savedAt: Date.now() });

// A damaged save must never break the game, so every number is checked.
function clean(saved) {
  const game = { ...fresh(), ...(saved && typeof saved === "object" ? saved : {}) };
  for (const key of ["coins", "run", "lifetime", "clicks", "feathers", "savedAt"]) {
    if (!Number.isFinite(game[key]) || game[key] < 0) game[key] = key === "savedAt" ? Date.now() : 0;
  }
  const owned = {};
  for (const generator of GENERATORS) {
    const count = game.owned?.[generator.id];
    owned[generator.id] = Number.isInteger(count) && count > 0 ? count : 0;
  }
  game.owned = owned;
  game.upgrades = Array.isArray(game.upgrades) ? game.upgrades.filter((id) => UPGRADES.some((u) => u.id === id)) : [];
  return game;
}

const has = (game, id) => game.upgrades.includes(id);
const featherBonus = (game) => 1 + game.feathers * FEATHER_BONUS;
const costOf = (generator, owned) => Math.ceil(generator.base * COST_GROWTH ** owned);

function rateOf(game, generator) {
  let rate = generator.rate;
  if (generator.id === "caneton" && has(game, "pain")) rate *= 2;
  if (generator.id === "mare" && has(game, "nenuphars")) rate *= 2;
  return rate;
}

function perSecond(game) {
  const base = GENERATORS.reduce((sum, g) => sum + game.owned[g.id] * rateOf(game, g), 0);
  return base * (has(game, "syndicat") ? 2 : 1) * featherBonus(game);
}

function perClick(game) {
  const base = (has(game, "bec") ? 2 : 1) * (has(game, "palmes") ? 3 : 1);
  return base * featherBonus(game) + (has(game, "synergie") ? perSecond(game) * 0.02 : 0);
}

function earn(game, amount) {
  game.coins += amount;
  game.run += amount;
  game.lifetime += amount;
}

function buyGenerator(game, id) {
  const generator = GENERATORS.find((g) => g.id === id);
  const cost = costOf(generator, game.owned[id]);
  if (game.coins < cost) return false;
  game.coins -= cost;
  game.owned[id]++;
  return true;
}

function buyUpgrade(game, id) {
  const upgrade = UPGRADES.find((u) => u.id === id);
  if (has(game, id) || game.coins < upgrade.cost) return false;
  game.coins -= upgrade.cost;
  game.upgrades.push(id);
  return true;
}

const prestigeGain = (game) => Math.floor(Math.sqrt(game.run / PRESTIGE_STEP));

function prestige(game) {
  const gain = prestigeGain(game);
  if (gain < 1) return game;
  return clean({ ...fresh(), feathers: game.feathers + gain, lifetime: game.lifetime, clicks: game.clicks });
}

function offlineGain(game, now) {
  const seconds = Math.min(OFFLINE_MAX_S, (now - game.savedAt) / 1000);
  return seconds >= OFFLINE_MIN_S ? perSecond(game) * seconds * OFFLINE_RATE : 0;
}

function format(value) {
  if (value < 10) return String(Math.floor(value * 10) / 10).replace(".", ",");
  if (value < 1000) return String(Math.floor(value));
  const units = ["k", "M", "Md", "Bn", "Bd", "Tn"];
  let scaled = value;
  let index = -1;
  while (scaled >= 1000 && index < units.length - 1) { scaled /= 1000; index++; }
  if (scaled >= 1000) return value.toExponential(2).replace(".", ",");
  return `${(Math.floor(scaled * 100) / 100).toString().replace(".", ",")} ${units[index]}`;
}

module.exports = class LeCanard {
  constructor(meta) {
    this.meta = meta;
  }

  store(name) {
    return BdApi.Webpack.Stores?.[name] ?? BdApi.Webpack.getStore?.(name);
  }

  get sound() {
    return BdApi.Data.load(PLUGIN, "sound") !== false;
  }

  get worldOn() {
    return BdApi.Data.load(PLUGIN, "world") !== false;
  }

  start() {
    this.voice = this.store("VoiceStateStore");
    this.selected = this.store("SelectedChannelStore");
    this.users = this.store("UserStore");
    this.dispatcher = this.voice?._dispatcher ?? this.users?._dispatcher;
    this.game = clean(BdApi.Data.load(PLUGIN, "game"));
    this.x = 80;
    this.direction = 1;
    this.mode = "walk";
    this.modeUntil = 0;
    this.pings = [];
    this.frame = 0;
    this.frameAt = 0;
    this.seen = null;
    this.channel = null;
    this.frenzyUntil = 0;
    this.rows = null;
    this.soundAt = 0;
    this.lastTick = Date.now();
    this.nextGold = Date.now() + this.goldDelay();
    this.build();
    const away = offlineGain(this.game, Date.now());
    if (away > 0) {
      earn(this.game, away);
      this.say(`Pendant ton absence : +${format(away)}`, 6000);
    }
    this.running = true;
    this.onFrame = (now) => this.step(now);
    requestAnimationFrame(this.onFrame);
    this.ticker = setInterval(() => this.tick(), TICK_MS);
    this.watcher = setInterval(() => this.watch(), WATCH_MS);
    this.saver = setInterval(() => this.save(), SAVE_MS);
    this.onMessage = (event) => this.message(event);
    this.dispatcher?.subscribe?.("MESSAGE_CREATE", this.onMessage);
  }

  stop() {
    this.running = false;
    clearInterval(this.ticker);
    clearInterval(this.watcher);
    clearInterval(this.saver);
    clearTimeout(this.bubbleTimer);
    this.dispatcher?.unsubscribe?.("MESSAGE_CREATE", this.onMessage);
    this.save();
    for (const id of [DUCK_ID, GOLD_ID, PANEL_ID, WORLD_ID]) document.getElementById(id)?.remove();
    this.audio?.close?.();
    this.audio = null;
  }

  save() {
    if (!this.game) return;
    this.game.savedAt = Date.now();
    BdApi.Data.save(PLUGIN, "game", this.game);
  }

  goldDelay() {
    return GOLD_MIN_MS + Math.random() * (GOLD_MAX_MS - GOLD_MIN_MS);
  }

  sprite(size, extra = "") {
    const node = document.createElement("div");
    node.style.cssText = `width:${size}px;height:${size}px;background:url(${STRIP}) 0 0/${FRAMES * size}px ${size}px no-repeat;image-rendering:pixelated;${extra}`;
    return node;
  }

  build() {
    const duck = document.createElement("div");
    duck.id = DUCK_ID;
    duck.title = "Clic : gagner des Coins. Clic droit : boutique.";
    duck.style.cssText = `position:fixed;left:0;bottom:0;z-index:9999;width:${SIZE}px;height:${SIZE}px;cursor:pointer;user-select:none`;
    const body = this.sprite(SIZE);
    const label = "position:absolute;left:50%;transform:translateX(-50%);padding:1px 6px;border-radius:7px;font:700 11px var(--font-primary,sans-serif);white-space:nowrap;pointer-events:none";
    const counter = document.createElement("div");
    counter.style.cssText = `${label};bottom:100%;background:rgba(17,18,20,.85);color:#ffd84d`;
    const bubble = document.createElement("div");
    bubble.style.cssText = `${label};bottom:calc(100% + 20px);background:#fff;color:#111;display:none`;
    duck.append(body, counter, bubble);
    duck.onclick = () => this.peck();
    duck.oncontextmenu = (e) => { e.preventDefault(); this.togglePanel(); };
    document.body.append(duck);
    this.element = duck;
    this.body = body;
    this.counter = counter;
    this.bubble = bubble;
    this.buildWorld();
    this.showCount();
  }

  // One canvas draws everything you own, so hundreds of sprites stay cheap. It ignores the
  // mouse, so Discord underneath still works.
  buildWorld() {
    const canvas = document.createElement("canvas");
    canvas.id = WORLD_ID;
    canvas.height = WORLD_HEIGHT;
    canvas.style.cssText = `position:fixed;left:0;bottom:0;z-index:9998;pointer-events:none;image-rendering:pixelated;display:${this.worldOn ? "block" : "none"}`;
    document.body.append(canvas);
    this.canvas = canvas;
    this.sprites = {};
    for (const [name, rows] of Object.entries(ART)) this.sprites[name] = this.paint(rows);
    this.strip = new Image();
    this.strip.src = STRIP;
    this.path = [];
    this.pathX = this.x;
    this.seenOwned = {};
    this.popAt = {};
  }

  paint(rows) {
    const art = document.createElement("canvas");
    art.width = Math.max(...rows.map((row) => row.length)) * PIXEL;
    art.height = rows.length * PIXEL;
    const pen = art.getContext("2d");
    rows.forEach((row, y) => [...row].forEach((cell, x) => {
      if (!COLORS[cell]) return;
      pen.fillStyle = COLORS[cell];
      pen.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
    }));
    return art;
  }

  // Remembers where the duck walked, so the babies follow in its footsteps and turn at the walls.
  recordPath() {
    while (Math.abs(this.x - this.pathX) >= PATH_STEP) {
      const step = Math.sign(this.x - this.pathX) * PATH_STEP;
      this.pathX += step;
      this.path.unshift({ x: this.pathX, direction: Math.sign(step) });
    }
    const keep = (CHAIN_MAX + 1) * CHAIN_GAP;
    if (this.path.length > keep) this.path.length = keep;
  }

  chainSpot(index) {
    const at = (index + 1) * CHAIN_GAP;
    if (at < this.path.length) return this.path[at];
    const last = this.path[this.path.length - 1] ?? { x: this.x, direction: this.direction };
    const limit = Math.max(SIZE, window.innerWidth - SIZE);
    const behind = last.x - last.direction * (at - this.path.length + 1) * PATH_STEP;
    return { x: Math.max(0, Math.min(limit, behind)), direction: last.direction };
  }

  worldSpot(name, index, width, now) {
    const seed = WORLD_ORDER.indexOf(name) * 0.17 + 0.05;
    const room = Math.max(1, this.canvas.width - width);
    const home = ((seed + (index + 1) * GOLDEN_RATIO) % 1) * room;
    if (name !== "eleveur") return { x: home, direction: 1 };
    const distance = (home + now * 0.03 * (1 + (index % 3) * 0.3)) % (room * 2);
    return distance < room ? { x: distance, direction: 1 } : { x: room * 2 - distance, direction: -1 };
  }

  drawWorld(now) {
    if (!this.worldOn) return;
    const canvas = this.canvas;
    if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
    const pen = canvas.getContext("2d");
    pen.imageSmoothingEnabled = false;
    pen.clearRect(0, 0, canvas.width, WORLD_HEIGHT);
    for (const generator of GENERATORS) {
      const owned = this.game.owned[generator.id];
      if (this.seenOwned[generator.id] !== undefined && owned > this.seenOwned[generator.id]) this.popAt[generator.id] = now;
      this.seenOwned[generator.id] = owned;
    }
    for (const name of WORLD_ORDER) this.drawGroup(pen, name, now);
    this.drawChain(pen, now);
  }

  hop(id, index, count, now) {
    const age = now - (this.popAt[id] ?? -Infinity);
    return index === count - 1 && age < POP_MS ? Math.sin((age / POP_MS) * Math.PI) * 14 : 0;
  }

  drawGroup(pen, name, now) {
    const owned = this.game.owned[name];
    const count = Math.min(SHOW_MAX, owned);
    const art = this.sprites[name];
    let spot = null;
    for (let index = 0; index < count; index++) {
      spot = this.worldSpot(name, index, art.width, now);
      const bob = name === "eleveur" ? Math.abs(Math.sin(now / 160 + index)) * 2 : 0;
      const y = WORLD_HEIGHT - art.height - bob - this.hop(name, index, count, now);
      this.drawFlipped(pen, art, Math.round(spot.x), Math.round(y), spot.direction);
      if (name === "usine") this.drawSmoke(pen, spot.x, y, now + index * 370);
    }
    if (owned > count) this.label(pen, `×${owned}`, spot.x + art.width / 2, WORLD_HEIGHT - art.height - 4);
  }

  drawFlipped(pen, art, x, y, direction) {
    pen.save();
    pen.translate(direction < 0 ? x + art.width : x, y);
    pen.scale(direction < 0 ? -1 : 1, 1);
    pen.drawImage(art, 0, 0);
    pen.restore();
  }

  drawSmoke(pen, x, y, now) {
    for (const chimney of [4, 18]) {
      const rise = (now / 40) % 16;
      pen.fillStyle = `rgba(200,205,212,${0.7 - rise / 24})`;
      pen.fillRect(Math.round(x + chimney + rise / 4), Math.round(y - rise), 4, 4);
    }
  }

  drawChain(pen, now) {
    if (!this.strip.complete || !this.strip.naturalWidth) return;
    const owned = this.game.owned.caneton;
    const count = Math.min(CHAIN_MAX, owned);
    let spot = null;
    for (let index = 0; index < count; index++) {
      spot = this.chainSpot(index);
      const sheetX = ((this.frame + index) % FRAMES) * CELL;
      const y = WORLD_HEIGHT - CELL - this.hop("caneton", index, count, now);
      const left = Math.round(spot.x + (SIZE - CELL) / 2);
      pen.save();
      pen.translate(spot.direction < 0 ? left + CELL : left, y);
      pen.scale(spot.direction < 0 ? -1 : 1, 1);
      pen.drawImage(this.strip, sheetX, 0, CELL, CELL, 0, 0, CELL, CELL);
      pen.restore();
    }
    if (owned > count) this.label(pen, `×${owned}`, spot.x + SIZE / 2, WORLD_HEIGHT - CELL - 4);
  }

  label(pen, text, x, y) {
    pen.font = "700 11px sans-serif";
    pen.textAlign = "center";
    pen.lineWidth = 3;
    pen.strokeStyle = "#111214";
    pen.fillStyle = "#ffd84d";
    pen.strokeText(text, x, y);
    pen.fillText(text, x, y);
  }

  showCount() {
    this.counter.textContent = `${format(this.game.coins)} Coins`;
  }

  say(text, ms) {
    this.bubble.textContent = text;
    this.bubble.style.display = "block";
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => { this.bubble.style.display = "none"; }, ms);
  }

  setMode(mode, ms) {
    this.mode = mode;
    this.modeUntil = performance.now() + ms;
  }

  multiplier() {
    return (this.channel ? VOICE_BONUS : 1) * (Date.now() < this.frenzyUntil ? FRENZY_BONUS : 1);
  }

  tick() {
    try {
      const now = Date.now();
      const elapsed = Math.max(0, Math.min(MAX_TICK_S, (now - this.lastTick) / 1000));
      this.lastTick = now;
      earn(this.game, perSecond(this.game) * this.multiplier() * elapsed);
      this.showCount();
      this.updatePanel();
      if (now >= this.nextGold && !document.getElementById(GOLD_ID)) this.spawnGold();
    } catch (e) {
      console.error(`[${PLUGIN}] tick failed`, e);
    }
  }

  // Clicking stops the duck so it stays easy to hit.
  peck() {
    const gain = perClick(this.game) * (Date.now() < this.frenzyUntil ? FRENZY_BONUS : 1);
    earn(this.game, gain);
    this.game.clicks++;
    this.showCount();
    this.updatePanel();
    this.setMode("stand", STAND_MS);
    this.floatText(`+${format(gain)}`);
    this.quack();
  }

  floatText(text) {
    const node = document.createElement("div");
    node.textContent = text;
    node.style.cssText = "position:absolute;left:50%;top:0;color:#ffd84d;font:700 13px var(--font-primary,sans-serif);text-shadow:0 1px 2px #000;pointer-events:none;transition:transform .6s ease-out,opacity .6s ease-out";
    this.element.append(node);
    requestAnimationFrame(() => { node.style.transform = "translate(-50%,-34px)"; node.style.opacity = "0"; });
    setTimeout(() => node.remove(), 650);
  }

  spawnGold() {
    this.nextGold = Date.now() + this.goldDelay();
    const gold = document.createElement("div");
    gold.id = GOLD_ID;
    gold.title = "Attrape-le !";
    gold.style.cssText = `position:fixed;left:0;bottom:0;z-index:9999;width:${SIZE}px;height:${SIZE}px;cursor:pointer;filter:sepia(1) saturate(4) brightness(1.2) drop-shadow(0 0 6px #ffd84d)`;
    gold.append(this.sprite(SIZE, "transform:scaleX(-1)"));
    gold.onclick = () => this.catchGold();
    document.body.append(gold);
    this.goldX = window.innerWidth;
  }

  catchGold() {
    document.getElementById(GOLD_ID)?.remove();
    this.frenzyUntil = Date.now() + FRENZY_MS;
    this.say(`FRÉNÉSIE ×${FRENZY_BONUS} pendant 30 s !`, 4000);
  }

  step(now) {
    if (!this.running) return;
    try {
      if (this.mode !== "walk" && now >= this.modeUntil) this.mode = "walk";
      const limit = Math.max(SIZE, window.innerWidth - SIZE);
      if (this.mode === "panic" && Math.random() < 0.06) this.direction *= -1;
      this.x += SPEED[this.mode] * this.direction;
      if (this.x <= 0) { this.x = 0; this.direction = 1; }
      if (this.x >= limit) { this.x = limit; this.direction = -1; }
      const wait = this.mode === "walk" ? FRAME_MS : FRAME_MS / 3;
      if (this.mode !== "stand" && now - this.frameAt >= wait) {
        this.frameAt = now;
        this.frame = (this.frame + 1) % FRAMES;
        this.body.style.backgroundPositionX = `${-this.frame * SIZE}px`;
      }
      this.element.style.transform = `translateX(${this.x}px)`;
      this.body.style.transform = `scaleX(${this.direction})`;
      this.recordPath();
      this.drawWorld(now);
      const gold = document.getElementById(GOLD_ID);
      if (gold) {
        this.goldX -= GOLD_SPEED;
        gold.style.transform = `translateX(${this.goldX}px)`;
        if (this.goldX < -SIZE) gold.remove();
      }
    } catch (e) {
      console.error(`[${PLUGIN}] step failed`, e);
    }
    requestAnimationFrame(this.onFrame);
  }

  // Your own arrival doesn't count: the list is only compared inside the same channel.
  watch() {
    try {
      const channel = this.selected?.getVoiceChannelId?.() ?? null;
      const states = channel ? this.voice?.getVoiceStatesForChannel?.(channel) : null;
      const ids = new Set(states ? Object.entries(states).map(([key, state]) => state?.userId ?? key) : []);
      if (channel && channel === this.channel && this.seen && [...ids].some((id) => !this.seen.has(id))) {
        const gain = Math.max(10, perSecond(this.game) * VISITOR_SECONDS);
        earn(this.game, gain);
        this.setMode("sprint", SPRINT_MS);
        this.say(`Un visiteur ! +${format(gain)}`, SPRINT_MS);
      }
      this.channel = channel;
      this.seen = ids;
    } catch (e) {
      console.error(`[${PLUGIN}] watch failed`, e);
    }
  }

  message(event) {
    try {
      const me = this.users?.getCurrentUser?.()?.id;
      const mentioned = (event?.message?.mentions ?? []).some((user) => (user?.id ?? user) === me);
      if (!me || !mentioned) return;
      earn(this.game, Math.max(2, perSecond(this.game) * PING_SECONDS));
      const now = performance.now();
      this.pings = [...this.pings.filter((at) => now - at < PANIC_WINDOW_MS), now];
      if (this.pings.length >= PANIC_PINGS) {
        this.pings = [];
        this.setMode("panic", PANIC_MS);
        this.say("AAAAH TROP DE PINGS", PANIC_MS);
      }
    } catch (e) {
      console.error(`[${PLUGIN}] ping check failed`, e);
    }
  }

  togglePanel() {
    const open = document.getElementById(PANEL_ID);
    if (open) { open.remove(); this.rows = null; return; }
    this.buildPanel();
    this.updatePanel();
  }

  button(label) {
    const node = document.createElement("button");
    node.textContent = label;
    node.style.cssText = "flex:none;min-width:84px;padding:5px 8px;border:none;border-radius:4px;background:#5865f2;color:#fff;font:600 12px var(--font-primary,sans-serif);cursor:pointer";
    return node;
  }

  heading(text) {
    const node = document.createElement("div");
    node.textContent = text;
    node.style.cssText = "margin:10px 0 4px;font-weight:700;color:#b5bac1;font-size:11px;text-transform:uppercase";
    return node;
  }

  row(title, note, button) {
    const line = document.createElement("div");
    line.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0";
    const text = document.createElement("div");
    text.style.cssText = "min-width:0";
    const name = document.createElement("div");
    name.textContent = title;
    name.style.fontWeight = "600";
    const small = document.createElement("div");
    small.textContent = note;
    small.style.cssText = "font-size:11px;color:#b5bac1";
    text.append(name, small);
    line.append(text, button);
    return { line, name, small };
  }

  buildPanel() {
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.cssText = "position:fixed;right:20px;bottom:60px;z-index:10002;width:300px;max-height:min(560px,calc(100vh - 90px));overflow-y:auto;padding:12px 14px;border-radius:10px;background:rgba(17,18,20,.96);color:#fff;font:13px var(--font-primary,sans-serif);box-shadow:0 8px 24px rgba(0,0,0,.5)";
    const top = document.createElement("div");
    top.style.cssText = "display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px";
    const title = document.createElement("span");
    title.textContent = "La boutique du canard";
    const close = document.createElement("span");
    close.textContent = "✕";
    close.style.cursor = "pointer";
    close.onclick = () => this.togglePanel();
    top.append(title, close);
    const stats = document.createElement("div");
    stats.style.cssText = "margin-top:6px;white-space:pre-line;color:#ffd84d";
    panel.append(top, stats, this.heading("Production"));
    this.rows = { stats, generators: [], upgrades: [] };
    for (const generator of GENERATORS) {
      const action = this.button("");
      action.onclick = () => { if (buyGenerator(this.game, generator.id)) { this.save(); this.updatePanel(); } };
      const row = this.row(generator.name, "", action);
      this.rows.generators.push({ generator, action, row });
      panel.append(row.line);
    }
    panel.append(this.heading("Améliorations"));
    for (const upgrade of UPGRADES) {
      const action = this.button(format(upgrade.cost));
      action.onclick = () => { if (buyUpgrade(this.game, upgrade.id)) { this.save(); this.updatePanel(); } };
      const row = this.row(upgrade.name, upgrade.note, action);
      this.rows.upgrades.push({ upgrade, action, row });
      panel.append(row.line);
    }
    panel.append(this.heading("Grand Envol"));
    const about = document.createElement("div");
    about.style.cssText = "font-size:11px;color:#b5bac1;margin-bottom:6px";
    about.textContent = "Recommence à zéro et garde des plumes : chacune donne +10 % à tout, pour toujours.";
    const leap = this.button("");
    leap.style.width = "100%";
    leap.onclick = () => this.leap();
    panel.append(about, leap);
    this.rows.leap = leap;
    document.body.append(panel);
  }

  setEnabled(node, enabled) {
    node.disabled = !enabled;
    node.style.opacity = enabled ? "1" : ".45";
    node.style.cursor = enabled ? "pointer" : "default";
  }

  updatePanel() {
    if (!this.rows) return;
    const game = this.game;
    const bonus = [];
    if (this.channel) bonus.push(`En vocal ×${String(VOICE_BONUS).replace(".", ",")}`);
    if (Date.now() < this.frenzyUntil) bonus.push(`Frénésie ×${FRENZY_BONUS}`);
    this.rows.stats.textContent = [
      `${format(game.coins)} Coins`,
      `${format(perSecond(game))} /s · ${format(perClick(game))} par clic`,
      `Plumes : ${game.feathers} (+${Math.round(game.feathers * FEATHER_BONUS * 100)} %)`,
      ...(bonus.length ? [bonus.join(" · ")] : [])
    ].join("\n");
    for (const { generator, action, row } of this.rows.generators) {
      const owned = game.owned[generator.id];
      const cost = costOf(generator, owned);
      row.small.textContent = `${owned} possédés · ${format(rateOf(game, generator))} /s chacun`;
      action.textContent = format(cost);
      this.setEnabled(action, game.coins >= cost);
    }
    for (const { upgrade, action, row } of this.rows.upgrades) {
      const bought = has(game, upgrade.id);
      row.line.style.display = bought ? "none" : "flex";
      this.setEnabled(action, !bought && game.coins >= upgrade.cost);
    }
    const gain = prestigeGain(game);
    if (!this.leapArmed) this.rows.leap.textContent = gain > 0 ? `S'envoler (+${gain} plumes)` : `Il te faut ${format(PRESTIGE_STEP)} Coins gagnés`;
    this.setEnabled(this.rows.leap, gain > 0);
  }

  // Two clicks, because this wipes the current game.
  leap() {
    if (prestigeGain(this.game) < 1) return;
    if (!this.leapArmed) {
      this.leapArmed = true;
      this.rows.leap.textContent = "Sûr ? Clique encore pour confirmer";
      clearTimeout(this.leapTimer);
      this.leapTimer = setTimeout(() => { this.leapArmed = false; this.updatePanel(); }, 4000);
      return;
    }
    clearTimeout(this.leapTimer);
    this.leapArmed = false;
    this.game = prestige(this.game);
    this.save();
    this.showCount();
    this.updatePanel();
    this.say("Le canard s'envole !", 3000);
  }

  quack() {
    const now = performance.now();
    if (!this.sound || now - this.soundAt < SOUND_GAP_MS) return;
    this.soundAt = now;
    try {
      this.audio ??= new AudioContext();
      const start = this.audio.currentTime;
      const tone = this.audio.createOscillator();
      const gain = this.audio.createGain();
      tone.type = "sawtooth";
      tone.frequency.setValueAtTime(420, start);
      tone.frequency.exponentialRampToValueAtTime(220, start + 0.1);
      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.11);
      tone.connect(gain).connect(this.audio.destination);
      tone.start(start);
      tone.stop(start + 0.12);
    } catch (e) {
      console.error(`[${PLUGIN}] sound failed`, e);
    }
  }

  getSettingsPanel() {
    return BdApi.UI.buildSettingsPanel({
      settings: [
        { type: "switch", id: "sound", name: "Bruit des coin-coin", value: this.sound },
        { type: "switch", id: "world", name: "Afficher le domaine en bas de l'écran", value: this.worldOn }
      ],
      onChange: (_, id, value) => {
        BdApi.Data.save(PLUGIN, id, value);
        if (id === "world" && this.canvas) this.canvas.style.display = value ? "block" : "none";
      }
    });
  }
};

Object.assign(module.exports, { clean, perSecond, perClick, costOf, buyGenerator, buyUpgrade, prestige, prestigeGain, offlineGain, format, earn });
