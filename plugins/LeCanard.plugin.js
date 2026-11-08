/**
 * @name LeCanard
 * @author Kerminat0r
 * @version 3.0.0
 * @description Un grand jeu incrémental dans Discord : Coins, marché du Pain, expéditions, élevage, arbre de plumes, défis, saisons et plus. Clic sur le canard pour gagner, clic droit pour ouvrir le jeu.
 */

const SAVE_VERSION = 3;
const COST_GROWTH = 1.15;
const FRENZY_BONUS = 5;
const VOICE_BONUS = 1.5;
const OFFLINE_MIN_S = 60;
const PRESTIGE_STEP = 1e7;
const FEATHER_BONUS = 0.02;
const ACHIEVEMENT_BONUS = 0.01;
const STAR_BONUS = 0.5;
const COIN_LIMIT = 1e300;
const CHALLENGE_BONUS = 1.2;
const CHALLENGE_GOAL = 1e8;
const SEASON_FEATHERS = 100;
const BREAD_PER_SECOND = 1;
const BREAD_CAPACITY = 7200;
const BREAD_FEE = 0.05;
const BREAD_TAX = 0.05;
const HUNGER_FILL_S = 1800;
const HUNGER_DROP = 0.4;
const MARKET_SLOT_MS = 5 * 60000;
const MARKET_UNLOCK = 50000;
const EXPEDITION_UNLOCK = 10;
const EXPEDITION_SLOTS = 2;
const EXPEDITION_MIN = 5;
const DEFENSE_UNLOCK = 1e6;
const DOG_BASE = 25000;
const DOG_GROWTH = 2.5;
const DOG_CHANCE = 0.15;
const DOG_MAX_CHANCE = 0.9;
const HATCH_MS = 30 * 60000;
const BREED_MS = 60 * 60000;
const BREED_BREAD = 500;
const DUCK_LIMIT = 30;
const TEAM_SIZE = 3;
const SHINY_CHANCE = 0.02;
const FRAGMENTS_PER_FEATHER = 10;
const GIFT_LIMIT = 100000;

const GENERATORS = [
  { id: "caneton", name: "Caneton", base: 15, rate: 0.1 },
  { id: "mare", name: "Mare", base: 100, rate: 1 },
  { id: "eleveur", name: "Éleveur", base: 1100, rate: 8 },
  { id: "ferme", name: "Ferme à canards", base: 12000, rate: 47 },
  { id: "usine", name: "Usine à coins", base: 130000, rate: 260 },
  { id: "empire", name: "Empire canard", base: 1400000, rate: 1400 },
  { id: "temple", name: "Temple du Coin", base: 2e7, rate: 7800, season: 1 },
  { id: "cite", name: "Cité-Canard", base: 3.3e8, rate: 44000, season: 2 },
  { id: "station", name: "Station orbitale", base: 5.1e9, rate: 260000, season: 3 }
];

const UPGRADES = [
  { id: "bec", name: "Bec renforcé", note: "Clics ×2", cost: 100 },
  { id: "pain", name: "Pain rassis", note: "Canetons ×2", cost: 500 },
  { id: "nenuphars", name: "Nénuphars", note: "Mares ×2", cost: 5000 },
  { id: "palmes", name: "Palmes dorées", note: "Clics ×3", cost: 10000 },
  { id: "synergie", name: "Coin-coin collectif", note: "Chaque clic ajoute 2 % de ton /s", cost: 50000 },
  { id: "syndicat", name: "Syndicat des canards", note: "Toute la production ×2", cost: 500000 }
];

const TREE = [
  { id: "c1", branch: "Clics", name: "Bec d'acier", note: "Clics ×2", cost: 1 },
  { id: "c2", branch: "Clics", name: "Coup critique", note: "5 % de chance de clic ×10", cost: 3, needs: "c1" },
  { id: "c3", branch: "Clics", name: "Grande synergie", note: "Chaque clic ajoute 3 % de ton /s", cost: 5, needs: "c2" },
  { id: "c4", branch: "Clics", name: "Main de maître", note: "Clics ×3", cost: 10, needs: "c3" },
  { id: "c5", branch: "Clics", name: "Coin ultime", note: "Clics ×2 de plus en frénésie", cost: 20, needs: "c4" },
  { id: "p1", branch: "Production", name: "Mares profondes", note: "Production ×1,5", cost: 1 },
  { id: "p2", branch: "Production", name: "Travail à la chaîne", note: "Production ×2", cost: 4, needs: "p1" },
  { id: "p3", branch: "Production", name: "Sieste rentable", note: "Gains hors ligne à 75 %", cost: 6, needs: "p2" },
  { id: "p4", branch: "Production", name: "Longue absence", note: "Hors ligne jusqu'à 16 h", cost: 10, needs: "p3" },
  { id: "p5", branch: "Production", name: "Âge d'or", note: "Production ×3", cost: 25, needs: "p4" },
  { id: "e1", branch: "Expéditions", name: "Second camp", note: "+1 expédition à la fois", cost: 2 },
  { id: "e2", branch: "Expéditions", name: "Cartes précises", note: "Risque -30 %", cost: 4, needs: "e1" },
  { id: "e3", branch: "Expéditions", name: "Grands sacs", note: "Butin ×2", cost: 6, needs: "e2" },
  { id: "e4", branch: "Expéditions", name: "Vent arrière", note: "Durée -25 %", cost: 12, needs: "e3" },
  { id: "e5", branch: "Expéditions", name: "Armada", note: "+1 expédition à la fois", cost: 20, needs: "e4" },
  { id: "g1", branch: "Gestion", name: "Grand grenier", note: "Stock de Pain ×3", cost: 2 },
  { id: "g2", branch: "Gestion", name: "Sans commission", note: "Pas de frais au marché", cost: 5, needs: "g1" },
  { id: "g3", branch: "Gestion", name: "Petits appétits", note: "Consommation de Pain ÷2", cost: 8, needs: "g2" },
  { id: "g4", branch: "Gestion", name: "Couveuse double", note: "Éclosion et élevage ÷2", cost: 12, needs: "g3" },
  { id: "g5", branch: "Gestion", name: "Chasse au trésor", note: "Canard doré 2× plus souvent", cost: 18, needs: "g4" }
];

const RELICS = [
  { id: "r1", name: "Coupe du champion", note: "Production ×1,5", cost: 5 },
  { id: "r2", name: "Sifflet ancien", note: "Risque d'expédition -20 %", cost: 10 },
  { id: "r3", name: "Œil de lynx", note: "Clics ×2", cost: 15 },
  { id: "r4", name: "Fer à cheval", note: "Butin ×1,5", cost: 25 },
  { id: "r5", name: "Couronne du Coin", note: "Plumes gagnées ×1,5", cost: 50 }
];

const CHALLENGES = [
  { id: "mains", name: "Sans les mains", note: "Les clics ne rapportent rien", noClick: true },
  { id: "mares", name: "Que des Mares", note: "Seules les Mares sont en vente", onlyMare: true },
  { id: "regime", name: "Régime sec", note: "Marché fermé et faim permanente", noMarket: true },
  { id: "austerite", name: "Austérité", note: "Aucune amélioration", noUpgrades: true },
  { id: "inflation", name: "Inflation", note: "Tout coûte 3× plus cher", dear: true },
  { id: "solitaire", name: "Canard solitaire", note: "Pas d'expédition ni d'équipe", noTeam: true }
];

const ZONES = [
  { id: "etang", name: "Étang voisin", hours: 1 / 6, risk: 0.05, egg: 0.1, gem: 0.05, fragment: 1 },
  { id: "foret", name: "Forêt sombre", hours: 1, risk: 0.12, egg: 0.3, gem: 0.2, fragment: 3 },
  { id: "montagne", name: "Montagne glacée", hours: 4, risk: 0.2, egg: 0.6, gem: 0.6, fragment: 8 },
  { id: "mer", name: "Mer lointaine", hours: 8, risk: 0.3, egg: 1, gem: 1.2, fragment: 16 }
];

const TRAITS = {
  prod: { name: "Travailleur", note: "production", value: 0.1 },
  click: { name: "Rapide", note: "clics", value: 0.2 },
  loot: { name: "Chanceux", note: "butin", value: 0.1 },
  risk: { name: "Éclaireur", note: "risque", value: 0.05 },
  gold: { name: "Doré", note: "canard doré", value: 0.1 },
  cost: { name: "Bâtisseur", note: "coûts", value: 0.01 }
};
const TRAIT_IDS = Object.keys(TRAITS);
const RARITIES = ["Commun", "Rare", "Épique", "Légendaire"];
const DUCK_NAMES = ["Gaston", "Coincoin", "Patrice", "Bernadette", "Plouf", "Monsieur Bec", "Duchesse", "Nugget", "Biscotte", "Capitaine", "Tartine", "Roger"];

const QUESTS = [
  { id: "clics", name: "Clique {n} fois", stat: "clicks", goal: 300 },
  { id: "or", name: "Attrape {n} canard doré", stat: "goldCaught", goal: 1 },
  { id: "exp", name: "Termine {n} expéditions", stat: "expeditions", goal: 2 },
  { id: "marche", name: "Fais {n} échanges au marché", stat: "trades", goal: 3 },
  { id: "renard", name: "Chasse {n} renards", stat: "foxes", goal: 2 },
  { id: "vocal", name: "Passe {n} minutes en vocal", stat: "voiceSeconds", goal: 1800, scale: 60 }
];

const ACHIEVEMENTS = [];
function tiers(prefix, label, read, goals) {
  goals.forEach((goal, index) => ACHIEVEMENTS.push({ id: `${prefix}${index}`, name: `${label} ${index + 1}`, goal, read }));
}
tiers("coins", "Tas de Coins", (g) => g.lifetime, [1e3, 1e5, 1e7, 1e9, 1e11, 1e13, 1e16, 1e20]);
tiers("click", "Doigt d'or", (g) => g.clicks, [100, 1000, 10000, 100000]);
for (const generator of GENERATORS) tiers(`own-${generator.id}-`, generator.name, (g) => g.owned[generator.id], [1, 25, 100]);
tiers("leap", "Grand voyageur", (g) => g.stats.leaps, [1, 5, 25]);
tiers("gold", "Chasseur d'or", (g) => g.stats.goldCaught, [1, 10, 50]);
tiers("exp", "Explorateur", (g) => g.stats.expeditions, [1, 10, 100]);
tiers("fox", "Garde-chasse", (g) => g.stats.foxes, [1, 25, 100]);
tiers("duck", "Collectionneur", (g) => g.ducks.length, [1, 10, 25]);
tiers("defi", "Sans peur", (g) => g.challengesDone.length, [1, 3, 6]);
tiers("season", "Vétéran", (g) => g.season, [1, 2, 3]);
tiers("trade", "Boulanger", (g) => g.stats.trades, [10, 100]);
tiers("voice", "Bavard", (g) => g.stats.voiceSeconds, [3600, 36000]);

const STATS = ["leaps", "goldCaught", "expeditions", "foxes", "trades", "voiceSeconds", "gifts"];

const fresh = () => ({
  version: SAVE_VERSION, coins: 0, run: 0, lifetime: 0, clicks: 0, feathers: 0, feathersTotal: 0, stars: 0, season: 0,
  owned: {}, upgrades: [], tree: [], relics: [], savedAt: Date.now(), bread: 0, hunger: 0, dogs: 0,
  gems: 0, eggs: 0, fragments: 0, expeditions: [], nextId: 1, ducks: [], team: [], nest: null,
  challenge: null, challengesDone: [], achievements: [], stats: {}, daily: null, codesUsed: [], codesSent: []
});

// Old saves earned plumes from a formula that ran away, so large piles are compressed once.
function compressFeathers(amount) {
  return amount <= 10 ? Math.floor(amount) : 10 + Math.floor(10 * Math.log10(amount / 10));
}

const positive = (value) => (Number.isFinite(value) && value > 0 ? value : 0);
const list = (value) => (Array.isArray(value) ? value : []);

// A damaged save must never break the game, so every number is checked.
function clean(saved) {
  const input = saved && typeof saved === "object" ? saved : {};
  const game = { ...fresh(), ...input };
  for (const key of ["coins", "run", "lifetime", "clicks", "feathers", "feathersTotal", "stars", "season", "bread", "hunger", "dogs", "gems", "eggs", "fragments"]) game[key] = positive(game[key]);
  if (!Number.isFinite(game.savedAt) || game.savedAt <= 0) game.savedAt = Date.now();
  game.nextId = Math.max(1, Math.floor(positive(game.nextId)));
  game.hunger = Math.min(1, game.hunger);
  const owned = {};
  for (const generator of GENERATORS) {
    const count = game.owned?.[generator.id];
    owned[generator.id] = Number.isInteger(count) && count > 0 ? count : 0;
  }
  game.owned = owned;
  game.upgrades = list(game.upgrades).filter((id) => UPGRADES.some((u) => u.id === id));
  game.tree = list(game.tree).filter((id) => TREE.some((n) => n.id === id));
  game.relics = list(game.relics).filter((id) => RELICS.some((r) => r.id === id));
  game.achievements = list(game.achievements).filter((id) => ACHIEVEMENTS.some((a) => a.id === id));
  game.challengesDone = list(game.challengesDone).filter((id) => CHALLENGES.some((c) => c.id === id));
  game.challenge = CHALLENGES.some((c) => c.id === game.challenge) ? game.challenge : null;
  game.expeditions = list(game.expeditions).filter((e) => e && ZONES.some((z) => z.id === e.zone) && Number.isFinite(e.end) && e.ducklings > 0);
  game.ducks = list(game.ducks).filter((d) => d && d.id && Array.isArray(d.traits));
  game.team = list(game.team).filter((id) => game.ducks.some((d) => d.id === id)).slice(0, TEAM_SIZE);
  game.codesUsed = list(game.codesUsed);
  game.codesSent = list(game.codesSent);
  const stats = {};
  for (const key of STATS) stats[key] = positive(game.stats?.[key]);
  game.stats = stats;
  if (!(input.version >= SAVE_VERSION)) {
    if (input.version === undefined && game.feathers > 0) {
      game.feathers = compressFeathers(game.feathers);
      game.run = Math.min(game.run, PRESTIGE_STEP * 1000);
    }
    game.feathersTotal = Math.max(game.feathersTotal, game.feathers);
    game.version = SAVE_VERSION;
  }
  return game;
}

const has = (game, id) => game.upgrades.includes(id);
const hasNode = (game, id) => game.tree.includes(id);
const hasRelic = (game, id) => game.relics.includes(id);
const activeChallenge = (game) => CHALLENGES.find((c) => c.id === game.challenge) ?? null;
const duckById = (game, id) => game.ducks.find((d) => d.id === id);

function duckBonus(game, trait) {
  if (activeChallenge(game)?.noTeam) return 0;
  let total = 0;
  for (const id of game.team) {
    const duck = duckById(game, id);
    if (!duck) continue;
    const power = (1 + duck.rarity) * (duck.shiny ? 2 : 1);
    for (const owned of duck.traits) if (owned === trait) total += TRAITS[trait].value * power;
  }
  return total;
}

const unlocked = {
  market: (g) => g.lifetime >= MARKET_UNLOCK && !activeChallenge(g)?.noMarket,
  expeditions: (g) => (g.owned.caneton >= EXPEDITION_UNLOCK || g.expeditions.length > 0) && !activeChallenge(g)?.noTeam,
  ducks: (g) => g.eggs > 0 || g.ducks.length > 0 || g.nest !== null,
  tree: (g) => g.feathersTotal > 0,
  challenges: (g) => g.stats.leaps > 0 || g.challengesDone.length > 0 || g.feathersTotal > 0,
  season: (g) => g.feathersTotal >= SEASON_FEATHERS || g.season > 0,
  defense: (g) => g.lifetime >= DEFENSE_UNLOCK
};

const costMultiplier = (game) => (activeChallenge(game)?.dear ? 3 : 1) * (1 - Math.min(0.5, duckBonus(game, "cost")));
const costOf = (game, generator) => Math.ceil(generator.base * COST_GROWTH ** game.owned[generator.id] * costMultiplier(game));
const dogCost = (game) => Math.ceil(DOG_BASE * DOG_GROWTH ** game.dogs);
const dogChance = (game) => Math.min(DOG_MAX_CHANCE, game.dogs * DOG_CHANCE);
const generatorOpen = (game, generator) => game.season >= (generator.season ?? 0) && (!activeChallenge(game)?.onlyMare || generator.id === "mare");

function rateOf(game, generator) {
  let rate = generator.rate;
  if (generator.id === "caneton" && has(game, "pain")) rate *= 2;
  if (generator.id === "mare" && has(game, "nenuphars")) rate *= 2;
  return rate;
}

function productionBonus(game) {
  let bonus = (has(game, "syndicat") ? 2 : 1)
    * (1 + game.feathersTotal * FEATHER_BONUS)
    * (1 + game.achievements.length * ACHIEVEMENT_BONUS)
    * (1 + game.stars * STAR_BONUS)
    * CHALLENGE_BONUS ** game.challengesDone.length
    * (1 + duckBonus(game, "prod"));
  if (hasNode(game, "p1")) bonus *= 1.5;
  if (hasNode(game, "p2")) bonus *= 2;
  if (hasNode(game, "p5")) bonus *= 3;
  if (hasRelic(game, "r1")) bonus *= 1.5;
  return bonus;
}

const hungerPenalty = (game) => 1 - game.hunger * HUNGER_DROP;

function perSecond(game) {
  const base = GENERATORS.reduce((sum, g) => sum + game.owned[g.id] * rateOf(game, g), 0);
  return base * productionBonus(game) * hungerPenalty(game);
}

function perClick(game) {
  if (activeChallenge(game)?.noClick) return 0;
  let base = (has(game, "bec") ? 2 : 1) * (has(game, "palmes") ? 3 : 1) * (1 + duckBonus(game, "click"));
  if (hasNode(game, "c1")) base *= 2;
  if (hasNode(game, "c4")) base *= 3;
  if (hasRelic(game, "r3")) base *= 2;
  const share = (has(game, "synergie") ? 0.02 : 0) + (hasNode(game, "c3") ? 0.03 : 0);
  return base * (1 + game.feathersTotal * FEATHER_BONUS) * (1 + game.stars * STAR_BONUS) + perSecond(game) * share;
}

function clickGain(game, frenzy, rng) {
  let gain = perClick(game);
  if (frenzy) gain *= FRENZY_BONUS * (hasNode(game, "c5") ? 2 : 1);
  if (hasNode(game, "c2") && rng() < 0.05) gain *= 10;
  return gain;
}

function earn(game, amount) {
  game.coins = Math.min(COIN_LIMIT, game.coins + amount);
  game.run = Math.min(COIN_LIMIT, game.run + amount);
  game.lifetime = Math.min(COIN_LIMIT, game.lifetime + amount);
}

function buyGenerator(game, id) {
  const generator = GENERATORS.find((g) => g.id === id);
  if (!generatorOpen(game, generator)) return false;
  const cost = costOf(game, generator);
  if (game.coins < cost) return false;
  game.coins -= cost;
  game.owned[id]++;
  return true;
}

function buyUpgrade(game, id) {
  const upgrade = UPGRADES.find((u) => u.id === id);
  if (has(game, id) || game.coins < upgrade.cost || activeChallenge(game)?.noUpgrades) return false;
  game.coins -= upgrade.cost;
  game.upgrades.push(id);
  return true;
}

function buyDog(game) {
  const cost = dogCost(game);
  if (game.coins < cost) return false;
  game.coins -= cost;
  game.dogs++;
  return true;
}

function buyNode(game, id) {
  const node = TREE.find((n) => n.id === id);
  if (hasNode(game, id) || game.feathers < node.cost || (node.needs && !hasNode(game, node.needs))) return false;
  game.feathers -= node.cost;
  game.tree.push(id);
  return true;
}

function respec(game) {
  const spent = game.tree.reduce((sum, id) => sum + TREE.find((n) => n.id === id).cost, 0);
  game.feathers += spent;
  game.tree = [];
  return spent;
}

function buyRelic(game, id) {
  const relic = RELICS.find((r) => r.id === id);
  if (hasRelic(game, id) || game.gems < relic.cost) return false;
  game.gems -= relic.cost;
  game.relics.push(id);
  return true;
}

function prestigeGain(game) {
  if (game.challenge) return 0;
  const gain = Math.cbrt(game.run / PRESTIGE_STEP) * (hasRelic(game, "r5") ? 1.5 : 1) * (1 + game.stars * 0.1);
  return Math.floor(gain);
}

// What survives a restart: long-term collections, not the run itself.
function restart(game) {
  const next = {
    ...fresh(),
    lifetime: game.lifetime, clicks: game.clicks, feathers: game.feathers, feathersTotal: game.feathersTotal,
    stars: game.stars, season: game.season, tree: game.tree, relics: game.relics, dogs: game.dogs,
    gems: game.gems, eggs: game.eggs, fragments: game.fragments, expeditions: game.expeditions, nextId: game.nextId,
    ducks: game.ducks, team: game.team, nest: game.nest, challengesDone: game.challengesDone,
    achievements: game.achievements, stats: game.stats, daily: game.daily, codesUsed: game.codesUsed, codesSent: game.codesSent,
    bread: game.bread
  };
  return clean({ ...next, version: SAVE_VERSION });
}

function prestige(game) {
  const gain = prestigeGain(game);
  if (gain < 1) return game;
  const next = restart(game);
  next.feathers += gain;
  next.feathersTotal += gain;
  next.stats.leaps++;
  return next;
}

function startChallenge(game, id) {
  if (game.challenge || game.challengesDone.includes(id)) return game;
  const next = restart(game);
  next.challenge = id;
  return next;
}

function abandonChallenge(game) {
  if (!game.challenge) return game;
  return restart(game);
}

// Each season asks for more plumes, so they stay rare.
const seasonNeed = (game) => SEASON_FEATHERS * (game.season + 1);
const seasonGain = (game) => Math.floor(Math.sqrt(game.feathersTotal / seasonNeed(game)));

function newSeason(game) {
  const gain = seasonGain(game);
  if (gain < 1 || game.challenge) return game;
  const next = restart(game);
  next.feathers = 0;
  next.feathersTotal = 0;
  next.tree = [];
  next.stars += gain;
  next.season++;
  return next;
}

const seeded = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

// Worked out from the clock, so every player sees the same prices, even after being offline.
function marketIndex(now) {
  const slot = Math.floor(now / MARKET_SLOT_MS);
  const wave = 1 + 0.45 * Math.sin(slot / 7.3) + 0.25 * Math.sin(slot / 2.1 + 1) + 0.4 * (seeded(slot) - 0.5);
  return Math.max(0.3, Math.min(2.2, wave));
}

const breadBase = (game) => Math.max(1, perSecond(game) * BREAD_TAX);
const breadPrice = (game, now) => breadBase(game) * marketIndex(now);
const breadCapacity = (game) => BREAD_CAPACITY * (hasNode(game, "g1") ? 3 : 1);
const marketFee = (game) => (hasNode(game, "g2") ? 0 : BREAD_FEE);

function buyBread(game, amount, now) {
  const room = Math.floor(breadCapacity(game) - game.bread);
  const price = breadPrice(game, now) * (1 + marketFee(game));
  const count = Math.min(amount, room, Math.floor(game.coins / price));
  if (count < 1) return 0;
  game.coins -= count * price;
  game.bread += count;
  game.stats.trades++;
  return count;
}

function sellBread(game, amount, now) {
  const count = Math.min(amount, Math.floor(game.bread));
  if (count < 1) return 0;
  const income = count * breadPrice(game, now) * (1 - marketFee(game));
  game.bread -= count;
  earn(game, income);
  game.stats.trades++;
  return income;
}

// Time passing while Discord is open. Hunger only starts once the market exists.
function advance(game, seconds, inVoice, frenzy) {
  const multiplier = (inVoice ? VOICE_BONUS : 1) * (frenzy ? FRENZY_BONUS : 1);
  earn(game, perSecond(game) * multiplier * seconds);
  if (inVoice) game.stats.voiceSeconds += seconds;
  if (activeChallenge(game)?.noMarket) {
    game.hunger = 1;
  } else if (unlocked.market(game)) {
    const eaten = BREAD_PER_SECOND * (hasNode(game, "g3") ? 0.5 : 1) * seconds;
    if (game.bread >= eaten) {
      game.bread -= eaten;
      game.hunger = Math.max(0, game.hunger - seconds / 60);
    } else {
      game.bread = 0;
      game.hunger = Math.min(1, game.hunger + seconds / HUNGER_FILL_S);
    }
  }
  const finished = [];
  const challenge = activeChallenge(game);
  if (challenge && game.run >= CHALLENGE_GOAL) {
    game.challengesDone.push(challenge.id);
    game.challenge = null;
    finished.push({ type: "challenge", name: challenge.name });
  }
  for (const achievement of ACHIEVEMENTS) {
    if (!game.achievements.includes(achievement.id) && achievement.read(game) >= achievement.goal) {
      game.achievements.push(achievement.id);
      finished.push({ type: "achievement", name: achievement.name });
    }
  }
  return finished;
}

function offlineGain(game, now) {
  const limit = (hasNode(game, "p4") ? 16 : 8) * 3600;
  const rate = hasNode(game, "p3") ? 0.75 : 0.5;
  const seconds = Math.min(limit, (now - game.savedAt) / 1000);
  return seconds >= OFFLINE_MIN_S ? perSecond(game) * seconds * rate : 0;
}

const expeditionSlots = (game) => EXPEDITION_SLOTS + (hasNode(game, "e1") ? 1 : 0) + (hasNode(game, "e5") ? 1 : 0);
const zoneDuration = (game, zone) => zone.hours * 3600000 * (hasNode(game, "e4") ? 0.75 : 1);

function zoneRisk(game, zone) {
  const reduced = (hasNode(game, "e2") ? 0.7 : 1) * (hasRelic(game, "r2") ? 0.8 : 1) * (1 - Math.min(0.6, duckBonus(game, "risk")));
  return zone.risk * reduced;
}

const lootBonus = (game) => (hasNode(game, "e3") ? 2 : 1) * (hasRelic(game, "r4") ? 1.5 : 1) * (1 + duckBonus(game, "loot"));

function sendExpedition(game, zoneId, ducklings, now) {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone || !unlocked.expeditions(game)) return false;
  if (game.expeditions.length >= expeditionSlots(game)) return false;
  if (ducklings < EXPEDITION_MIN || ducklings > game.owned.caneton) return false;
  game.owned.caneton -= ducklings;
  game.expeditions.push({ id: game.nextId++, zone: zoneId, ducklings, start: now, end: now + zoneDuration(game, zone), voiceAt: game.stats.voiceSeconds });
  return true;
}

// Time spent in voice during the trip adds up to +50 % to the loot.
function claimExpedition(game, id, now, rng) {
  const trip = game.expeditions.find((e) => e.id === id);
  if (!trip || now < trip.end) return null;
  const zone = ZONES.find((z) => z.id === trip.zone);
  const duration = trip.end - trip.start;
  const voice = Math.min(1, ((game.stats.voiceSeconds - trip.voiceAt) * 1000) / duration) * 0.5;
  const loot = lootBonus(game) * (1 + voice);
  const lost = Math.min(trip.ducklings, Math.round(trip.ducklings * zoneRisk(game, zone) * rng() * 2));
  const size = trip.ducklings / (trip.ducklings + 20);
  const coins = perSecond(game) * (duration / 1000) * 0.3 * size * loot;
  const whole = (chance) => Math.floor(chance) + (rng() < chance % 1 ? 1 : 0);
  const reward = { coins, lost, voice, eggs: whole(zone.egg * size * 2 * loot), gems: whole(zone.gem * size * 2 * loot), fragments: whole(zone.fragment * size * 2 * loot), zone: zone.name };
  game.owned.caneton += trip.ducklings - lost;
  game.expeditions = game.expeditions.filter((e) => e !== trip);
  earn(game, coins);
  game.eggs += reward.eggs;
  game.gems += reward.gems;
  game.fragments += reward.fragments;
  while (game.fragments >= FRAGMENTS_PER_FEATHER) {
    game.fragments -= FRAGMENTS_PER_FEATHER;
    game.feathers++;
    game.feathersTotal++;
  }
  game.stats.expeditions++;
  return reward;
}

const nestTime = (game, base) => base * (hasNode(game, "g4") ? 0.5 : 1);

function makeDuck(game, rarity, traits, rng) {
  return {
    id: game.nextId++,
    name: DUCK_NAMES[Math.floor(rng() * DUCK_NAMES.length)],
    rarity, traits, shiny: rng() < SHINY_CHANCE
  };
}

function rollRarity(rng) {
  const roll = rng();
  return roll < 0.02 ? 3 : roll < 0.12 ? 2 : roll < 0.4 ? 1 : 0;
}

function startHatch(game, now) {
  if (game.nest || game.eggs < 1 || game.ducks.length >= DUCK_LIMIT) return false;
  game.eggs--;
  game.nest = { end: now + nestTime(game, HATCH_MS), parents: null };
  return true;
}

function startBreeding(game, firstId, secondId, now) {
  if (game.nest || firstId === secondId || game.bread < BREED_BREAD || game.ducks.length >= DUCK_LIMIT) return false;
  if (!duckById(game, firstId) || !duckById(game, secondId)) return false;
  game.bread -= BREED_BREAD;
  game.nest = { end: now + nestTime(game, BREED_MS), parents: [firstId, secondId] };
  return true;
}

function collectNest(game, now, rng) {
  const nest = game.nest;
  if (!nest || now < nest.end) return null;
  const parents = (nest.parents ?? []).map((id) => duckById(game, id)).filter(Boolean);
  let duck;
  if (parents.length === 2) {
    const best = Math.max(parents[0].rarity, parents[1].rarity);
    const rarity = Math.min(RARITIES.length - 1, best + (rng() < 0.25 ? 1 : 0));
    const pool = [...parents[0].traits, ...parents[1].traits];
    const traits = [pool[Math.floor(rng() * pool.length)], rng() < 0.1 ? TRAIT_IDS[Math.floor(rng() * TRAIT_IDS.length)] : pool[Math.floor(rng() * pool.length)]];
    duck = makeDuck(game, rarity, traits, rng);
  } else {
    const count = rng() < 0.3 ? 2 : 1;
    const traits = Array.from({ length: count }, () => TRAIT_IDS[Math.floor(rng() * TRAIT_IDS.length)]);
    duck = makeDuck(game, rollRarity(rng), traits, rng);
  }
  game.ducks.push(duck);
  game.nest = null;
  return duck;
}

function toggleTeam(game, id) {
  if (game.team.includes(id)) game.team = game.team.filter((d) => d !== id);
  else if (game.team.length < TEAM_SIZE && duckById(game, id)) game.team.push(id);
}

function releaseDuck(game, id) {
  const duck = duckById(game, id);
  if (!duck) return 0;
  game.ducks = game.ducks.filter((d) => d !== duck);
  game.team = game.team.filter((d) => d !== id);
  const gems = 1 + duck.rarity;
  game.gems += gems;
  return gems;
}

const dayNumber = (now) => Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / 86400000);

// Three quests a day, the same for everyone. Each counts from what you'd done at the first check.
function refreshDaily(game, now) {
  const day = dayNumber(now);
  if (game.daily?.day === day) return null;
  const streak = game.daily?.day === day - 1 ? game.daily.streak + 1 : 1;
  const start = Math.floor(seeded(day) * QUESTS.length);
  const quests = [0, 1, 2].map((offset) => {
    const quest = QUESTS[(start + offset * 2) % QUESTS.length];
    return { id: quest.id, from: game.stats[quest.stat] ?? game.clicks, done: false };
  });
  for (const quest of quests) if (quest.id === "clics") quest.from = game.clicks;
  game.daily = { day, streak, quests };
  const reward = perSecond(game) * 600 * Math.min(streak, 7);
  earn(game, reward);
  return { streak, reward };
}

function questProgress(game, quest) {
  const about = QUESTS.find((q) => q.id === quest.id);
  const now = about.stat === "clicks" ? game.clicks : game.stats[about.stat];
  return { about, value: Math.min(about.goal, now - quest.from) };
}

function claimQuest(game, index) {
  const quest = game.daily?.quests[index];
  if (!quest || quest.done) return false;
  const { about, value } = questProgress(game, quest);
  if (value < about.goal) return false;
  quest.done = true;
  game.gems += 1;
  game.bread = Math.min(breadCapacity(game), game.bread + 600);
  game.fragments += 3;
  return true;
}

const GIFT_KINDS = { pain: "bread", gemme: "gems", oeuf: "eggs" };

// Gifts are copied and pasted by hand. Nothing is ever sent for you.
function makeGift(game, kind, amount, rng) {
  const field = GIFT_KINDS[kind];
  const count = Math.floor(amount);
  if (!field || count < 1 || count > GIFT_LIMIT || game[field] < count) return null;
  const id = `${Date.now().toString(36)}${Math.floor(rng() * 1e9).toString(36)}`;
  game[field] -= count;
  game.codesSent.push(id);
  game.stats.gifts++;
  return `COIN-${btoa(JSON.stringify({ i: id, k: kind, n: count }))}`;
}

function openGift(game, code) {
  try {
    const gift = JSON.parse(atob(String(code).trim().replace(/^COIN-/, "")));
    const field = GIFT_KINDS[gift.k];
    if (!field || !Number.isInteger(gift.n) || gift.n < 1 || gift.n > GIFT_LIMIT || typeof gift.i !== "string") return { error: "Code invalide" };
    if (game.codesUsed.includes(gift.i)) return { error: "Code déjà utilisé" };
    if (game.codesSent.includes(gift.i)) return { error: "C'est ton propre cadeau" };
    game.codesUsed.push(gift.i);
    game[field] = field === "bread" ? Math.min(breadCapacity(game), game.bread + gift.n) : game[field] + gift.n;
    return { kind: gift.k, amount: gift.n };
  } catch {
    return { error: "Code invalide" };
  }
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

function duration(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")}`;
  return `${minutes} min ${String(seconds % 60).padStart(2, "0")}`;
}

const PLUGIN = "LeCanard";
const DUCK_ID = "le-canard";
const GOLD_ID = "le-canard-dore";
const FOX_ID = "le-canard-renard";
const PANEL_ID = "le-canard-boutique";
const WORLD_ID = "le-canard-domaine";
const STRIP = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPIAAAAWCAYAAAD6vcEwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGCSURBVHhe7dkxTgJBGEfxbYwlpacwsfEixEMYz2HhFWz1GFaew9pwA9s13zyHHSbgwsLXvZf8A4Tht1RLwTCYmZmZmVl2Lw/D2K5/f2m6pEu6lOIGNG5W4/jzxjari+C6pEu6lOLuoPHY7OluOa5LuqRLWe4E/20YhrF0JqxLuqRLvdtukfv5OIx1z7cTHl+4fOmFsC7pki4dcsOKLXIL9Dot8PX1hMe+P672wnFHade+p0u6pEtZbimgdj369c6dop6v0NyFdUmXdCnL3dYfbtF2cxfu0yVd0qUsdwfuV+8K++4Oc7Au6ZIuZbn/wu0Ci7MVnYN1SZd0KcudhQOq2PrmeFiXdEmXstxSHOjBilakwu3z3unTJV3SpSz3IBwfbtdfpHf6dEmXdCnLLQVef9bbn/d9u+fP8aPSJV3SpSy31N8F+gV4Mqq7TZd0KcstxZ/VFejXnz0lXdIlXcpyS4G3ry+C6m7TJV3KctNgXdIlXUpxK1ofK3ourku6pEtL3F9Nh0t/+trLfwAAAABJRU5ErkJggg==";
const FRAMES = 11;
const CELL = 22;
const SIZE = CELL * 2;
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
const FRENZY_MS = 30000;
const GOLD_SPEED = 3;
const GOLD_MIN_MS = 4 * 60000;
const GOLD_MAX_MS = 9 * 60000;
const FOX_MIN_MS = 4 * 60000;
const FOX_MAX_MS = 8 * 60000;
const FOX_SPEED = 1.1;
const FOX_HITS = 3;
const VISITOR_SECONDS = 15;
const PING_SECONDS = 5;
const SOUND_GAP_MS = 250;
const WORLD_HEIGHT = 76;
const PIXEL = 2;
const CHAIN_MAX = 100;
const SHOW_MAX = 40;
const PATH_STEP = 2;
const CHAIN_GAP = 13;
const POP_MS = 450;
const GOLDEN_RATIO = 0.618034;
const BREAD_STEPS = [100, 1000, 10000];
const COLORS = { g: "#3fa34d", b: "#2f7fd1", l: "#8fd0ff", r: "#c8383e", R: "#8e2428", w: "#f2efe6", s: "#9aa3ad", S: "#5c636c", d: "#8a5a2b", D: "#4f3219", p: "#f0c29a", y: "#f2c230", Y: "#b98a12", o: "#ef8a2c", k: "#22242a", v: "#7b5fd1", V: "#4d3a99" };
const ART = {
  mare: ["........gg......gg........", "....bbbbbbbbbbbbbbbbbb....", "..bbbbllbbbbbbbbbbbbbbbb..", ".bbbbbbbbbbbbllbbbbbbbbbb.", "bbbbbbbbbbbbbbbbbbbbllbbbb", ".bbbllbbbbbbbbbbbbbbbbbbb.", "..bbbbbbbbbbbbbllbbbbbbb..", "....bbbbbbbbbbbbbbbbbb...."],
  eleveur: ["...yyyy...", "..yyyyyy..", ".yyyyyyyy.", "...pppp...", "...pppp...", "..bbbbbb..", ".pbbbbbbp.", ".pbbbbbbp.", "..bbbbbb..", "..bb..bb..", "..bb..bb..", "..DD..DD.."],
  ferme: [".........rr.........", ".......rrrrrr.......", ".....rrrrrrrrrr.....", "...rrrrrwwwwrrrrr...", ".rrrrrrrwwwwrrrrrrr.", "rrrrrrrrrrrrrrrrrrrr", "DDDDDDDDDDDDDDDDDDDD", ".RRRRRRRRRRRRRRRRRR.", ".RRwwRRRRRRRRRRwwRR.", ".RRwwRRRRRRRRRRwwRR.", ".RRRRRRwwwwwwRRRRRR.", ".RRRRRRwRRRRwRRRRRR.", ".RRRRRRwRRRRwRRRRRR.", ".RRRRRRwRRRRwRRRRRR."],
  usine: ["..SS.....SS...........", "..SS.....SS...........", "..SS.....SS...........", "..SS.....SS...........", "..SS.....SS.......s...", "ssSSsssssSSssss..sss..", "sssssssssssssss.sssss.", "ssssssssssssssssssssss", "ssyysssyysssyysssyysss", "ssyysssyysssyysssyysss", "ssssssssssssssssssssss", "ssyysssyysssyysssyysss", "ssyysssyysssyysssyysss", "ssssssssssssssssssssss", "SSSSSSSSSSSSSSSSSSSSSS"],
  empire: ["............rr............", "............rrr...........", "............Y.............", "..y..y.....yyy.....y..y...", "..yyyy.....yyy.....yyyy...", "..yyyy....yyyyy....yyyy...", "..yyyy....yYyYy....yyyy...", "..yyyy.y.yyyyyyy.y.yyyy...", "..yyyyyyyyyyyyyyyyyyyyy...", "..yYyyyyyyyyyyyyyyyyyYy...", "..yyyyyyYyyyyyyyYyyyyyy...", "..yyyyyyyyyyyyyyyyyyyyy...", "..yyyyyyyyyDDDyyyyyyyyy...", "..yyyyyyyyDDDDDyyyyyyyy...", "..yyyyyyyyDDDDDyyyyyyyy...", "..yyyyyyyyDDDDDyyyyyyyy..."],
  temple: ["..........ww..........", ".......wwwwwwww.......", "....wwwwwwwwwwwwww....", ".wwwwwwwwwwwwwwwwwwww.", "ssssssssssssssssssssss", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", "ssssssssssssssssssssss", "SSSSSSSSSSSSSSSSSSSSSS"],
  cite: ["......ss..............", "......ss......ss......", "..ss..ss......ss......", "..ss..ssss....ssss....", "..ss..syys....syys....", "ssss..ssss.ss.ssss..ss", "syys..syys.ss.syys..ss", "ssss..ssss.ssssssssss.", "syys..syys.syysyysyys.", "ssss..ssss.ssssssssss.", "syys..syys.syysyysyys.", "ssssssssssssssssssssss"],
  station: ["...........v...........", "..........vvv..........", ".........vvlvv.........", "........vvvvvvv........", "...vvvvvvvvvvvvvvvvv...", ".vvvlvvlvvlvvlvvlvvlvv.", "vvvvvvvvvvvvvvvvvvvvvvv", ".VVVVVVVVVVVVVVVVVVVVV.", "...VVVV..VVVVV..VVVV...", "....oo....ooo....oo....", ".....o.....o......o...."],
  chien: ["......DD....", ".....dddDD..", ".....ddkdd..", "dd...ddddk..", ".ddddddddd..", ".ddddddddd..", ".dd.dd.dd...", ".dd.dd.dd..."],
  renard: [".o..o.......", ".oooo.......", ".okook...oo.", ".ooooo..ooo.", "..oooooooow.", "..oooooooow.", "..o.oo.o....", "..k.kk.k...."]
};
const WORLD_ORDER = ["station", "cite", "temple", "empire", "usine", "ferme", "mare", "eleveur", "chien"];
const WALKERS = ["eleveur", "chien"];
const TABS = [
  { id: "shop", name: "Boutique", open: () => true },
  { id: "market", name: "Marché", open: unlocked.market, hint: "Gagne 50 k Coins" },
  { id: "trips", name: "Expéditions", open: unlocked.expeditions, hint: "Possède 10 Canetons" },
  { id: "ducks", name: "Élevage", open: unlocked.ducks, hint: "Trouve un œuf en expédition" },
  { id: "tree", name: "Plumes", open: unlocked.tree, hint: "Fais un Grand Envol" },
  { id: "challenges", name: "Défis", open: unlocked.challenges, hint: "Fais un Grand Envol" },
  { id: "relics", name: "Reliques", open: (g) => g.gems > 0 || g.relics.length > 0, hint: "Trouve une gemme" },
  { id: "quests", name: "Quêtes", open: () => true },
  { id: "trophies", name: "Succès", open: () => true },
  { id: "season", name: "Saison", open: unlocked.season, hint: `Atteins ${SEASON_FEATHERS} plumes` },
  { id: "gifts", name: "Cadeaux", open: () => true }
];

class LeCanard {
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
    Object.assign(this, { x: 80, direction: 1, mode: "walk", modeUntil: 0, pings: [], frame: 0, frameAt: 0, seen: null, channel: null, frenzyUntil: 0, rows: null, soundAt: 0, tab: "shop", armed: null, parents: [] });
    this.lastTick = Date.now();
    this.nextGold = Date.now() + this.delay(GOLD_MIN_MS, GOLD_MAX_MS) / this.goldSpeed();
    this.nextFox = Date.now() + this.delay(FOX_MIN_MS, FOX_MAX_MS);
    this.build();
    const away = offlineGain(this.game, Date.now());
    if (away > 0) {
      earn(this.game, away);
      this.say(`Pendant ton absence : +${format(away)}`, 6000);
    }
    const daily = refreshDaily(this.game, Date.now());
    if (daily && daily.reward > 0) this.say(`Jour ${daily.streak} : +${format(daily.reward)}`, 6000);
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
    for (const id of [DUCK_ID, GOLD_ID, FOX_ID, PANEL_ID, WORLD_ID]) document.getElementById(id)?.remove();
    this.audio?.close?.();
    this.audio = null;
  }

  save() {
    if (!this.game) return;
    this.game.savedAt = Date.now();
    BdApi.Data.save(PLUGIN, "game", this.game);
  }

  delay(low, high) {
    return low + Math.random() * (high - low);
  }

  goldSpeed() {
    return (hasNode(this.game, "g5") ? 2 : 1) * (1 + duckBonus(this.game, "gold"));
  }

  sprite(size, extra = "") {
    const node = document.createElement("div");
    node.style.cssText = `width:${size}px;height:${size}px;background:url(${STRIP}) 0 0/${FRAMES * size}px ${size}px no-repeat;image-rendering:pixelated;${extra}`;
    return node;
  }

  build() {
    const duck = document.createElement("div");
    duck.id = DUCK_ID;
    duck.title = "Clic : gagner des Coins. Clic droit : menu du jeu.";
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
    Object.assign(this, { element: duck, body, counter, bubble });
    this.buildWorld();
    this.showCount();
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

  worldCount(name) {
    return name === "chien" ? this.game.dogs : this.game.owned[name];
  }

  worldSpot(name, index, width, now) {
    const seed = WORLD_ORDER.indexOf(name) * 0.17 + 0.05;
    const room = Math.max(1, this.canvas.width - width);
    const home = ((seed + (index + 1) * GOLDEN_RATIO) % 1) * room;
    if (!WALKERS.includes(name)) return { x: home, direction: 1 };
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
    this.drawWeather(pen, now);
    for (const name of [...GENERATORS.map((g) => g.id), "chien"]) {
      const owned = this.worldCount(name);
      if (this.seenOwned[name] !== undefined && owned > this.seenOwned[name]) this.popAt[name] = now;
      this.seenOwned[name] = owned;
    }
    for (const name of WORLD_ORDER) this.drawGroup(pen, name, now);
    this.drawChain(pen, now);
  }

  // Each season dresses the strip differently: snow, then stars, then the aurora.
  drawWeather(pen, now) {
    const season = this.game.season % 4;
    if (season === 0) return;
    const colors = { 1: "rgba(255,255,255,.75)", 2: "rgba(255,240,170,.8)", 3: "rgba(150,255,210,.7)" };
    pen.fillStyle = colors[season];
    for (let i = 0; i < 40; i++) {
      const x = (seeded(i + 1) * this.canvas.width + (season === 1 ? Math.sin(now / 900 + i) * 6 : 0)) % this.canvas.width;
      const y = season === 1 ? (seeded(i + 50) * WORLD_HEIGHT + now * 0.015) % WORLD_HEIGHT : seeded(i + 50) * WORLD_HEIGHT;
      if (season !== 2 || Math.sin(now / 500 + i) > -0.3) pen.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }

  hop(id, index, count, now) {
    const age = now - (this.popAt[id] ?? -Infinity);
    return index === count - 1 && age < POP_MS ? Math.sin((age / POP_MS) * Math.PI) * 14 : 0;
  }

  drawGroup(pen, name, now) {
    const owned = this.worldCount(name);
    const count = Math.min(SHOW_MAX, owned);
    const art = this.sprites[name];
    let spot = null;
    for (let index = 0; index < count; index++) {
      spot = this.worldSpot(name, index, art.width, now);
      const bob = WALKERS.includes(name) ? Math.abs(Math.sin(now / 160 + index)) * 2 : 0;
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

  inFrenzy() {
    return Date.now() < this.frenzyUntil;
  }

  tick() {
    try {
      const now = Date.now();
      const elapsed = Math.max(0, Math.min(MAX_TICK_S, (now - this.lastTick) / 1000));
      this.lastTick = now;
      const events = advance(this.game, elapsed, Boolean(this.channel), this.inFrenzy());
      for (const event of events) {
        if (event.type === "challenge") this.say(`Défi réussi : ${event.name} !`, 5000);
        else this.say(`Succès : ${event.name}`, 3000);
        this.dirty = true;
      }
      if (refreshDaily(this.game, now)) this.dirty = true;
      this.showCount();
      this.refresh();
      if (now >= this.nextGold && !document.getElementById(GOLD_ID)) this.spawnGold();
      if (now >= this.nextFox && !document.getElementById(FOX_ID)) this.foxTurn();
    } catch (e) {
      console.error(`[${PLUGIN}] tick failed`, e);
    }
  }

  // Clicking stops the duck so it stays easy to hit.
  peck() {
    if (activeChallenge(this.game)?.noClick) { this.say("Défi : les clics sont interdits !", 1500); return; }
    const gain = clickGain(this.game, this.inFrenzy(), Math.random);
    earn(this.game, gain);
    this.game.clicks++;
    this.showCount();
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
    this.nextGold = Date.now() + this.delay(GOLD_MIN_MS, GOLD_MAX_MS) / this.goldSpeed();
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
    this.game.stats.goldCaught++;
    this.say(`FRÉNÉSIE ×${FRENZY_BONUS} pendant 30 s !`, 4000);
  }

  // Foxes only come during voice calls. Each dog can chase one off before it arrives.
  foxTurn() {
    this.nextFox = Date.now() + this.delay(FOX_MIN_MS, FOX_MAX_MS);
    if (!this.channel || !unlocked.defense(this.game)) return;
    if (Math.random() < dogChance(this.game)) {
      const reward = perSecond(this.game) * 10;
      earn(this.game, reward);
      this.game.stats.foxes++;
      this.say(`Tes chiens ont chassé un renard ! +${format(reward)}`, 3000);
      return;
    }
    const fox = document.createElement("div");
    fox.id = FOX_ID;
    fox.title = `Clique ${FOX_HITS} fois pour le chasser !`;
    fox.style.cssText = `position:fixed;left:0;bottom:0;z-index:9999;width:${this.sprites.renard.width}px;height:${this.sprites.renard.height}px;cursor:crosshair;background:url(${this.sprites.renard.toDataURL()}) no-repeat;image-rendering:pixelated`;
    fox.onclick = () => this.hitFox();
    document.body.append(fox);
    this.fox = { x: Math.random() < 0.5 ? -30 : window.innerWidth, hits: FOX_HITS };
    this.say("UN RENARD ! Clique dessus !", 3000);
  }

  hitFox() {
    if (!this.fox) return;
    this.fox.hits--;
    if (this.fox.hits > 0) return;
    document.getElementById(FOX_ID)?.remove();
    this.fox = null;
    const reward = perSecond(this.game) * 20;
    earn(this.game, reward);
    this.game.stats.foxes++;
    this.say(`Renard chassé ! +${format(reward)}`, 3000);
  }

  moveFox() {
    if (!this.fox) return;
    const node = document.getElementById(FOX_ID);
    const gap = this.x - this.fox.x;
    this.fox.x += Math.sign(gap) * FOX_SPEED;
    if (node) node.style.transform = `translateX(${this.fox.x}px) scaleX(${gap < 0 ? -1 : 1})`;
    if (Math.abs(gap) > 8) return;
    node?.remove();
    this.fox = null;
    const stolen = Math.min(this.game.coins * 0.02, perSecond(this.game) * 60);
    this.game.coins -= stolen;
    this.say(`Le renard a volé ${format(stolen)} Coins !`, 4000);
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
      this.moveFox();
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
    this.renderTab();
  }

  buildPanel() {
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.cssText = "position:fixed;right:20px;bottom:60px;z-index:10002;width:400px;height:min(620px,calc(100vh - 90px));display:flex;flex-direction:column;padding:12px 14px;border-radius:10px;background:rgba(17,18,20,.97);color:#fff;font:13px var(--font-primary,sans-serif);box-shadow:0 8px 24px rgba(0,0,0,.5)";
    panel.onkeydown = (e) => e.stopPropagation();
    const top = document.createElement("div");
    top.style.cssText = "display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px";
    const title = document.createElement("span");
    title.textContent = "Le Royaume du Canard";
    const close = document.createElement("span");
    close.textContent = "✕";
    close.style.cursor = "pointer";
    close.onclick = () => this.togglePanel();
    top.append(title, close);
    const stats = document.createElement("div");
    stats.style.cssText = "margin-top:6px;white-space:pre-line;color:#ffd84d;font-size:12px";
    const tabs = document.createElement("div");
    tabs.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;margin:8px 0";
    const body = document.createElement("div");
    body.style.cssText = "flex:1;min-height:0;overflow-y:auto;padding-right:6px";
    panel.append(top, stats, tabs, body);
    document.body.append(panel);
    this.rows = { stats, tabs, body };
  }

  renderTabs() {
    this.rows.tabs.replaceChildren(...TABS.map((tab) => {
      const open = tab.open(this.game);
      const chip = document.createElement("button");
      chip.textContent = open ? tab.name : "🔒";
      chip.title = open ? tab.name : tab.hint;
      chip.style.cssText = `padding:4px 8px;border:none;border-radius:6px;font:600 11px var(--font-primary,sans-serif);color:#fff;cursor:${open ? "pointer" : "default"};background:${tab.id === this.tab ? "#5865f2" : "#2b2d31"};opacity:${open ? 1 : 0.5}`;
      chip.onclick = () => { if (open) { this.tab = tab.id; this.armed = null; this.renderTab(); } };
      return chip;
    }));
  }

  // Each tab is built once; updaters keep its numbers live without replacing the buttons under the mouse.
  renderTab() {
    if (!this.rows) return;
    this.dirty = false;
    this.tabsOpen = TABS.map((t) => t.open(this.game)).join();
    this.renderTabs();
    const scroll = this.rows.body.scrollTop;
    this.updaters = [];
    this.rows.body.replaceChildren();
    this[`tab_${this.tab}`]();
    this.rows.body.scrollTop = scroll;
    this.refresh();
  }

  refresh() {
    if (!this.rows) return;
    if (this.dirty || this.tabsOpen !== TABS.map((t) => t.open(this.game)).join()) { this.renderTab(); return; }
    const game = this.game;
    const notes = [];
    if (this.channel) notes.push(`En vocal ×${String(VOICE_BONUS).replace(".", ",")}`);
    if (this.inFrenzy()) notes.push(`Frénésie ×${FRENZY_BONUS}`);
    if (game.hunger > 0.01) notes.push(`Faim -${Math.round(game.hunger * HUNGER_DROP * 100)} %`);
    if (game.challenge) notes.push(`Défi : ${activeChallenge(game).name}`);
    this.rows.stats.textContent = [
      `${format(game.coins)} Coins · ${format(perSecond(game))} /s · ${format(perClick(game))} par clic`,
      `Plumes ${game.feathers} · Pain ${format(game.bread)} · Gemmes ${game.gems} · Saison ${game.season}`,
      ...(notes.length ? [notes.join(" · ")] : [])
    ].join("\n");
    for (const update of this.updaters) update();
  }

  live(value) {
    return typeof value === "function" ? value() : value;
  }

  button(label, enabled, action) {
    const node = document.createElement("button");
    node.style.cssText = "flex:none;min-width:84px;padding:5px 8px;border:none;border-radius:4px;background:#5865f2;color:#fff;font:600 12px var(--font-primary,sans-serif)";
    this.updaters.push(() => {
      node.textContent = this.live(label);
      const on = this.live(enabled);
      node.disabled = !on;
      node.style.opacity = on ? "1" : ".45";
      node.style.cursor = on ? "pointer" : "default";
    });
    node.onclick = () => {
      if (node.disabled) return;
      action();
      this.save();
      this.dirty = true;
      this.refresh();
    };
    return node;
  }

  heading(text) {
    const node = document.createElement("div");
    node.textContent = text;
    node.style.cssText = "margin:10px 0 4px;font-weight:700;color:#b5bac1;font-size:11px;text-transform:uppercase";
    this.rows.body.append(node);
  }

  text(content) {
    const node = document.createElement("div");
    node.style.cssText = "font-size:12px;color:#b5bac1;margin:2px 0 6px;white-space:pre-line";
    this.updaters.push(() => { node.textContent = this.live(content); });
    this.rows.body.append(node);
    return node;
  }

  row(title, note, ...buttons) {
    const line = document.createElement("div");
    line.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0";
    const words = document.createElement("div");
    words.style.cssText = "min-width:0";
    const name = document.createElement("div");
    name.style.fontWeight = "600";
    const small = document.createElement("div");
    small.style.cssText = "font-size:11px;color:#b5bac1";
    this.updaters.push(() => { name.textContent = this.live(title); small.textContent = this.live(note); });
    words.append(name, small);
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:4px;flex:none";
    actions.append(...buttons);
    line.append(words, actions);
    this.rows.body.append(line);
  }

  // Two clicks for anything that wipes progress.
  confirmButton(id, label, enabled, action) {
    return this.button(() => (this.armed === id ? "Sûr ? Reclique" : this.live(label)), enabled, () => {
      if (this.armed !== id) { this.armed = id; return; }
      this.armed = null;
      action();
    });
  }

  replaceGame(next) {
    this.game = next;
    this.showCount();
  }

  tab_shop() {
    const game = () => this.game;
    this.heading("Production");
    for (const generator of GENERATORS) {
      if (!generatorOpen(game(), generator)) {
        if (generator.season > game().season) this.row(generator.name, `Saison ${generator.season} requise`);
        continue;
      }
      this.row(generator.name, () => `${game().owned[generator.id]} possédés · ${format(rateOf(game(), generator))} /s chacun`,
        this.button(() => format(costOf(game(), generator)), () => game().coins >= costOf(game(), generator), () => buyGenerator(game(), generator.id)));
    }
    if (unlocked.defense(game())) {
      this.row("Chien de garde", () => `${game().dogs} possédés · ${Math.round(dogChance(game()) * 100)} % de chasser les renards`,
        this.button(() => format(dogCost(game())), () => game().coins >= dogCost(game()), () => buyDog(game())));
    }
    if (!activeChallenge(game())?.noUpgrades) {
      this.heading("Améliorations");
      for (const upgrade of UPGRADES.filter((u) => !has(game(), u.id))) {
        this.row(upgrade.name, upgrade.note, this.button(format(upgrade.cost), () => game().coins >= upgrade.cost, () => buyUpgrade(game(), upgrade.id)));
      }
    }
    this.heading("Grand Envol");
    this.text(game().challenge ? "Termine ou abandonne ton défi d'abord." : "Recommence ta partie et gagne des plumes. Elles restent, avec tes canards, reliques et succès.");
    this.rows.body.append(this.confirmButton("leap", () => (prestigeGain(game()) > 0 ? `S'envoler (+${prestigeGain(game())} plumes)` : `Il te faut ${format(PRESTIGE_STEP)} Coins gagnés`), () => prestigeGain(game()) > 0, () => {
      this.replaceGame(prestige(game()));
      this.say("Le canard s'envole !", 3000);
    }));
  }

  tab_market() {
    const game = () => this.game;
    this.text("Le prix change toutes les 5 minutes, et il est le même pour tout le monde. Tes canards mangent 1 Pain par seconde : sans stock, ta production baisse peu à peu.");
    const chart = document.createElement("canvas");
    chart.width = 360;
    chart.height = 70;
    chart.style.cssText = "width:100%;background:#1e1f22;border-radius:6px";
    this.rows.body.append(chart);
    this.updaters.push(() => this.drawChart(chart));
    this.text(() => {
      const index = marketIndex(Date.now());
      const trend = index < 0.8 ? "Bon prix d'achat" : index > 1.3 ? "Bon prix de vente" : "Prix moyen";
      const left = MARKET_SLOT_MS - (Date.now() % MARKET_SLOT_MS);
      return `1 Pain = ${format(breadPrice(game(), Date.now()))} Coins (${trend})\nStock : ${format(game().bread)} / ${format(breadCapacity(game()))} · Frais ${Math.round(marketFee(game()) * 100)} %\nProchain prix dans ${duration(left)}`;
    });
    for (const amount of BREAD_STEPS) {
      this.row(`${format(amount)} Pain`, "", this.button("Acheter", () => game().coins >= breadPrice(game(), Date.now()) && game().bread < breadCapacity(game()), () => buyBread(game(), amount, Date.now())),
        this.button("Vendre", () => game().bread >= 1, () => sellBread(game(), amount, Date.now())));
    }
  }

  drawChart(chart) {
    const pen = chart.getContext("2d");
    pen.clearRect(0, 0, chart.width, chart.height);
    const now = Date.now();
    const points = 48;
    pen.strokeStyle = "#ffd84d";
    pen.lineWidth = 2;
    pen.beginPath();
    for (let i = 0; i < points; i++) {
      const value = marketIndex(now - (points - 1 - i) * MARKET_SLOT_MS);
      const x = (i / (points - 1)) * chart.width;
      const y = chart.height - ((value - 0.3) / 1.9) * (chart.height - 8) - 4;
      if (i === 0) pen.moveTo(x, y); else pen.lineTo(x, y);
    }
    pen.stroke();
  }

  tab_trips() {
    const game = () => this.game;
    this.text(() => `Expéditions : ${game().expeditions.length} / ${expeditionSlots(game())}. Les Canetons partis ne produisent plus. Le temps passé en vocal pendant le voyage ajoute jusqu'à +50 % au butin.`);
    this.heading("En route");
    for (const trip of game().expeditions) {
      const zone = ZONES.find((z) => z.id === trip.zone);
      this.row(zone.name, () => (Date.now() >= trip.end ? `${trip.ducklings} Canetons de retour !` : `${trip.ducklings} Canetons · retour dans ${duration(trip.end - Date.now())}`),
        this.button("Récupérer", () => Date.now() >= trip.end, () => {
          const reward = claimExpedition(game(), trip.id, Date.now(), Math.random);
          if (reward) this.say(`+${format(reward.coins)} · ${reward.eggs} œuf · ${reward.gems} gemme · ${reward.fragments} éclat${reward.lost ? ` · ${reward.lost} perdus` : ""}`, 6000);
        }));
    }
    if (game().expeditions.length === 0) this.text("Personne en route.");
    this.heading("Partir");
    for (const zone of ZONES) {
      this.row(zone.name, () => `${duration(zoneDuration(game(), zone))} · risque ${Math.round(zoneRisk(game(), zone) * 100)} %`,
        ...[0.25, 0.5, 1].map((share) => this.button(`${share * 100} %`, () => this.tripSize(share) >= EXPEDITION_MIN && game().expeditions.length < expeditionSlots(game()), () => sendExpedition(game(), zone.id, this.tripSize(share), Date.now()))));
    }
  }

  tripSize(share) {
    return Math.floor(this.game.owned.caneton * share);
  }

  tab_ducks() {
    const game = () => this.game;
    this.text(() => `${game().eggs} œufs · ${game().ducks.length} / ${DUCK_LIMIT} canards · équipe ${game().team.length} / ${TEAM_SIZE}. Seule l'équipe donne ses bonus.`);
    const nest = game().nest;
    if (nest) {
      this.row(nest.parents ? "Élevage en cours" : "Œuf en couveuse", () => (Date.now() >= nest.end ? "Prêt !" : `Encore ${duration(nest.end - Date.now())}`),
        this.button("Ouvrir", () => Date.now() >= nest.end, () => {
          const duck = collectNest(game(), Date.now(), Math.random);
          if (duck) this.say(`${duck.shiny ? "BRILLANT ! " : ""}${duck.name}, ${RARITIES[duck.rarity]}`, 6000);
        }));
    } else {
      this.row("Couveuse", "Fais éclore un œuf (30 min)", this.button("Couver", () => game().eggs > 0 && game().ducks.length < DUCK_LIMIT, () => startHatch(game(), Date.now())));
      this.row("Élevage", () => (this.parents.length === 2 ? `2 parents choisis · ${BREED_BREAD} Pain · 1 h` : `Choisis 2 parents avec ♥ · ${BREED_BREAD} Pain`),
        this.button("Élever", () => this.parents.length === 2 && game().bread >= BREED_BREAD && game().ducks.length < DUCK_LIMIT, () => { startBreeding(game(), this.parents[0], this.parents[1], Date.now()); this.parents = []; }));
    }
    this.heading("Tes canards");
    for (const duck of [...game().ducks].sort((a, b) => b.rarity - a.rarity)) {
      const traits = duck.traits.map((t) => TRAITS[t].name).join(", ");
      const name = `${duck.shiny ? "✨ " : ""}${duck.name}`;
      this.row(name, `${RARITIES[duck.rarity]} · ${traits}`,
        this.button(() => (game().team.includes(duck.id) ? "Équipe ✓" : "Équipe"), () => game().team.includes(duck.id) || game().team.length < TEAM_SIZE, () => toggleTeam(game(), duck.id)),
        this.button(() => (this.parents.includes(duck.id) ? "♥ ✓" : "♥"), () => true, () => {
          this.parents = this.parents.includes(duck.id) ? this.parents.filter((id) => id !== duck.id) : [...this.parents, duck.id].slice(-2);
        }),
        this.confirmButton(`free-${duck.id}`, `+${1 + duck.rarity} gemme`, () => true, () => { releaseDuck(game(), duck.id); this.parents = this.parents.filter((id) => id !== duck.id); }));
    }
  }

  tab_tree() {
    const game = () => this.game;
    this.text(() => `${game().feathers} plumes à dépenser sur ${game().feathersTotal} gagnées. Chaque plume gagnée donne aussi +2 % à tout.`);
    for (const branch of ["Clics", "Production", "Expéditions", "Gestion"]) {
      this.heading(branch);
      for (const node of TREE.filter((n) => n.branch === branch)) {
        this.row(node.name, node.note, this.button(() => (hasNode(game(), node.id) ? "Acquis" : node.needs && !hasNode(game(), node.needs) ? "Verrouillé" : `${node.cost} plumes`),
          () => !hasNode(game(), node.id) && game().feathers >= node.cost && (!node.needs || hasNode(game(), node.needs)), () => buyNode(game(), node.id)));
      }
    }
    this.heading("Tout changer");
    this.rows.body.append(this.confirmButton("respec", "Reprendre toutes mes plumes", () => game().tree.length > 0, () => respec(game())));
  }

  tab_challenges() {
    const game = () => this.game;
    this.text(`Un défi recommence ta partie avec un handicap. Atteins ${format(CHALLENGE_GOAL)} Coins gagnés pour le réussir : production ×${String(CHALLENGE_BONUS).replace(".", ",")} pour toujours.`);
    if (game().challenge) {
      const current = activeChallenge(game());
      this.row(current.name, () => `${format(game().run)} / ${format(CHALLENGE_GOAL)}`, this.confirmButton("quit", "Abandonner", () => true, () => this.replaceGame(abandonChallenge(game()))));
      return;
    }
    for (const challenge of CHALLENGES) {
      const done = game().challengesDone.includes(challenge.id);
      this.row(challenge.name, challenge.note, this.confirmButton(`try-${challenge.id}`, done ? "Réussi" : "Lancer", () => !done, () => this.replaceGame(startChallenge(game(), challenge.id))));
    }
  }

  tab_relics() {
    const game = () => this.game;
    this.text(() => `${game().gems} gemmes. Les reliques restent pour toujours, même après une saison.`);
    for (const relic of RELICS) {
      this.row(relic.name, relic.note, this.button(() => (hasRelic(game(), relic.id) ? "Acquise" : `${relic.cost} gemmes`), () => !hasRelic(game(), relic.id) && game().gems >= relic.cost, () => buyRelic(game(), relic.id)));
    }
  }

  tab_quests() {
    const game = () => this.game;
    this.text(() => `Série de ${game().daily?.streak ?? 0} jour(s). Chaque quête donne 1 gemme, 600 Pain et 3 éclats de plume. Elles changent chaque jour.`);
    (game().daily?.quests ?? []).forEach((quest, index) => {
      const { about } = questProgress(game(), quest);
      const scale = about.scale ?? 1;
      this.row(about.name.replace("{n}", about.goal / scale), () => `${Math.floor(questProgress(game(), quest).value / scale)} / ${about.goal / scale}`,
        this.button(() => (quest.done ? "Reçu" : "Prendre"), () => !quest.done && questProgress(game(), quest).value >= about.goal, () => claimQuest(game(), index)));
    });
  }

  tab_trophies() {
    const game = () => this.game;
    this.text(() => `${game().achievements.length} / ${ACHIEVEMENTS.length} succès. Chacun donne +1 % de production pour toujours.`);
    for (const achievement of ACHIEVEMENTS) {
      const done = game().achievements.includes(achievement.id);
      this.row(`${done ? "✓ " : ""}${achievement.name}`, `Objectif : ${format(achievement.goal)}`);
    }
  }

  tab_season() {
    const game = () => this.game;
    this.text(() => `Saison ${game().season}, ${game().stars} étoiles (+${game().stars * 50} % à tout).\nUne nouvelle saison efface Coins, bâtiments, plumes et arbre. Tu gardes canards, reliques, succès, défis et chiens. Saisons 1, 2 et 3 : un nouveau bâtiment.`);
    this.rows.body.append(this.confirmButton("season", () => (seasonGain(game()) > 0 ? `Nouvelle saison (+${seasonGain(game())} étoiles)` : `Il te faut ${seasonNeed(game())} plumes gagnées`), () => seasonGain(game()) > 0 && !game().challenge, () => {
      this.replaceGame(newSeason(game()));
      this.say("Nouvelle saison !", 4000);
    }));
  }

  tab_gifts() {
    const game = () => this.game;
    this.text("Fais un cadeau à un ami : copie le code et envoie-le toi-même. Rien n'est jamais envoyé pour toi.");
    this.heading("Offrir");
    const gift = (label, kind, amount, enabled) => this.button(label, enabled, () => {
      const code = makeGift(game(), kind, amount, Math.random);
      if (code) this.copy(code);
    });
    this.row("1 000 Pain", () => `Tu as ${format(game().bread)} Pain`, gift("Copier le code", "pain", 1000, () => game().bread >= 1000));
    this.row("1 gemme", () => `Tu as ${game().gems} gemmes`, gift("Copier le code", "gemme", 1, () => game().gems >= 1));
    this.row("1 œuf", () => `Tu as ${game().eggs} œufs`, gift("Copier le code", "oeuf", 1, () => game().eggs >= 1));
    this.heading("Recevoir");
    const input = document.createElement("input");
    input.placeholder = "Colle un code COIN-...";
    input.style.cssText = "width:100%;box-sizing:border-box;padding:8px;margin-bottom:6px;border:none;border-radius:4px;background:#1e1f22;color:#fff";
    input.onkeydown = (e) => e.stopPropagation();
    this.rows.body.append(input);
    this.rows.body.append(this.button("Ouvrir le cadeau", () => true, () => {
      const result = openGift(game(), input.value);
      this.say(result.error ?? `Cadeau reçu : ${result.amount} ${result.kind}`, 4000);
    }));
  }

  copy(text) {
    if (window.DiscordNative?.clipboard?.copy) window.DiscordNative.clipboard.copy(text);
    else navigator.clipboard?.writeText(text);
    BdApi.UI.showToast("Code copié. Envoie-le à ton ami.", { type: "success" });
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
}

module.exports = LeCanard;
Object.assign(module.exports, { clean, perSecond, perClick, costOf, prestige, prestigeGain, offlineGain, format, earn, buyGenerator, buyNode, sendExpedition, claimExpedition, startHatch, collectNest, startBreeding, marketIndex, buyBread, sellBread, advance, startChallenge, newSeason, seasonGain, makeGift, openGift, refreshDaily, claimQuest, ACHIEVEMENTS });
