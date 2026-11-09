/**
 * @name LeCanard
 * @author Kerminat0r
 * @version 4.2.0
 * @description Un énorme jeu incrémental dans Discord : 18 bâtiments, 100+ améliorations, événements, minijeux, collection de canards et skins, chapeaux, expéditions, marché du Pain et 150+ succès. Clic sur le canard pour gagner, clic droit pour ouvrir le jeu.
 */

// Golden duck sound: "Mallard Duck" by Mike Koenig (https://soundbible.com/1852-Mallard-Duck.html),
// licensed under Creative Commons Attribution 3.0 (https://creativecommons.org/licenses/by/3.0/). Used unchanged.

const SAVE_VERSION = 4;
const COST_GROWTH = 1.15;
const FRENZY_BONUS = 5;
const CLICK_FRENZY_BONUS = 7;
const VOICE_BONUS = 1.5;
const CLOVER_BONUS = 1.5;
const OFFLINE_MIN_S = 60;
const PRESTIGE_STEP = 1e7;
const FEATHER_BONUS = 0.02;
const ACHIEVEMENT_BONUS = 0.01;
const CATALOGUE_BONUS = 0.02;
const TROPHY_BONUS = 0.03;
const CHALLENGE_BONUS = 1.2;
const CHALLENGE_GOAL = 1e8;
const STAR_TO_FEATHERS = 25;
const COIN_LIMIT = 1e300;
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
const GAME_COOLDOWN_MS = 10 * 60000;
const EGG_HUNT_EGGS = 6;
const EGG_HUNT_CELLS = 25;
const RACE_PAYOUT = 3.6;
const RACE_BET_SHARE = 0.1;
const SLOT_COST = 200;
const FISH_PER_GEM = 10;
const UPGRADE_TIERS = [{ owned: 10, price: 10 }, { owned: 25, price: 50 }, { owned: 50, price: 500 }, { owned: 100, price: 50000 }, { owned: 200, price: 5e7 }];

const GENERATORS = [
  { id: "caneton", name: "Caneton", base: 15, rate: 0.1 },
  { id: "mare", name: "Mare", base: 100, rate: 1 },
  { id: "eleveur", name: "Éleveur", base: 1100, rate: 8 },
  { id: "ferme", name: "Ferme à canards", base: 12000, rate: 47 },
  { id: "usine", name: "Usine à coins", base: 130000, rate: 260 },
  { id: "empire", name: "Empire canard", base: 1400000, rate: 1400 },
  { id: "temple", name: "Temple du Coin", base: 2e7, rate: 7800 },
  { id: "cite", name: "Cité-Canard", base: 3.3e8, rate: 44000 },
  { id: "station", name: "Station orbitale", base: 5.1e9, rate: 260000 },
  { id: "banque", name: "Banque du Pain", base: 7.5e10, rate: 1.6e6 },
  { id: "volcan", name: "Volcan à coins", base: 1e12, rate: 1e7 },
  { id: "labo", name: "Laboratoire Coin-Coin", base: 1.4e13, rate: 6.5e7 },
  { id: "portail", name: "Portail des mares", base: 1.7e14, rate: 4.3e8 },
  { id: "lune", name: "Lune-Canard", base: 2.1e15, rate: 2.9e9 },
  { id: "galaxie", name: "Galaxie plumée", base: 2.6e16, rate: 2.1e10 },
  { id: "horloge", name: "Horloge du temps", base: 3.1e17, rate: 1.5e11 },
  { id: "multivers", name: "Multivers à canards", base: 7.1e18, rate: 1.1e12 },
  { id: "divin", name: "Le Canard Divin", base: 1.2e20, rate: 8.3e12 }
];

const TIER_NAMES = ["Entraînement", "Motivation", "Excellence", "Légende", "Divinité"];

const UPGRADES = [
  { id: "bec", name: "Bec renforcé", note: "Clics ×2", cost: 100 },
  { id: "pain", name: "Pain rassis", note: "Canetons ×2", cost: 500 },
  { id: "nenuphars", name: "Nénuphars", note: "Mares ×2", cost: 5000 },
  { id: "palmes", name: "Palmes dorées", note: "Clics ×3", cost: 10000 },
  { id: "synergie", name: "Coin-coin collectif", note: "Chaque clic ajoute 2 % de ton /s", cost: 50000 },
  { id: "syndicat", name: "Syndicat des canards", note: "Toute la production ×2", cost: 500000 },
  { id: "famille", name: "Grande famille", note: "Chaque Caneton donne +1 % aux Mares", cost: 2e6, needs: { mare: 50 } },
  { id: "tracteur", name: "Tracteurs", note: "Chaque Éleveur donne +0,5 % aux Fermes", cost: 5e7, needs: { ferme: 50 } },
  { id: "chaine", name: "Chaîne de montage", note: "Chaque Ferme donne +0,5 % aux Usines", cost: 5e8, needs: { usine: 50 } },
  { id: "courtisans", name: "Courtisans", note: "Chaque Usine donne +0,5 % aux Empires", cost: 5e9, needs: { empire: 50 } },
  { id: "souris", name: "Souris en or", note: "Clics ×5", cost: 1e9, needs: { clicks: 5000 } },
  { id: "souris2", name: "Souris en diamant", note: "Clics ×10", cost: 1e13, needs: { clicks: 50000 } },
  { id: "panier", name: "Panier à œufs", note: "Butin d'expédition ×1,5", cost: 1e8, needs: { expeditions: 10 } },
  { id: "flair", name: "Flair doré", note: "Canards dorés 30 % plus fréquents", cost: 5e7, needs: { goldCaught: 10 } },
  { id: "boulanger", name: "Four à bois", note: "Consommation de Pain -25 %", cost: 1e8, needs: { trades: 25 } },
  { id: "parapluie", name: "Grand parapluie", note: "Pluies de canards 2× plus longues", cost: 1e9, needs: { rainDucks: 50 } },
  { id: "trefle", name: "Trèfle porte-bonheur", note: "Les trèfles durent 2× plus longtemps", cost: 1e10, needs: { clovers: 5 } },
  { id: "filet", name: "Filet de pêche", note: "Poissons rares plus fréquents", cost: 1e7, needs: { fish: 30 } }
];
for (const generator of GENERATORS) {
  UPGRADE_TIERS.forEach((tier, index) => {
    UPGRADES.push({ id: `${generator.id}-${index}`, name: `${generator.name} : ${TIER_NAMES[index]}`, note: `${generator.name} ×2`, cost: generator.base * tier.price, needs: { [generator.id]: tier.owned }, doubles: generator.id });
  });
}

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
  { id: "g5", branch: "Gestion", name: "Chasse au trésor", note: "Canard doré 2× plus souvent", cost: 18, needs: "g4" },
  { id: "f1", branch: "Fête", name: "Nuages chargés", note: "Pluies de canards 2× plus fréquentes", cost: 3 },
  { id: "f2", branch: "Fête", name: "Mouette maladroite", note: "Les mouettes rendent 2× plus", cost: 5, needs: "f1" },
  { id: "f3", branch: "Fête", name: "Champ de trèfles", note: "Trèfles 2× plus fréquents", cost: 8, needs: "f2" },
  { id: "f4", branch: "Fête", name: "Joueur né", note: "Jeux 2× plus souvent (recharge ÷2)", cost: 12, needs: "f3" },
  { id: "f5", branch: "Fête", name: "Chance insolente", note: "Gains des jeux ×2", cost: 20, needs: "f4" }
];

const RELICS = [
  { id: "r1", name: "Coupe du champion", note: "Production ×1,5", cost: 5 },
  { id: "r2", name: "Sifflet ancien", note: "Risque d'expédition -20 %", cost: 10 },
  { id: "r3", name: "Œil de lynx", note: "Clics ×2", cost: 15 },
  { id: "r4", name: "Fer à cheval", note: "Butin ×1,5", cost: 25 },
  { id: "r5", name: "Couronne du Coin", note: "Plumes gagnées ×1,5", cost: 50 },
  { id: "r6", name: "Boussole dorée", note: "Trouvailles rares 2× plus fréquentes", cost: 40 },
  { id: "r7", name: "Dé pipé", note: "Machine à sous plus généreuse", cost: 30 }
];

const CHALLENGES = [
  { id: "mains", name: "Sans les mains", note: "Les clics ne rapportent rien. Tu commences avec 1 Mare et 1 Caneton.", noClick: true, starter: { mare: 1, caneton: 1 } },
  { id: "mares", name: "Que des Mares", note: "Seules les Mares sont en vente", onlyMare: true },
  { id: "regime", name: "Régime sec", note: "Marché fermé et faim permanente", noMarket: true },
  { id: "austerite", name: "Austérité", note: "Aucune amélioration", noUpgrades: true },
  { id: "inflation", name: "Inflation", note: "Tout coûte 3× plus cher", dear: true },
  { id: "solitaire", name: "Canard solitaire", note: "Pas d'expédition ni d'équipe", noTeam: true }
];

const ZONES = [
  { id: "etang", name: "Étang voisin", hours: 1 / 6, risk: 0.05, egg: 0.1, gem: 0.05, fragment: 1, find: 0.02 },
  { id: "foret", name: "Forêt sombre", hours: 1, risk: 0.12, egg: 0.3, gem: 0.2, fragment: 3, find: 0.05 },
  { id: "desert", name: "Désert brûlant", hours: 2, risk: 0.15, egg: 0.4, gem: 0.35, fragment: 5, find: 0.08 },
  { id: "montagne", name: "Montagne glacée", hours: 4, risk: 0.2, egg: 0.6, gem: 0.6, fragment: 8, find: 0.12 },
  { id: "volcan", name: "Volcan grondant", hours: 6, risk: 0.25, egg: 0.8, gem: 0.9, fragment: 12, find: 0.16 },
  { id: "mer", name: "Mer lointaine", hours: 8, risk: 0.3, egg: 1, gem: 1.2, fragment: 16, find: 0.2 },
  { id: "espace", name: "Espace profond", hours: 12, risk: 0.35, egg: 1.5, gem: 2, fragment: 25, find: 0.3 }
];

const STORIES = {
  etang: ["Ils ont nagé en rond et trouvé un caillou brillant.", "Une grenouille leur a appris un nouveau coin-coin.", "Ils ont fait la course avec un cygne. Et perdu."],
  foret: ["Ils ont suivi des champignons lumineux jusqu'à un trésor.", "Un hibou leur a raconté des histoires toute la nuit.", "Ils se sont perdus, puis retrouvés grâce à l'odeur du pain."],
  desert: ["Un mirage de mare les a fait marcher trois heures.", "Ils ont surfé sur les dunes. Magnifique.", "Un chameau voulait les adopter."],
  montagne: ["Ils ont glissé sur la neige pendant 4 kilomètres.", "Un yéti les a invités à boire un chocolat chaud.", "Ils ont planté un drapeau Coin au sommet."],
  volcan: ["Ils ont fait cuire du pain sur la lave.", "Un dragon minuscule les a suivis jusqu'à la sortie.", "Ils ont plumé... non, survécu de justesse."],
  mer: ["Ils ont rencontré un poisson qui parle. Il était impoli.", "Ils ont trouvé une bouteille avec un message : « coin ».", "Une baleine les a portés sur son dos."],
  espace: ["Ils ont planté un drapeau sur la Lune. Il était déjà là.", "Des extraterrestres voulaient échanger contre du pain.", "Ils ont vu la Terre. Elle ressemble à une grosse mare."]
};

const TRAITS = {
  prod: { name: "Travailleur", value: 0.1 },
  click: { name: "Rapide", value: 0.2 },
  loot: { name: "Chanceux", value: 0.1 },
  risk: { name: "Éclaireur", value: 0.05 },
  gold: { name: "Doré", value: 0.1 },
  cost: { name: "Bâtisseur", value: 0.01 }
};
const TRAIT_IDS = Object.keys(TRAITS);
const RARITIES = ["Commun", "Rare", "Épique", "Légendaire"];
const DUCK_NAMES = ["Gaston", "Coincoin", "Patrice", "Bernadette", "Plouf", "Monsieur Bec", "Duchesse", "Nugget", "Biscotte", "Capitaine", "Tartine", "Roger"];

// The catalogue: special ducks found through play. Each one owned adds +2 % production.
const CATALOGUE = [
  ["pirate", "Canard pirate", 0, "🏴‍☠️", "expedition"], ["ninja", "Canard ninja", 250, "🥷", "expedition"], ["astronaute", "Canard astronaute", 200, "🚀", "expedition"],
  ["chef", "Canard cuisinier", 30, "👨‍🍳", "slots"], ["roi", "Canard roi", 50, "👑", "gold"], ["sorcier", "Canard sorcier", 270, "🧙", "expedition"],
  ["pompier", "Canard pompier", 0, "🚒", "expedition"], ["detective", "Canard détective", 30, "🔍", "eggs"], ["robot", "Canard robot", 180, "🤖", "expedition"],
  ["vampire", "Canard vampire", 320, "🧛", "expedition"], ["surfeur", "Canard surfeur", 190, "🏄", "rain"], ["dj", "Canard DJ", 290, "🎧", "slots"],
  ["peintre", "Canard peintre", 120, "🎨", "eggs"], ["cowboy", "Canard cowboy", 35, "🤠", "race"], ["clown", "Canard clown", 340, "🤡", "slots"],
  ["fantome", "Canard fantôme", 0, "👻", "expedition"], ["glace", "Canard des glaces", 190, "🧊", "expedition"], ["lave", "Canard de lave", 15, "🌋", "expedition"],
  ["desert", "Canard du désert", 40, "🌵", "expedition"], ["dore", "Canard d'or massif", 50, "🪙", "gold"], ["arcenciel", "Canard arc-en-ciel", 300, "🌈", "rain"],
  ["zombie", "Canard zombie", 90, "🧟", "expedition"], ["chevalier", "Canard chevalier", 210, "🛡️", "race"], ["scientifique", "Canard scientifique", 160, "🔬", "eggs"],
  ["musicien", "Canard musicien", 280, "🎸", "slots"], ["pecheur", "Canard pêcheur", 200, "🎣", "fish"], ["sumo", "Canard sumo", 20, "🍙", "race"],
  ["alien", "Canard alien", 100, "👽", "expedition"], ["bebe", "Canard bébé", 55, "🍼", "eggs"], ["mamie", "Canard mamie", 300, "🧶", "eggs"],
  ["detective2", "Canard espion", 230, "🕶️", "expedition"], ["super", "Super Canard", 0, "🦸", "race"], ["licorne", "Canard licorne", 310, "🦄", "rain"],
  ["pharaon", "Canard pharaon", 45, "🏺", "expedition"], ["viking", "Canard viking", 25, "🪓", "expedition"], ["sirene", "Canard sirène", 185, "🧜", "fish"],
  ["requin", "Canard requin", 205, "🦈", "fish"], ["plombier", "Canard plombier", 0, "🔧", "slots"], ["poete", "Canard poète", 260, "📜", "eggs"],
  ["cosmique", "Canard cosmique", 240, "🌌", "expedition"]
].map(([id, name, hue, badge, source]) => ({ id, name, hue, badge, source }));

const HATS = [
  { id: "casquette", name: "Casquette", needs: (g) => g.clicks >= 100, how: "Clique 100 fois" },
  { id: "couronne", name: "Couronne", needs: (g) => g.stats.goldCaught >= 10, how: "Attrape 10 canards dorés" },
  { id: "sorcier", name: "Chapeau de sorcier", needs: (g) => g.feathersTotal >= 10, how: "Gagne 10 plumes" },
  { id: "haut", name: "Haut-de-forme", needs: (g) => g.lifetime >= 1e12, how: "Gagne 1 Bn de Coins au total" },
  { id: "pirate", name: "Tricorne", needs: (g) => g.stats.expeditions >= 25, how: "Termine 25 expéditions" },
  { id: "fete", name: "Chapeau de fête", needs: (g) => g.stats.rainDucks >= 100, how: "Attrape 100 canards de pluie" },
  { id: "cowboy", name: "Chapeau de cowboy", needs: (g) => g.stats.racesWon >= 5, how: "Gagne 5 courses" },
  { id: "chef", name: "Toque", needs: (g) => g.stats.trades >= 50, how: "Fais 50 échanges au marché" },
  { id: "aureole", name: "Auréole", needs: (g) => g.achievements.length >= 100, how: "Débloque 100 succès" },
  { id: "antennes", name: "Antennes", needs: (g) => g.owned.station >= 1, how: "Achète une Station orbitale" },
  { id: "bonnet", name: "Bonnet", needs: (g) => g.stats.fish >= 50, how: "Pêche 50 poissons" },
  { id: "viking", name: "Casque viking", needs: (g) => g.stats.foxes >= 25, how: "Chasse 25 renards" }
];

const TROPHIES = [
  ["piece", "Pièce antique"], ["fossile", "Fossile de canard"], ["meteorite", "Météorite"], ["perle", "Perle géante"], ["carte", "Carte au trésor"],
  ["oeuf-or", "Œuf en or"], ["dent", "Dent de dragon"], ["etoile", "Étoile de mer dorée"], ["boussole", "Boussole cassée"], ["coquillage", "Coquillage chantant"],
  ["cristal", "Cristal de glace éternelle"], ["plume-phenix", "Plume de phénix"], ["statuette", "Statuette Coin"], ["sablier", "Sablier du désert"], ["lanterne", "Lanterne ancienne"],
  ["couronne", "Couronne engloutie"], ["roche-lunaire", "Roche lunaire"], ["bouteille", "Bouteille à la mer"], ["ambre", "Ambre avec un moustique"], ["diamant", "Diamant brut"]
].map(([id, name]) => ({ id, name }));

const FISH = [
  { id: "sardine", name: "Sardine", chance: 0.6, value: 1 },
  { id: "truite", name: "Truite", chance: 0.28, value: 2 },
  { id: "saumon", name: "Saumon royal", chance: 0.1, value: 5 },
  { id: "dore", name: "Poisson doré", chance: 0.02, value: 20 }
];

const SLOT_SYMBOLS = ["🦆", "🍞", "💎", "🥚", "🪙", "🍀"];

const QUESTS = [
  { id: "clics", name: "Clique {n} fois", stat: "clicks", goal: 300 },
  { id: "or", name: "Attrape {n} canard doré", stat: "goldCaught", goal: 1 },
  { id: "exp", name: "Termine {n} expéditions", stat: "expeditions", goal: 2 },
  { id: "marche", name: "Fais {n} échanges au marché", stat: "trades", goal: 3 },
  { id: "renard", name: "Chasse {n} renards", stat: "foxes", goal: 2 },
  { id: "vocal", name: "Passe {n} minutes en vocal", stat: "voiceSeconds", goal: 1800, scale: 60 },
  { id: "peche", name: "Pêche {n} poissons", stat: "fish", goal: 5 },
  { id: "pluie", name: "Attrape {n} canards de pluie", stat: "rainDucks", goal: 10 },
  { id: "jeux", name: "Joue {n} parties de minijeux", stat: "gamesPlayed", goal: 3 }
];

const STATS = ["leaps", "goldCaught", "expeditions", "foxes", "trades", "voiceSeconds", "gifts", "rainDucks", "seagulls", "clovers", "fish", "racesWon", "racesLost", "slotsPlayed", "jackpots", "eggsFound", "gamesPlayed", "lostDucks", "bestPerSecond", "fastestMinute", "hatched"];

const ACHIEVEMENTS = [];
function tiers(prefix, label, read, goals, secret) {
  goals.forEach((goal, index) => ACHIEVEMENTS.push({ id: `${prefix}${index}`, name: goals.length > 1 ? `${label} ${index + 1}` : label, goal, read, secret }));
}
tiers("coins", "Tas de Coins", (g) => g.lifetime, [1e3, 1e5, 1e7, 1e9, 1e11, 1e13, 1e16, 1e20, 1e25, 1e30, 1e40, 1e50]);
tiers("click", "Doigt d'or", (g) => g.clicks, [100, 1000, 10000, 100000, 1e6]);
for (const generator of GENERATORS) tiers(`own-${generator.id}-`, generator.name, (g) => g.owned[generator.id], [1, 50, 100, 200]);
tiers("leap", "Grand voyageur", (g) => g.stats.leaps, [1, 5, 25, 100]);
tiers("gold", "Chasseur d'or", (g) => g.stats.goldCaught, [1, 10, 50, 200]);
tiers("exp", "Explorateur", (g) => g.stats.expeditions, [1, 10, 100, 500]);
tiers("fox", "Garde-chasse", (g) => g.stats.foxes, [1, 25, 100]);
tiers("duck", "Éleveur passionné", (g) => g.ducks.length, [1, 10, 25]);
tiers("defi", "Sans peur", (g) => g.challengesDone.length, [1, 3, 6]);
tiers("trade", "Boulanger", (g) => g.stats.trades, [10, 100, 1000]);
tiers("voice", "Bavard", (g) => g.stats.voiceSeconds, [3600, 36000, 360000]);
tiers("rain", "Sous la pluie", (g) => g.stats.rainDucks, [10, 100, 1000]);
tiers("gull", "Ennemi des mouettes", (g) => g.stats.seagulls, [1, 25, 100]);
tiers("clover", "Main verte", (g) => g.stats.clovers, [1, 10, 50]);
tiers("fish", "Pêcheur", (g) => g.stats.fish, [10, 100, 500]);
tiers("race", "Turfiste", (g) => g.stats.racesWon, [1, 10, 50]);
tiers("slot", "Joueur", (g) => g.stats.slotsPlayed, [10, 100, 500]);
tiers("eggs", "Chasseur d'œufs", (g) => g.stats.eggsFound, [10, 100, 500]);
tiers("cat", "Collectionneur", (g) => g.catalogue.length, [5, 20, 40]);
tiers("trophy", "Archéologue", (g) => g.trophies.length, [3, 10, 20]);
tiers("hat", "Coquet", (g) => g.hats.length, [3, 12]);
tiers("upg", "Améliorateur", (g) => g.upgrades.length, [10, 50, 100]);
tiers("tree", "Botaniste", (g) => g.tree.length, [5, 25]);
tiers("relic", "Antiquaire", (g) => g.relics.length, [3, 7]);
tiers("s-jackpot", "Jackpot !", (g) => g.stats.jackpots, [1], true);
tiers("s-speed", "Doigts de feu", (g) => g.stats.fastestMinute, [600], true);
tiers("s-777", "Chiffre porte-bonheur", (g) => (Math.floor(g.coins) === 777 ? 1 : 0), [1], true);
tiers("s-lose", "Mauvais parieur", (g) => g.stats.racesLost, [10], true);
tiers("s-lost", "Capitaine maladroit", (g) => g.stats.lostDucks, [100], true);
tiers("s-shiny", "Ça brille !", (g) => g.ducks.filter((d) => d.shiny).length, [1], true);
tiers("s-poor", "Fauché", (g) => (g.lifetime > 1e6 && g.coins < 1 ? 1 : 0), [1], true);
tiers("s-goldfish", "Poisson doré", (g) => g.stats.goldfish ?? 0, [1], true);

const fresh = () => ({
  version: SAVE_VERSION, coins: 0, run: 0, lifetime: 0, clicks: 0, feathers: 0, feathersTotal: 0,
  owned: {}, upgrades: [], tree: [], relics: [], savedAt: Date.now(), bread: 0, hunger: 0, dogs: 0,
  gems: 0, eggs: 0, fragments: 0, fishStock: 0, expeditions: [], nextId: 1, ducks: [], team: [], nest: null,
  challenge: null, challengesDone: [], achievements: [], stats: {}, daily: null, codesUsed: [], codesSent: [],
  catalogue: [], hats: [], hat: null, skin: null, trophies: [], cooldowns: {}, stories: []
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
  for (const key of ["coins", "run", "lifetime", "clicks", "feathers", "feathersTotal", "bread", "hunger", "dogs", "gems", "eggs", "fragments", "fishStock"]) game[key] = positive(game[key]);
  if (!Number.isFinite(game.savedAt) || game.savedAt <= 0) game.savedAt = Date.now();
  game.nextId = Math.max(1, Math.floor(positive(game.nextId)));
  game.hunger = Math.min(1, game.hunger);
  const owned = {};
  for (const generator of GENERATORS) {
    const count = game.owned?.[generator.id];
    owned[generator.id] = Number.isInteger(count) && count > 0 ? count : 0;
  }
  game.owned = owned;
  const known = (items, all) => list(items).filter((id, index, array) => all.some((x) => x.id === id) && array.indexOf(id) === index);
  game.upgrades = known(game.upgrades, UPGRADES);
  game.tree = known(game.tree, TREE);
  game.relics = known(game.relics, RELICS);
  game.achievements = known(game.achievements, ACHIEVEMENTS);
  game.challengesDone = known(game.challengesDone, CHALLENGES);
  game.catalogue = known(game.catalogue, CATALOGUE);
  game.hats = known(game.hats, HATS);
  game.trophies = known(game.trophies, TROPHIES);
  game.hat = game.hats.includes(game.hat) ? game.hat : null;
  game.skin = game.catalogue.includes(game.skin) ? game.skin : null;
  game.challenge = CHALLENGES.some((c) => c.id === game.challenge) ? game.challenge : null;
  game.expeditions = list(game.expeditions).filter((e) => e && ZONES.some((z) => z.id === e.zone) && Number.isFinite(e.end) && e.ducklings > 0);
  game.ducks = list(game.ducks).filter((d) => d && d.id && Array.isArray(d.traits));
  game.team = list(game.team).filter((id) => game.ducks.some((d) => d.id === id)).slice(0, TEAM_SIZE);
  game.codesUsed = list(game.codesUsed);
  game.codesSent = list(game.codesSent);
  game.stories = list(game.stories).filter((s) => typeof s === "string").slice(0, 20);
  const cooldowns = {};
  for (const key of ["eggs", "race", "fish", "slots"]) cooldowns[key] = positive(game.cooldowns?.[key]);
  game.cooldowns = cooldowns;
  const stats = {};
  for (const key of [...STATS, "goldfish"]) stats[key] = positive(game.stats?.[key]);
  game.stats = stats;
  if (!(input.version >= 3) && input.version === undefined && game.feathers > 0) {
    game.feathers = compressFeathers(game.feathers);
    game.run = Math.min(game.run, PRESTIGE_STEP * 1000);
  }
  if (!(input.version >= 4)) {
    const stars = positive(input.stars);
    game.feathers += stars * STAR_TO_FEATHERS;
    game.feathersTotal += stars * STAR_TO_FEATHERS;
  }
  delete game.stars;
  delete game.season;
  game.feathersTotal = Math.max(game.feathersTotal, game.feathers);
  game.version = SAVE_VERSION;
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
  defense: (g) => g.lifetime >= DEFENSE_UNLOCK,
  games: (g) => g.lifetime >= 10000
};

// Requirements that must be met before an upgrade appears in the shop.
function upgradeVisible(game, upgrade) {
  if (has(game, upgrade.id)) return false;
  for (const [key, goal] of Object.entries(upgrade.needs ?? {})) {
    const value = key in game.owned ? game.owned[key] : key === "clicks" ? game.clicks : game.stats[key];
    if (!(value >= goal)) return false;
  }
  return true;
}

const costMultiplier = (game) => (activeChallenge(game)?.dear ? 3 : 1) * (1 - Math.min(0.5, duckBonus(game, "cost")));
const costOf = (game, generator) => Math.ceil(generator.base * COST_GROWTH ** game.owned[generator.id] * costMultiplier(game));
const upgradeCost = (game, upgrade) => Math.ceil(upgrade.cost * (activeChallenge(game)?.dear ? 3 : 1));
const dogCost = (game) => Math.ceil(DOG_BASE * DOG_GROWTH ** game.dogs);
const dogChance = (game) => Math.min(DOG_MAX_CHANCE, game.dogs * DOG_CHANCE);
const generatorOpen = (game, generator) => !activeChallenge(game)?.onlyMare || generator.id === "mare";

function rateOf(game, generator) {
  let rate = generator.rate;
  if (generator.id === "caneton" && has(game, "pain")) rate *= 2;
  if (generator.id === "mare" && has(game, "nenuphars")) rate *= 2;
  for (let index = 0; index < UPGRADE_TIERS.length; index++) if (has(game, `${generator.id}-${index}`)) rate *= 2;
  if (generator.id === "mare" && has(game, "famille")) rate *= 1 + game.owned.caneton * 0.01;
  if (generator.id === "ferme" && has(game, "tracteur")) rate *= 1 + game.owned.eleveur * 0.005;
  if (generator.id === "usine" && has(game, "chaine")) rate *= 1 + game.owned.ferme * 0.005;
  if (generator.id === "empire" && has(game, "courtisans")) rate *= 1 + game.owned.usine * 0.005;
  return rate;
}

function productionBonus(game) {
  let bonus = (has(game, "syndicat") ? 2 : 1)
    * featherBonus(game)
    * (1 + game.achievements.length * ACHIEVEMENT_BONUS)
    * (1 + game.catalogue.length * CATALOGUE_BONUS)
    * (1 + game.trophies.length * TROPHY_BONUS)
    * CHALLENGE_BONUS ** game.challengesDone.length
    * (1 + duckBonus(game, "prod"));
  if (hasNode(game, "p1")) bonus *= 1.5;
  if (hasNode(game, "p2")) bonus *= 2;
  if (hasNode(game, "p5")) bonus *= 3;
  if (hasRelic(game, "r1")) bonus *= 1.5;
  return bonus;
}

// +2 % per plume for the first 100, then slower, so huge piles of plumes can't break the game.
const featherBonus = (game) => 1 + FEATHER_BONUS * Math.min(game.feathersTotal, 100) + 0.1 * Math.max(0, Math.sqrt(game.feathersTotal) - 10);
const hungerPenalty = (game) => 1 - game.hunger * HUNGER_DROP;

function perSecond(game) {
  const base = GENERATORS.reduce((sum, g) => sum + game.owned[g.id] * rateOf(game, g), 0);
  return base * productionBonus(game) * hungerPenalty(game);
}

function perClick(game) {
  if (activeChallenge(game)?.noClick) return 0;
  let base = (has(game, "bec") ? 2 : 1) * (has(game, "palmes") ? 3 : 1) * (has(game, "souris") ? 5 : 1) * (has(game, "souris2") ? 10 : 1) * (1 + duckBonus(game, "click"));
  if (hasNode(game, "c1")) base *= 2;
  if (hasNode(game, "c4")) base *= 3;
  if (hasRelic(game, "r3")) base *= 2;
  const share = (has(game, "synergie") ? 0.02 : 0) + (hasNode(game, "c3") ? 0.03 : 0);
  return base * featherBonus(game) + perSecond(game) * share;
}

// boosts: { frenzy, clickFrenzy }
function clickGain(game, boosts, rng) {
  let gain = perClick(game);
  if (boosts.frenzy) gain *= FRENZY_BONUS * (hasNode(game, "c5") ? 2 : 1);
  if (boosts.clickFrenzy) gain *= CLICK_FRENZY_BONUS;
  if (hasNode(game, "c2") && rng() < 0.05) gain *= 10;
  return gain;
}

function earn(game, amount) {
  if (!(amount > 0)) return;
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

// Buying several at once: the total of a growing series, and how many you can afford.
function bulkCost(game, generator, count) {
  const first = generator.base * COST_GROWTH ** game.owned[generator.id] * costMultiplier(game);
  return Math.ceil(first * (COST_GROWTH ** count - 1) / (COST_GROWTH - 1));
}

function maxAffordable(game, generator) {
  const first = generator.base * COST_GROWTH ** game.owned[generator.id] * costMultiplier(game);
  if (game.coins < first) return 0;
  return Math.max(1, Math.floor(Math.log(game.coins * (COST_GROWTH - 1) / first + 1) / Math.log(COST_GROWTH)));
}

function buyGenerators(game, id, count) {
  const generator = GENERATORS.find((g) => g.id === id);
  if (!generatorOpen(game, generator)) return 0;
  let wanted = count === "max" ? maxAffordable(game, generator) : count;
  while (wanted > 0 && bulkCost(game, generator, wanted) > game.coins) wanted--;
  if (wanted < 1) return 0;
  game.coins -= bulkCost(game, generator, wanted);
  game.owned[id] += wanted;
  return wanted;
}

// The assistant buys whichever building pays itself back fastest.
function autoBuy(game) {
  let best = null;
  let score = Infinity;
  for (const generator of GENERATORS) {
    if (!generatorOpen(game, generator)) continue;
    const cost = costOf(game, generator);
    const payback = cost / (rateOf(game, generator) || generator.rate);
    if (game.coins >= cost && payback < score) { score = payback; best = generator; }
  }
  return best && buyGenerator(game, best.id) ? best : null;
}

function buyUpgrade(game, id) {
  const upgrade = UPGRADES.find((u) => u.id === id);
  const cost = upgradeCost(game, upgrade);
  if (!upgradeVisible(game, upgrade) || game.coins < cost || activeChallenge(game)?.noUpgrades) return false;
  game.coins -= cost;
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
  return Math.floor(Math.cbrt(game.run / PRESTIGE_STEP) * (hasRelic(game, "r5") ? 1.5 : 1));
}

// What survives a restart: everything except the run itself. Pain starts again from zero too.
function restart(game) {
  const keep = { ...game };
  for (const key of ["coins", "run", "owned", "upgrades", "hunger", "challenge", "bread"]) delete keep[key];
  return clean({ ...keep, version: SAVE_VERSION });
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
  // Without clicks there'd be no way to earn the first Coins, so some challenges come with a starter kit.
  for (const [building, count] of Object.entries(CHALLENGES.find((c) => c.id === id)?.starter ?? {})) next.owned[building] += count;
  return next;
}

function abandonChallenge(game) {
  return game.challenge ? restart(game) : game;
}

const seeded = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

// Rare market events, also worked out from the clock.
function marketEvent(now) {
  const roll = seeded(Math.floor(now / MARKET_SLOT_MS) * 7 + 3);
  if (roll < 0.03) return { name: "Pénurie de Pain !", factor: 3 };
  if (roll > 0.97) return { name: "Récolte géante !", factor: 1 / 3 };
  return null;
}

// Worked out from the clock, so every player sees the same prices, even after being offline.
function marketIndex(now) {
  const slot = Math.floor(now / MARKET_SLOT_MS);
  const wave = 1 + 0.45 * Math.sin(slot / 7.3) + 0.25 * Math.sin(slot / 2.1 + 1) + 0.4 * (seeded(slot) - 0.5);
  return Math.max(0.3, Math.min(2.2, wave)) * (marketEvent(now)?.factor ?? 1);
}

const breadBase = (game) => Math.max(1, perSecond(game) * BREAD_TAX);
const breadPrice = (game, now) => breadBase(game) * marketIndex(now);
const breadCapacity = (game) => BREAD_CAPACITY * (hasNode(game, "g1") ? 3 : 1);
const marketFee = (game) => (hasNode(game, "g2") ? 0 : BREAD_FEE);

// Bonus Pain fills up to the stock limit but never takes away what you already have.
function addBread(game, amount) {
  game.bread = Math.max(game.bread, Math.min(breadCapacity(game), game.bread + amount));
}

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
// boosts: { voice, frenzy, clover }
function advance(game, seconds, boosts) {
  const multiplier = (boosts.voice ? VOICE_BONUS : 1) * (boosts.frenzy ? FRENZY_BONUS : 1) * (boosts.clover ? CLOVER_BONUS : 1);
  const rate = perSecond(game);
  earn(game, rate * multiplier * seconds);
  game.stats.bestPerSecond = Math.max(game.stats.bestPerSecond, rate * multiplier);
  if (boosts.voice) game.stats.voiceSeconds += seconds;
  if (activeChallenge(game)?.noMarket) {
    game.hunger = 1;
  } else if (unlocked.market(game)) {
    const eaten = BREAD_PER_SECOND * (hasNode(game, "g3") ? 0.5 : 1) * (has(game, "boulanger") ? 0.75 : 1) * seconds;
    if (game.bread >= eaten) {
      game.bread -= eaten;
      game.hunger = Math.max(0, game.hunger - seconds / 60);
    } else {
      game.bread = 0;
      game.hunger = Math.min(1, game.hunger + seconds / HUNGER_FILL_S);
    }
  }
  return checkGoals(game);
}

function checkGoals(game) {
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
  for (const hat of HATS) {
    if (!game.hats.includes(hat.id) && hat.needs(game)) {
      game.hats.push(hat.id);
      finished.push({ type: "hat", name: hat.name });
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

const findBonus = (game) => (hasRelic(game, "r6") ? 2 : 1);

// Gives a catalogue duck from a source, if one is still missing there.
function findCatalogue(game, source, rng) {
  const missing = CATALOGUE.filter((d) => d.source === source && !game.catalogue.includes(d.id));
  if (missing.length === 0) return null;
  const duck = missing[Math.floor(rng() * missing.length)];
  game.catalogue.push(duck.id);
  return duck;
}

function findTrophy(game, rng) {
  const missing = TROPHIES.filter((t) => !game.trophies.includes(t.id));
  if (missing.length === 0) return null;
  const trophy = missing[Math.floor(rng() * missing.length)];
  game.trophies.push(trophy.id);
  return trophy;
}

const expeditionSlots = (game) => EXPEDITION_SLOTS + (hasNode(game, "e1") ? 1 : 0) + (hasNode(game, "e5") ? 1 : 0);
const zoneDuration = (game, zone) => zone.hours * 3600000 * (hasNode(game, "e4") ? 0.75 : 1);

function zoneRisk(game, zone) {
  const reduced = (hasNode(game, "e2") ? 0.7 : 1) * (hasRelic(game, "r2") ? 0.8 : 1) * (1 - Math.min(0.6, duckBonus(game, "risk")));
  return zone.risk * reduced;
}

const lootBonus = (game) => (hasNode(game, "e3") ? 2 : 1) * (hasRelic(game, "r4") ? 1.5 : 1) * (has(game, "panier") ? 1.5 : 1) * (1 + duckBonus(game, "loot"));

// What a trip should bring back on average, shown before you send it. Voice time adds up to +50 %.
function estimateExpedition(game, zone, ducklings) {
  const size = ducklings / (ducklings + 20);
  const loot = lootBonus(game);
  const risk = zoneRisk(game, zone);
  return {
    coins: perSecond(game) * (zoneDuration(game, zone) / 1000) * 0.3 * size * loot,
    eggs: zone.egg * size * 2 * loot,
    gems: zone.gem * size * 2 * loot,
    fragments: zone.fragment * size * 2 * loot,
    lostAverage: Math.round(ducklings * risk),
    lostMost: Math.min(ducklings, Math.round(ducklings * risk * 2)),
    find: Math.min(1, zone.find * findBonus(game))
  };
}

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
  const story = STORIES[zone.id][Math.floor(rng() * STORIES[zone.id].length)];
  const reward = { coins, lost, voice, story, zone: zone.name, eggs: whole(zone.egg * size * 2 * loot), gems: whole(zone.gem * size * 2 * loot), fragments: whole(zone.fragment * size * 2 * loot) };
  if (rng() < zone.find * findBonus(game)) reward.duck = findCatalogue(game, "expedition", rng);
  if (rng() < zone.find * 0.6 * findBonus(game)) reward.trophy = findTrophy(game, rng);
  game.owned.caneton += trip.ducklings - lost;
  game.stats.lostDucks += lost;
  game.expeditions = game.expeditions.filter((e) => e !== trip);
  earn(game, coins);
  game.eggs += reward.eggs;
  game.gems += reward.gems;
  addFragments(game, reward.fragments);
  game.stats.expeditions++;
  game.stories = [`${zone.name} : ${story}`, ...game.stories].slice(0, 20);
  return reward;
}

function addFragments(game, amount) {
  game.fragments += amount;
  while (game.fragments >= FRAGMENTS_PER_FEATHER) {
    game.fragments -= FRAGMENTS_PER_FEATHER;
    game.feathers++;
    game.feathersTotal++;
  }
}

const nestTime = (game, base) => base * (hasNode(game, "g4") ? 0.5 : 1);

function makeDuck(game, rarity, traits, rng) {
  return { id: game.nextId++, name: DUCK_NAMES[Math.floor(rng() * DUCK_NAMES.length)], rarity, traits, shiny: rng() < SHINY_CHANCE };
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
  game.stats.hatched++;
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
  game.gems += 1 + duck.rarity;
  return 1 + duck.rarity;
}

// Minigames share one recharge each. "Joueur né" halves it.
const gameCooldown = (game) => GAME_COOLDOWN_MS * (hasNode(game, "f4") ? 0.5 : 1);
const gameReady = (game, key, now) => now >= game.cooldowns[key];
const gameBonus = (game) => (hasNode(game, "f5") ? 2 : 1);

function useGame(game, key, now) {
  if (!gameReady(game, key, now)) return false;
  game.cooldowns[key] = now + gameCooldown(game);
  game.stats.gamesPlayed++;
  return true;
}

function eggHuntBoard(rng) {
  const cells = Array.from({ length: EGG_HUNT_CELLS }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return new Set(cells.slice(0, EGG_HUNT_EGGS));
}

function eggHuntReward(game, found, rng) {
  game.stats.eggsFound += found;
  const coins = perSecond(game) * 60 * found * gameBonus(game);
  earn(game, coins);
  let duck = null;
  if (found === EGG_HUNT_EGGS) {
    game.eggs++;
    duck = rng() < 0.25 * findBonus(game) ? findCatalogue(game, "eggs", rng) : null;
  }
  return { coins, egg: found === EGG_HUNT_EGGS, duck };
}

// Four ducks with fixed odds. Paying 3,6× on 25 % keeps a small house edge.
function runRace(game, pick, rng) {
  const bet = Math.floor(game.coins * RACE_BET_SHARE);
  const winner = Math.floor(rng() * 4);
  const won = winner === pick;
  game.coins -= bet;
  let duck = null;
  if (won) {
    earn(game, bet * RACE_PAYOUT * gameBonus(game));
    game.stats.racesWon++;
    if (rng() < 0.15 * findBonus(game)) duck = findCatalogue(game, "race", rng);
  } else {
    game.stats.racesLost++;
  }
  return { bet, winner, won, duck };
}

function catchFish(game, rng) {
  const rare = has(game, "filet") ? 2 : 1;
  let roll = rng();
  let fish = FISH[0];
  for (const kind of [...FISH].reverse()) {
    const chance = kind.id === "sardine" ? 1 : kind.chance * rare;
    if (roll < chance) { fish = kind; break; }
    roll -= chance;
  }
  game.fishStock += fish.value;
  game.stats.fish++;
  if (fish.id === "dore") game.stats.goldfish = (game.stats.goldfish ?? 0) + 1;
  const duck = fish.id !== "sardine" && rng() < 0.05 * findBonus(game) ? findCatalogue(game, "fish", rng) : null;
  return { fish, duck };
}

function tradeFish(game) {
  const gems = Math.floor(game.fishStock / FISH_PER_GEM);
  if (gems < 1) return 0;
  game.fishStock -= gems * FISH_PER_GEM;
  game.gems += gems;
  return gems;
}

// Three reels. Three of a kind pays big, two of a kind pays a little.
function spinSlots(game, rng) {
  if (game.bread < SLOT_COST) return null;
  game.bread -= SLOT_COST;
  game.stats.slotsPlayed++;
  const luck = hasRelic(game, "r7") ? 0.15 : 0;
  const first = SLOT_SYMBOLS[Math.floor(rng() * SLOT_SYMBOLS.length)];
  const reels = [first, rng() < 0.3 + luck ? first : SLOT_SYMBOLS[Math.floor(rng() * SLOT_SYMBOLS.length)], rng() < 0.2 + luck ? first : SLOT_SYMBOLS[Math.floor(rng() * SLOT_SYMBOLS.length)]];
  const counts = {};
  for (const symbol of reels) counts[symbol] = (counts[symbol] ?? 0) + 1;
  const [symbol, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const prize = { reels, text: "Perdu !" };
  const bonus = gameBonus(game);
  if (count === 3) {
    game.stats.jackpots++;
    if (symbol === "💎") { game.gems += 5 * bonus; prize.text = `JACKPOT ! +${5 * bonus} gemmes`; }
    else if (symbol === "🥚") { game.eggs += 2 * bonus; prize.text = `JACKPOT ! +${2 * bonus} œufs`; }
    else if (symbol === "🦆") { prize.duck = findCatalogue(game, "slots", rng); prize.text = prize.duck ? `JACKPOT ! ${prize.duck.name} rejoint ta collection` : "JACKPOT ! (collection complète)"; if (!prize.duck) earn(game, perSecond(game) * 3600); }
    else if (symbol === "🍀") { addFragments(game, 20 * bonus); prize.text = `JACKPOT ! +${20 * bonus} éclats de plume`; }
    else { const coins = perSecond(game) * 1800 * bonus; earn(game, coins); prize.text = `JACKPOT ! +${format(coins)} Coins`; }
  } else if (count === 2) {
    const coins = perSecond(game) * 120 * bonus;
    earn(game, coins);
    addBread(game, SLOT_COST * 0.5);
    prize.text = `Paire ! +${format(coins)} Coins`;
  }
  return prize;
}

const dayNumber = (now) => Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / 86400000);
const statValue = (game, stat) => (stat === "clicks" ? game.clicks : game.stats[stat]);

// Three quests a day, the same for everyone. Each counts from what you'd done at the first check.
function refreshDaily(game, now) {
  const day = dayNumber(now);
  if (game.daily?.day === day) return null;
  const streak = game.daily?.day === day - 1 ? game.daily.streak + 1 : 1;
  const start = Math.floor(seeded(day) * QUESTS.length);
  const quests = [0, 1, 2].map((offset) => {
    const quest = QUESTS[(start + offset * 3) % QUESTS.length];
    return { id: quest.id, from: statValue(game, quest.stat), done: false };
  });
  game.daily = { day, streak, quests };
  const reward = perSecond(game) * 600 * Math.min(streak, 7);
  earn(game, reward);
  return { streak, reward };
}

function questProgress(game, quest) {
  const about = QUESTS.find((q) => q.id === quest.id);
  return { about, value: Math.min(about.goal, statValue(game, about.stat) - quest.from) };
}

function claimQuest(game, index) {
  const quest = game.daily?.quests[index];
  if (!quest || quest.done) return false;
  const { about, value } = questProgress(game, quest);
  if (value < about.goal) return false;
  quest.done = true;
  game.gems += 1;
  addBread(game, 600);
  addFragments(game, 3);
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
    if (field === "bread") addBread(game, gift.n); else game[field] += gift.n;
    return { kind: gift.k, amount: gift.n };
  } catch {
    return { error: "Code invalide" };
  }
}

const HEADLINES = [
  [0, "Un canard aperçu en train de marcher. Les experts sont perplexes."],
  [0, "« Coin », déclare le canard. Personne ne sait ce que ça veut dire."],
  [1e3, "Une Mare a été vue en train de produire des Coins. Enquête en cours."],
  [1e4, "Les Canetons demandent des pauses goûter plus longues."],
  [1e5, "Le prix du pain s'envole. Les canards restent calmes."],
  [1e6, "Un Éleveur affirme avoir parlé à un canard. Le canard dément."],
  [1e7, "Les Fermes à canards dépassent les fermes à vaches. Les vaches protestent."],
  [1e8, "Une Usine à coins accusée de faire trop de coin-coin la nuit."],
  [1e9, "L'Empire canard annonce un nouveau drapeau : un canard."],
  [1e10, "Des fidèles se rassemblent au Temple du Coin pour la prière du matin : « coin »."],
  [1e11, "La Cité-Canard élit son premier maire. C'est un canard."],
  [1e12, "La Station orbitale capte un signal venu de l'espace : « coin coin »."],
  [1e13, "La Banque du Pain refuse un prêt à un pigeon. Scandale."],
  [1e14, "Le Volcan à coins entre en éruption. Il pleut de la monnaie."],
  [1e15, "Le Laboratoire invente un canard qui ne dit pas coin. Il est détruit par sécurité."],
  [1e16, "Un Portail des mares s'ouvre. Il mène à une autre mare."],
  [1e17, "La Lune est désormais à 40 % composée de canards."],
  [1e18, "Une galaxie entière se met à cancaner."],
  [1e19, "L'Horloge du temps sonne : il est l'heure du pain."],
  [1e20, "Le Multivers confirme : il y a des canards dans tous les univers."],
  [1e21, "Le Canard Divin a parlé. Il a dit « coin »."],
  [1e25, "Les économistes abandonnent : il y a plus de Coins que d'atomes."],
  [1e30, "Le mot « coin » entre dans toutes les langues de l'univers."]
];

function headlines(game) {
  const open = HEADLINES.filter(([goal]) => game.lifetime >= goal).map(([, text]) => text);
  if (game.hunger > 0.3) open.push("Les canards ont faim. Ils regardent ton pain avec insistance.");
  if (game.owned.caneton === 0) open.push("On recherche des Canetons. Ils sont tous partis en expédition ?");
  if (game.stats.foxes > 0) open.push(`Les renards ont peur : ${game.stats.foxes} déjà chassés.`);
  if (game.catalogue.length > 0) open.push(`La collection compte ${game.catalogue.length} canards célèbres.`);
  return open;
}

function format(value) {
  if (!Number.isFinite(value)) return "∞";
  if (value < 10) return String(Math.floor(value * 10) / 10).replace(".", ",");
  if (value < 1000) return String(Math.floor(value));
  const units = ["k", "M", "Md", "Bn", "Bd", "Tn", "Td", "Qn", "Qd", "Sx", "Sp", "Oc", "No", "Dc"];
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
const GULL_ID = "le-canard-mouette";
const CLOVER_ID = "le-canard-trefle";
const RAIN_CLASS = "le-canard-pluie";
const PANEL_ID = "le-canard-boutique";
const WORLD_ID = "le-canard-domaine";
const STRIP = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPIAAAAWCAYAAAD6vcEwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGCSURBVHhe7dkxTgJBGEfxbYwlpacwsfEixEMYz2HhFWz1GFaew9pwA9s13zyHHSbgwsLXvZf8A4Tht1RLwTCYmZmZmVl2Lw/D2K5/f2m6pEu6lOIGNG5W4/jzxjari+C6pEu6lOLuoPHY7OluOa5LuqRLWe4E/20YhrF0JqxLuqRLvdtukfv5OIx1z7cTHl+4fOmFsC7pki4dcsOKLXIL9Dot8PX1hMe+P672wnFHade+p0u6pEtZbimgdj369c6dop6v0NyFdUmXdCnL3dYfbtF2cxfu0yVd0qUsdwfuV+8K++4Oc7Au6ZIuZbn/wu0Ci7MVnYN1SZd0KcudhQOq2PrmeFiXdEmXstxSHOjBilakwu3z3unTJV3SpSz3IBwfbtdfpHf6dEmXdCnLLQVef9bbn/d9u+fP8aPSJV3SpSy31N8F+gV4Mqq7TZd0KcstxZ/VFejXnz0lXdIlXcpyS4G3ry+C6m7TJV3KctNgXdIlXUpxK1ofK3ourku6pEtL3F9Nh0t/+trLfwAAAABJRU5ErkJggg==";
const FRAMES = 11;
const CELL = 22;
const SIZE = CELL * 2;
const FRAME_MS = 110;
const SPEED = { walk: 0.8, stand: 0, sleep: 0, sprint: 5, panic: 7 };
const SPRINT_MS = 3000;
const PANIC_MS = 6000;
const STAND_MS = 1500;
const SLEEP_AFTER_MS = 5 * 60000;
const PANIC_PINGS = 3;
const PANIC_WINDOW_MS = 30000;
const WATCH_MS = 1000;
const TICK_MS = 250;
const SAVE_MS = 15000;
const MAX_TICK_S = 60;
const FRENZY_MS = 30000;
const GOLD_SPEED = 3;
const MINUTE = 60000;
const TIMERS = { gold: [4, 9], fox: [4, 8], rain: [15, 30], gull: [10, 20], clover: [12, 25] };
const FOX_SPEED = 1.1;
const FOX_HITS = 3;
const RAIN_DUCKS = 25;
const RAIN_MS = 10000;
const GULL_SPEED = 2.4;
const GULL_SHARE = 0.1;
const CLOVER_SHOW_MS = 10000;
const CLOVER_MS = 5 * MINUTE;
const EGG_HUNT_MS = 30000;
const RACE_MS = 5000;
const FISH_CASTS = 5;
const NEWS_MS = 8000;
const GOLD_SHOW_MS = 3000;
const QUACK_SOUND = "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";
const QUACK_START = 0;
const QUACK_LENGTH = 2.6;
const QUACK_GAIN = 1.6;
const COMBO_GAP_MS = 1200;
const COMBO_STEP = 25;
const COMBO_MAX = 5;
const AUTO_BUY_MS = 5000;
const AWAY_REPORT_S = 300;
const BULK = [1, 10, 100, "max"];
const COIN_BURST = 30;
const FISH_PERIOD_MS = 2400;
const FISH_ZONE = 0.24;
const HEAD_X = 18;
const HEAD_Y = 9;
const TRIP_SHARES = [0.25, 0.5, 1];
const GIFT_NAMES = { pain: "Pain", gemme: "gemmes", oeuf: "œufs" };
const SHOWABLE = [["caneton", "Canetons (la file derrière le canard)"], ...GENERATORS.filter((g) => g.id !== "caneton").map((g) => [g.id, g.name]), ["chien", "Chiens de garde"], ["counter", "Compteur de Coins au-dessus du canard"], ["hat", "Chapeau"], ["badge", "Badge du skin"]];
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
const MILESTONE = 50;
const GOLDEN_RATIO = 0.618034;
const BREAD_STEPS = [100, 1000, 10000];
const RACERS = ["Éclair", "Plume", "Tonnerre", "Nuage"];
const CHEERS = ["Youpi !", "Coin !", "Merci !", "Trop bien !", "Encore !"];
const COLORS = { g: "#3fa34d", G: "#2a6e34", b: "#2f7fd1", l: "#8fd0ff", r: "#c8383e", R: "#8e2428", w: "#f2efe6", s: "#9aa3ad", S: "#5c636c", d: "#8a5a2b", D: "#4f3219", p: "#f0c29a", y: "#f2c230", Y: "#b98a12", o: "#ef8a2c", k: "#22242a", v: "#7b5fd1", V: "#4d3a99", m: "#e85dbd", c: "#3fd7d0", n: "#1b2a5c" };
const ART = {
  mare: ["........gg......gg........", "....bbbbbbbbbbbbbbbbbb....", "..bbbbllbbbbbbbbbbbbbbbb..", ".bbbbbbbbbbbbllbbbbbbbbbb.", "bbbbbbbbbbbbbbbbbbbbllbbbb", ".bbbllbbbbbbbbbbbbbbbbbbb.", "..bbbbbbbbbbbbbllbbbbbbb..", "....bbbbbbbbbbbbbbbbbb...."],
  eleveur: ["...yyyy...", "..yyyyyy..", ".yyyyyyyy.", "...pppp...", "...pppp...", "..bbbbbb..", ".pbbbbbbp.", ".pbbbbbbp.", "..bbbbbb..", "..bb..bb..", "..bb..bb..", "..DD..DD.."],
  ferme: [".........rr.........", ".......rrrrrr.......", ".....rrrrrrrrrr.....", "...rrrrrwwwwrrrrr...", ".rrrrrrrwwwwrrrrrrr.", "rrrrrrrrrrrrrrrrrrrr", "DDDDDDDDDDDDDDDDDDDD", ".RRRRRRRRRRRRRRRRRR.", ".RRwwRRRRRRRRRRwwRR.", ".RRwwRRRRRRRRRRwwRR.", ".RRRRRRwwwwwwRRRRRR.", ".RRRRRRwRRRRwRRRRRR.", ".RRRRRRwRRRRwRRRRRR.", ".RRRRRRwRRRRwRRRRRR."],
  usine: ["..SS.....SS...........", "..SS.....SS...........", "..SS.....SS...........", "..SS.....SS...........", "..SS.....SS.......s...", "ssSSsssssSSssss..sss..", "sssssssssssssss.sssss.", "ssssssssssssssssssssss", "ssyysssyysssyysssyysss", "ssyysssyysssyysssyysss", "ssssssssssssssssssssss", "ssyysssyysssyysssyysss", "ssyysssyysssyysssyysss", "ssssssssssssssssssssss", "SSSSSSSSSSSSSSSSSSSSSS"],
  empire: ["............rr............", "............rrr...........", "............Y.............", "..y..y.....yyy.....y..y...", "..yyyy.....yyy.....yyyy...", "..yyyy....yyyyy....yyyy...", "..yyyy....yYyYy....yyyy...", "..yyyy.y.yyyyyyy.y.yyyy...", "..yyyyyyyyyyyyyyyyyyyyy...", "..yYyyyyyyyyyyyyyyyyyYy...", "..yyyyyyYyyyyyyyYyyyyyy...", "..yyyyyyyyyyyyyyyyyyyyy...", "..yyyyyyyyyDDDyyyyyyyyy...", "..yyyyyyyyDDDDDyyyyyyyy...", "..yyyyyyyyDDDDDyyyyyyyy...", "..yyyyyyyyDDDDDyyyyyyyy..."],
  temple: ["..........ww..........", ".......wwwwwwww.......", "....wwwwwwwwwwwwww....", ".wwwwwwwwwwwwwwwwwwww.", "ssssssssssssssssssssss", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", ".ww..ww..ww..ww..ww...", "ssssssssssssssssssssss", "SSSSSSSSSSSSSSSSSSSSSS"],
  cite: ["......ss..............", "......ss......ss......", "..ss..ss......ss......", "..ss..ssss....ssss....", "..ss..syys....syys....", "ssss..ssss.ss.ssss..ss", "syys..syys.ss.syys..ss", "ssss..ssss.ssssssssss.", "syys..syys.syysyysyys.", "ssss..ssss.ssssssssss.", "syys..syys.syysyysyys.", "ssssssssssssssssssssss"],
  station: ["...........v...........", "..........vvv..........", ".........vvlvv.........", "........vvvvvvv........", "...vvvvvvvvvvvvvvvvv...", ".vvvlvvlvvlvvlvvlvvlvv.", "vvvvvvvvvvvvvvvvvvvvvvv", ".VVVVVVVVVVVVVVVVVVVVV.", "...VVVV..VVVVV..VVVV...", "....oo....ooo....oo....", ".....o.....o......o...."],
  banque: ["..........yy..........", ".......yyyyyyyy.......", "....yyyyyyyyyyyyyy....", "yyyyyyyyyyyyyyyyyyyyyy", "wwwwwwwwwwwwwwwwwwwwww", ".ww.ww.ww.ww.ww.ww.ww.", ".ww.ww.ww.ww.ww.ww.ww.", ".ww.ww.ww.ww.ww.ww.ww.", ".ww.ww.ww.dd.ww.ww.ww.", ".ww.ww.ww.dd.ww.ww.ww.", "wwwwwwwwwwwwwwwwwwwwww", "ssssssssssssssssssssss"],
  volcan: ["..........oo..........", ".........roor.........", "........rr..rr........", ".......DDDooDDD.......", "......DDDDooDDDD......", ".....DDDDDDoDDDDD.....", "....DDDDDDDoDDDDDD....", "...DDDDDDDDDoDDDDDD...", "..DDDDDDDDDDoDDDDDDD..", ".DDDDDDDDDDDDoDDDDDDD.", "DDDDDDDDDDDDDDDDDDDDDD"],
  labo: ["......ll..............", "......ll......ss......", ".....llll....ssss.....", "....lgggll..ssccss....", "....lgggll..sccccs....", "sssssssssssssssssssss.", "swwwwwwwwwwwwwwwwwwws.", "swwcwwwmwwwwgwwwcwwws.", "swwwwwwwwwwwwwwwwwwws.", "sssssssssssssssssssss.", "SS.................SS."],
  portail: ["......vvvvvvvvvv......", "....vvmmmmmmmmmmvv....", "...vmmcccccccccmmv....", "..vmmcclllllllccmmv...", "..vmccllnnnnnllccmv...", "..vmccllnnnnnllccmv...", "..vmccllnnnnnllccmv...", "..vmmcclllllllccmmv...", "...vmmcccccccccmmv....", "....vvmmmmmmmmmmvv....", "..SSSSSSSSSSSSSSSSSS.."],
  lune: [".......wwwwwwww.......", ".....wwwwwswwwwww.....", "....wwswwwwwwwswww....", "...wwwwwwwwsswwwwww...", "...wwwssswwwwwwwwww...", "...wwwwwwwwwwwwsww....", "....wwwwwswwwwwww.....", ".....wwwwwwwwwww......", ".......wwwwwww........", "........S..S..........", "......SSSSSSSS........"],
  galaxie: ["....m.......c.........", "..vvvvvv......y.......", ".vvmmmmvvv..........m.", "vvmmyyyymmvvvv........", "vmmyywwyymmmvvvv......", ".vvmmyyyymmvvmmvvv....", "...vvvmmmmvvmmyymmv...", "c......vvvvvmmyymmv...", "..........vvvmmmmvv...", "...y.........vvvvv..m."],
  horloge: [".......yyyyyyyy.......", ".....yywwwwwwwwyy.....", "....ywwwwwwkwwwwwy....", "....ywwwwwwkwwwwwy....", "....ywwwwwwkwwwwwy....", "....ywwwwwwkkkkwwy....", "....ywwwwwwwwwwwwy....", ".....yywwwwwwwwyy.....", ".......yyyyyyyy.......", ".........dddd.........", ".......dddddddd......."],
  multivers: ["..c.......m.......y...", ".ccc.....mmm.....yyy..", "ccccc...mmmmm...yyyyy.", ".ccc.....mmm.....yyy..", "..c...v...m...v...y...", ".....vvv.....vvv......", "....vvvvv...vvvvv.....", ".....vvv.....vvv......", "......v.......v.......", "...nnnnnnnnnnnnnnnn..."],
  divin: ["........yyyyyy........", ".......y......y.......", "........yyyyyy........", "..........yy..........", ".........yyyyo........", "........yyykyy........", "..yy....yyyyyy....yy..", "...yyyyyyyyyyyyyyyy...", "....yyyyyyyyyyyyyy....", ".....yyyyyyyyyyyy.....", "......wwwwwwwwww......"],
  chien: ["......DD....", ".....dddDD..", ".....ddkdd..", "dd...ddddk..", ".ddddddddd..", ".ddddddddd..", ".dd.dd.dd...", ".dd.dd.dd..."],
  renard: [".o..o.......", ".oooo.......", ".okook...oo.", ".ooooo..ooo.", "..oooooooow.", "..oooooooow.", "..o.oo.o....", "..k.kk.k...."],
  mouette: ["ww........ww", ".www....www.", "..wwwwwwww..", "....wwkwo...", ".....wwww...", "......ss...."],
  trefle: ["..gg..gg..", ".gggggggg.", ".gggggggg.", "..gggggg..", ".gggggggg.", ".gggggggg.", "..gg..gg..", "....GG....", "....G.....", "...G......"]
};
const HAT_ART = {
  casquette: ["..rrrrrr..", ".rrrrrrrr.", "rrrrrrrrrrrr"],
  couronne: ["y..y..y..y", "yyyyyyyyyy", "yryyyyyyry"],
  sorcier: ["....vv....", "...vvvv...", "..vvyvvv..", ".vvvvvvvv.", "vvvvvvvvvvvv"],
  haut: [".kkkkkkk..", ".kkkkkkk..", ".kkkkkkk..", ".rrrrrrr..", "kkkkkkkkkk"],
  pirate: ["..kkkkkk..", ".kkkwwkkk.", "kkkkkkkkkkkk"],
  fete: ["....m.....", "...mym....", "..mmmmm...", ".myymmym..", "mmmmmmmmm."],
  cowboy: ["...dddd...", "..dddddd..", "dddddddddddd"],
  chef: [".wwwwwww..", "wwwwwwwww.", ".wwwwwww..", ".wwwwwww.."],
  aureole: [".yyyyyyy..", "y.......y.", ".yyyyyyy.."],
  antennes: [".c.....c..", "..s...s...", "...s.s...."],
  bonnet: ["....w.....", "..bbbbb...", ".bbbbbbb..", "wwwwwwwww."],
  viking: ["w..ssss..w", "ww.ssss.ww", ".ssssssss."]
};
const WORLD_ORDER = ["mare", "eleveur", "ferme", "usine", "empire", "temple", "cite", "station", "banque", "volcan", "labo", "portail", "lune", "galaxie", "horloge", "multivers", "divin", "chien"];
const WALKERS = ["eleveur", "chien"];
const TABS = [
  { id: "shop", name: "Boutique", open: () => true },
  { id: "market", name: "Marché", open: unlocked.market, hint: "Gagne 50 k Coins" },
  { id: "trips", name: "Expéditions", open: unlocked.expeditions, hint: "Possède 10 Canetons" },
  { id: "ducks", name: "Élevage", open: unlocked.ducks, hint: "Trouve un œuf" },
  { id: "games", name: "Jeux", open: unlocked.games, hint: "Gagne 10 k Coins" },
  { id: "collection", name: "Collection", open: () => true },
  { id: "tree", name: "Plumes", open: unlocked.tree, hint: "Fais un Grand Envol" },
  { id: "challenges", name: "Défis", open: unlocked.challenges, hint: "Fais un Grand Envol" },
  { id: "relics", name: "Reliques", open: (g) => g.gems > 0 || g.relics.length > 0, hint: "Trouve une gemme" },
  { id: "quests", name: "Quêtes", open: () => true },
  { id: "trophies", name: "Succès", open: () => true },
  { id: "stats", name: "Stats", open: () => true },
  { id: "display", name: "Affichage", open: () => true },
  { id: "gifts", name: "Cadeaux", open: () => true }
];

class LeCanard {
  constructor(meta) {
    this.meta = meta;
  }

  store(name) {
    return BdApi.Webpack.Stores?.[name] ?? BdApi.Webpack.getStore?.(name);
  }

  setting(id) {
    return BdApi.Data.load(PLUGIN, id) !== false;
  }

  start() {
    this.voice = this.store("VoiceStateStore");
    this.selected = this.store("SelectedChannelStore");
    this.users = this.store("UserStore");
    this.dispatcher = this.voice?._dispatcher ?? this.users?._dispatcher;
    this.game = clean(BdApi.Data.load(PLUGIN, "game"));
    Object.assign(this, { x: 80, direction: 1, mode: "walk", modeUntil: 0, pings: [], frame: 0, frameAt: 0, seen: null, channel: null, rows: null, soundAt: 0, tab: "shop", armed: null, parents: [], clickTimes: [], newsIndex: 0, newsAt: 0 });
    Object.assign(this, { frenzyUntil: 0, clickFrenzyUntil: 0, cloverUntil: 0, hunt: null, race: null, fishing: null, slotsShown: null, tripShare: 0.5, giftKind: "pain", giftAmount: 1000, combo: 0, comboAt: 0, bulk: 1, autoAt: 0 });
    this.lastActive = Date.now();
    this.lastTick = Date.now();
    this.next = {};
    for (const key of Object.keys(TIMERS)) this.schedule(key);
    this.build();
    const awaySeconds = (Date.now() - this.game.savedAt) / 1000;
    const away = offlineGain(this.game, Date.now());
    if (away > 0) earn(this.game, away);
    const daily = refreshDaily(this.game, Date.now());
    if (awaySeconds >= AWAY_REPORT_S) this.awayReport(awaySeconds, away, daily);
    else if (daily && daily.reward > 0) this.say(`Jour ${daily.streak} : +${format(daily.reward)}`, 6000);
    this.loadQuack();
    this.running = true;
    this.onFrame = (now) => this.step(now);
    requestAnimationFrame(this.onFrame);
    this.ticker = setInterval(() => this.tick(), TICK_MS);
    this.watcher = setInterval(() => this.watch(), WATCH_MS);
    this.saver = setInterval(() => this.save(), SAVE_MS);
    this.onMessage = (event) => this.message(event);
    this.dispatcher?.subscribe?.("MESSAGE_CREATE", this.onMessage);
    this.onActive = () => this.wake();
    document.addEventListener("mousemove", this.onActive, { passive: true });
    document.addEventListener("keydown", this.onActive, { passive: true });
  }

  stop() {
    this.running = false;
    for (const timer of [this.ticker, this.watcher, this.saver]) clearInterval(timer);
    clearTimeout(this.bubbleTimer);
    this.dispatcher?.unsubscribe?.("MESSAGE_CREATE", this.onMessage);
    document.removeEventListener("mousemove", this.onActive);
    document.removeEventListener("keydown", this.onActive);
    this.save();
    for (const id of [DUCK_ID, GOLD_ID, FOX_ID, GULL_ID, CLOVER_ID, PANEL_ID, WORLD_ID, "le-canard-retour", "le-canard-flash"]) document.getElementById(id)?.remove();
    for (const node of document.querySelectorAll(".le-canard-piece")) node.remove();
    for (const node of document.querySelectorAll(`.${RAIN_CLASS}`)) node.remove();
    this.audio?.close?.();
    this.audio = null;
    this.quackAudio?.close?.();
    this.quackAudio = null;
  }

  // A short summary when you come back after being away.
  awayReport(seconds, coins, daily) {
    const game = this.game;
    const now = Date.now();
    const lines = [`Absent pendant ${duration(seconds * 1000)}`];
    if (coins > 0) lines.push(`Tes canards ont gagné ${format(coins)} Coins`);
    if (daily) lines.push(`Série de connexion : jour ${daily.streak} (+${format(daily.reward)} Coins)`);
    const back = game.expeditions.filter((e) => now >= e.end).length;
    if (back) lines.push(`${back} expédition(s) de retour : va les récupérer !`);
    if (game.nest && now >= game.nest.end) lines.push("Ton œuf est prêt à éclore !");
    const ready = ["eggs", "race", "fish"].filter((key) => gameReady(game, key, now)).length;
    if (unlocked.games(game) && ready) lines.push(`${ready} minijeu(x) disponible(s)`);
    if (unlocked.market(game) && game.bread < 600) lines.push("Ton stock de Pain est presque vide");
    const box = document.createElement("div");
    box.id = "le-canard-retour";
    box.style.cssText = "position:fixed;right:20px;bottom:90px;z-index:10004;width:320px;padding:14px;border-radius:10px;background:#111214;color:#fff;font:13px var(--font-primary,sans-serif);box-shadow:0 8px 24px rgba(0,0,0,.5)";
    const title = document.createElement("div");
    title.textContent = "Bon retour !";
    title.style.cssText = "font-weight:700;font-size:15px;margin-bottom:8px";
    const body = document.createElement("div");
    body.textContent = lines.join("\n");
    body.style.cssText = "white-space:pre-line;color:#dbdee1;margin-bottom:10px";
    const ok = document.createElement("button");
    ok.textContent = "Super !";
    ok.style.cssText = "padding:7px 16px;border:none;border-radius:4px;background:#5865f2;color:#fff;cursor:pointer";
    ok.onclick = () => box.remove();
    box.append(title, body, ok);
    document.body.append(box);
  }

  save() {
    if (!this.game) return;
    this.game.savedAt = Date.now();
    BdApi.Data.save(PLUGIN, "game", this.game);
  }

  // Event timers. Tree nodes and upgrades make some events come more often.
  schedule(key) {
    const [low, high] = TIMERS[key];
    let speed = 1;
    if (key === "gold") speed = (hasNode(this.game ?? fresh(), "g5") ? 2 : 1) * (has(this.game ?? fresh(), "flair") ? 1.3 : 1) * (1 + duckBonus(this.game ?? fresh(), "gold"));
    if (key === "rain" && this.game && hasNode(this.game, "f1")) speed = 2;
    if (key === "clover" && this.game && hasNode(this.game, "f3")) speed = 2;
    this.next[key] = Date.now() + ((low + Math.random() * (high - low)) * MINUTE) / speed;
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
    // The wrapper flips left and right; the skin inside carries the colour; the hat rides on top.
    const body = document.createElement("div");
    body.style.cssText = `position:relative;width:${SIZE}px;height:${SIZE}px`;
    const skin = this.sprite(SIZE, "position:absolute;left:0;top:0");
    const hat = document.createElement("canvas");
    hat.style.cssText = "position:absolute;image-rendering:pixelated;pointer-events:none";
    body.append(skin, hat);
    const badge = document.createElement("div");
    badge.style.cssText = "position:absolute;right:-6px;top:-4px;font-size:14px;pointer-events:none";
    const label = "position:absolute;left:50%;transform:translateX(-50%);padding:1px 6px;border-radius:7px;font:700 11px var(--font-primary,sans-serif);white-space:nowrap;pointer-events:none";
    const counter = document.createElement("div");
    counter.style.cssText = `${label};bottom:calc(100% + 6px);background:rgba(17,18,20,.85);color:#ffd84d`;
    const bubble = document.createElement("div");
    bubble.style.cssText = `${label};bottom:calc(100% + 26px);background:#fff;color:#111;display:none`;
    duck.append(body, badge, counter, bubble);
    duck.onclick = () => this.peck();
    duck.oncontextmenu = (e) => { e.preventDefault(); this.togglePanel(); };
    document.body.append(duck);
    Object.assign(this, { element: duck, body, skin, badge, hatCanvas: hat, counter, bubble });
    this.buildWorld();
    this.drawHat();
    this.applySkin();
    this.applyDisplay();
    this.showCount();
  }

  drawHat() {
    const rows = HAT_ART[this.game.hat];
    const canvas = this.hatCanvas;
    if (!rows) { canvas.style.display = "none"; return; }
    const art = this.paint(rows, 0);
    canvas.width = art.width;
    canvas.height = art.height;
    canvas.getContext("2d").drawImage(art, 0, 0);
    canvas.style.display = this.visible("hat") ? "block" : "none";
    canvas.style.left = `${HEAD_X - art.width / 2}px`;
    canvas.style.top = `${HEAD_Y - art.height}px`;
  }

  applySkin() {
    const entry = CATALOGUE.find((c) => c.id === this.game.skin);
    this.skin.style.filter = entry ? `hue-rotate(${entry.hue}deg) saturate(1.2)` : "";
    this.badge.textContent = entry ? entry.badge : "";
    this.badge.style.display = entry && this.visible("badge") ? "block" : "none";
  }

  hidden() {
    const saved = BdApi.Data.load(PLUGIN, "hidden");
    return Array.isArray(saved) ? saved : [];
  }

  visible(id) {
    return !this.hidden().includes(id);
  }

  applyDisplay() {
    this.counter.style.display = this.visible("counter") ? "block" : "none";
    this.drawHat();
    this.applySkin();
  }

  showCount() {
    this.counter.textContent = `${format(this.game.coins)} Coins`;
  }

  say(text, ms) {
    this.bubble.textContent = text;
    this.bubble.style.display = "block";
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => { this.bubble.style.display = this.mode === "sleep" ? "block" : "none"; if (this.mode === "sleep") this.bubble.textContent = "Zzz..."; }, ms);
  }

  setMode(mode, ms) {
    this.mode = mode;
    this.modeUntil = performance.now() + ms;
  }

  wake() {
    this.lastActive = Date.now();
    if (this.mode !== "sleep") return;
    this.mode = "walk";
    this.say("Bonjour !", 1500);
  }

  celebrate() {
    this.setMode("stand", 800);
    this.say(CHEERS[Math.floor(Math.random() * CHEERS.length)], 1200);
  }

  // One canvas draws everything you own, so hundreds of sprites stay cheap. It ignores the
  // mouse, so Discord underneath still works.
  buildWorld() {
    const canvas = document.createElement("canvas");
    canvas.id = WORLD_ID;
    canvas.height = WORLD_HEIGHT;
    canvas.style.cssText = `position:fixed;left:0;bottom:0;z-index:9998;pointer-events:none;image-rendering:pixelated;display:${this.setting("world") ? "block" : "none"}`;
    document.body.append(canvas);
    this.canvas = canvas;
    this.sprites = {};
    for (const [name, rows] of Object.entries(ART)) this.sprites[name] = [0, 1, 2, 3].map((level) => this.paint(rows, level));
    this.strip = new Image();
    this.strip.src = STRIP;
    this.path = [];
    this.pathX = this.x;
    this.seenOwned = {};
    this.popAt = {};
  }

  // Milestones dress a building up: a flag at 50, a gold outline at 100, sparkles at 150.
  paint(rows, level) {
    const width = Math.max(...rows.map((row) => row.length));
    const top = level >= 1 ? 4 : 0;
    const art = document.createElement("canvas");
    art.width = (width + 2) * PIXEL;
    art.height = (rows.length + top + 1) * PIXEL;
    const pen = art.getContext("2d");
    const dot = (x, y, color) => { pen.fillStyle = color; pen.fillRect((x + 1) * PIXEL, (y + top) * PIXEL, PIXEL, PIXEL); };
    if (level >= 2) {
      rows.forEach((row, y) => [...row].forEach((cell, x) => {
        if (!COLORS[cell]) return;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) dot(x + dx, y + dy, "#ffd84d");
      }));
    }
    rows.forEach((row, y) => [...row].forEach((cell, x) => { if (COLORS[cell]) dot(x, y, COLORS[cell]); }));
    if (level >= 1) {
      const pole = Math.floor(width / 2);
      for (let y = -4; y < 0; y++) dot(pole, y, "#5c636c");
      dot(pole + 1, -4, "#c8383e"); dot(pole + 2, -4, "#c8383e"); dot(pole + 1, -3, "#c8383e");
    }
    if (level >= 3) for (const [x, y] of [[0, 0], [width - 1, 1], [2, rows.length - 2], [width - 2, rows.length - 1]]) dot(x, y, "#ffffff");
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
    const seed = WORLD_ORDER.indexOf(name) * 0.137 + 0.05;
    const room = Math.max(1, this.canvas.width - width);
    const home = ((seed + (index + 1) * GOLDEN_RATIO) % 1) * room;
    if (!WALKERS.includes(name)) return { x: home, direction: 1 };
    const distance = (home + now * 0.03 * (1 + (index % 3) * 0.3)) % (room * 2);
    return distance < room ? { x: distance, direction: 1 } : { x: room * 2 - distance, direction: -1 };
  }

  // Drawn cheapest first, so pricier buildings stand in front. The ducks always come last, on top.
  drawWorld(now) {
    if (!this.setting("world")) return;
    const canvas = this.canvas;
    if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
    const pen = canvas.getContext("2d");
    pen.imageSmoothingEnabled = false;
    pen.clearRect(0, 0, canvas.width, WORLD_HEIGHT);
    for (const name of [...GENERATORS.map((g) => g.id), "chien"]) {
      const owned = this.worldCount(name);
      if (this.seenOwned[name] !== undefined && owned > this.seenOwned[name]) this.popAt[name] = now;
      this.seenOwned[name] = owned;
    }
    for (const name of WORLD_ORDER) this.drawGroup(pen, name, now);
    this.drawChain(pen, now);
  }

  hop(id, index, count, now) {
    const age = now - (this.popAt[id] ?? -Infinity);
    return index === count - 1 && age < POP_MS ? Math.sin((age / POP_MS) * Math.PI) * 14 : 0;
  }

  drawGroup(pen, name, now) {
    const owned = this.worldCount(name);
    if (!owned || !this.visible(name)) return;
    const count = Math.min(SHOW_MAX, owned);
    const art = this.sprites[name][Math.min(3, Math.floor(owned / MILESTONE))];
    let spot = null;
    for (let index = 0; index < count; index++) {
      spot = this.worldSpot(name, index, art.width, now);
      const bob = WALKERS.includes(name) ? Math.abs(Math.sin(now / 160 + index)) * 2 : 0;
      const y = WORLD_HEIGHT - art.height + PIXEL - bob - this.hop(name, index, count, now);
      this.drawFlipped(pen, art, Math.round(spot.x), Math.round(y), spot.direction);
      if (name === "usine") this.drawSmoke(pen, spot.x, y, now + index * 370);
    }
    if (owned > count) this.label(pen, `×${owned}`, spot.x + art.width / 2, WORLD_HEIGHT - art.height - 2);
  }

  drawFlipped(pen, art, x, y, direction) {
    pen.save();
    pen.translate(direction < 0 ? x + art.width : x, y);
    pen.scale(direction < 0 ? -1 : 1, 1);
    pen.drawImage(art, 0, 0);
    pen.restore();
  }

  drawSmoke(pen, x, y, now) {
    for (const chimney of [6, 20]) {
      const rise = (now / 40) % 16;
      pen.fillStyle = `rgba(200,205,212,${0.7 - rise / 24})`;
      pen.fillRect(Math.round(x + chimney + rise / 4), Math.round(y - rise), 4, 4);
    }
  }

  drawChain(pen, now) {
    if (!this.strip.complete || !this.strip.naturalWidth || !this.visible("caneton")) return;
    const owned = this.game.owned.caneton;
    const count = Math.min(CHAIN_MAX, owned);
    let spot = null;
    for (let index = 0; index < count; index++) {
      spot = this.chainSpot(index);
      const sheetX = ((this.frame + index) % FRAMES) * CELL;
      const y = WORLD_HEIGHT - CELL - this.hop("caneton", index, count, now);
      const left = Math.round(spot.x + (SIZE - CELL) / 2);
      pen.save();
      pen.translate(spot.direction > 0 ? left + CELL : left, y);
      pen.scale(spot.direction > 0 ? -1 : 1, 1);
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

  boosts() {
    const now = Date.now();
    return { voice: Boolean(this.channel), frenzy: now < this.frenzyUntil, clickFrenzy: now < this.clickFrenzyUntil, clover: now < this.cloverUntil };
  }

  announce(events) {
    for (const event of events) {
      if (event.type === "challenge") this.say(`Défi réussi : ${event.name} !`, 5000);
      else if (event.type === "hat") this.say(`Nouveau chapeau : ${event.name} !`, 4000);
      else this.say(`Succès : ${event.name}`, 3000);
      this.chime(880);
      this.dirty = true;
    }
  }

  tick() {
    try {
      const now = Date.now();
      const elapsed = Math.max(0, Math.min(MAX_TICK_S, (now - this.lastTick) / 1000));
      this.lastTick = now;
      this.announce(advance(this.game, elapsed, this.boosts()));
      if (refreshDaily(this.game, now)) this.dirty = true;
      if (this.game.stats.leaps > 0 && BdApi.Data.load(PLUGIN, "autoBuy") === true && now - this.autoAt >= AUTO_BUY_MS) {
        this.autoAt = now;
        if (autoBuy(this.game) && this.tab === "shop") this.dirty = true;
      }
      if (this.mode !== "sleep" && now - this.lastActive > SLEEP_AFTER_MS) { this.mode = "sleep"; this.say("Zzz...", 60000); }
      this.showCount();
      this.refresh();
      if (now >= this.next.gold && !document.getElementById(GOLD_ID)) this.spawnGold();
      if (now >= this.next.fox && !document.getElementById(FOX_ID)) this.foxTurn();
      if (now >= this.next.rain) this.startRain();
      if (now >= this.next.gull && !document.getElementById(GULL_ID)) this.spawnGull();
      if (now >= this.next.clover && !document.getElementById(CLOVER_ID)) this.spawnClover();
      if (this.hunt && now >= this.hunt.end) this.finishHunt();
      if (this.race && now >= this.race.end) this.finishRace();
    } catch (e) {
      console.error(`[${PLUGIN}] tick failed`, e);
    }
  }

  // Clicking stops the duck so it stays easy to hit.
  peck() {
    this.wake();
    if (activeChallenge(this.game)?.noClick) { this.say("Défi : les clics sont interdits !", 1500); return; }
    const now = Date.now();
    this.combo = now - this.comboAt <= COMBO_GAP_MS ? this.combo + 1 : 1;
    this.comboAt = now;
    const gain = clickGain(this.game, this.boosts(), Math.random) * this.comboMultiplier();
    earn(this.game, gain);
    this.game.clicks++;
    this.clickTimes = [...this.clickTimes.filter((at) => now - at < MINUTE), now];
    this.game.stats.fastestMinute = Math.max(this.game.stats.fastestMinute, this.clickTimes.length);
    this.showCount();
    this.setMode("stand", STAND_MS);
    this.floatText(this.element, this.comboMultiplier() > 1 ? `+${format(gain)} (combo ×${this.comboMultiplier().toFixed(1).replace(".", ",")})` : `+${format(gain)}`);
    this.quack();
  }

  // Fast clicking builds a combo, up to ×5. It resets after a short pause.
  comboMultiplier() {
    if (Date.now() - this.comboAt > COMBO_GAP_MS) return 1;
    return Math.min(COMBO_MAX, 1 + Math.floor(this.combo / COMBO_STEP) * 0.5);
  }

  floatText(parent, text) {
    const node = document.createElement("div");
    node.textContent = text;
    node.style.cssText = "position:absolute;left:50%;top:0;color:#ffd84d;font:700 13px var(--font-primary,sans-serif);text-shadow:0 1px 2px #000;pointer-events:none;transition:transform .6s ease-out,opacity .6s ease-out;white-space:nowrap";
    parent.append(node);
    requestAnimationFrame(() => { node.style.transform = "translate(-50%,-34px)"; node.style.opacity = "0"; });
    setTimeout(() => node.remove(), 650);
  }

  spriteNode(id, name, title, extra, onClick) {
    const art = this.sprites[name][0];
    const node = document.createElement("div");
    node.id = id;
    node.title = title;
    node.style.cssText = `position:fixed;left:0;z-index:9999;width:${art.width}px;height:${art.height}px;background:url(${art.toDataURL()}) no-repeat;image-rendering:pixelated;cursor:pointer;${extra}`;
    node.onclick = onClick;
    document.body.append(node);
    return node;
  }

  // The golden duck fills most of the window for 3 seconds. Click it to get the bonus.
  spawnGold() {
    this.schedule("gold");
    const side = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.7);
    const gold = document.createElement("div");
    gold.id = GOLD_ID;
    gold.title = "Clique vite !";
    gold.style.cssText = `position:fixed;left:50%;top:50%;z-index:100003;width:${side}px;height:${side}px;margin:${-side / 2}px 0 0 ${-side / 2}px;cursor:pointer;filter:sepia(1) saturate(4) brightness(1.2) drop-shadow(0 0 30px #ffd84d);transform:scale(.2);opacity:0;transition:transform .25s ease-out,opacity .25s ease-out`;
    gold.append(this.sprite(side));
    gold.onclick = () => this.catchGold();
    document.body.append(gold);
    requestAnimationFrame(() => requestAnimationFrame(() => { gold.style.transform = "scale(1)"; gold.style.opacity = "1"; }));
    this.playQuack();
    setTimeout(() => {
      if (!gold.isConnected) return;
      gold.style.opacity = "0";
      gold.style.transform = "scale(.2)";
      setTimeout(() => gold.remove(), 260);
    }, GOLD_SHOW_MS);

  }
  // Four kinds of golden duck, picked at random when caught.
  catchGold() {
    document.getElementById(GOLD_ID)?.remove();
    this.goldEffects();
    const game = this.game;
    game.stats.goldCaught++;
    const roll = Math.random();
    if (roll < 0.35) {
      this.frenzyUntil = Date.now() + FRENZY_MS;
      this.say(`FRÉNÉSIE : production ×${FRENZY_BONUS} pendant 30 s !`, 4000);
    } else if (roll < 0.6) {
      this.clickFrenzyUntil = Date.now() + FRENZY_MS / 2;
      this.say(`CLICS FOUS : clics ×${CLICK_FRENZY_BONUS} pendant 15 s !`, 4000);
    } else if (roll < 0.85) {
      const coins = Math.min(game.coins * 0.15, perSecond(game) * 900) + 13;
      earn(game, coins);
      this.say(`Trésor : +${format(coins)} Coins !`, 4000);
    } else {
      const owned = GENERATORS.filter((g) => game.owned[g.id] > 0);
      const generator = owned[owned.length - 1] ?? GENERATORS[0];
      game.owned[generator.id]++;
      this.say(`Cadeau : +1 ${generator.name} !`, 4000);
    }
    if (Math.random() < 0.03 * findBonus(game)) {
      const duck = findCatalogue(game, "gold", Math.random);
      if (duck) this.say(`${duck.name} rejoint ta collection !`, 5000);
    }
  }

  // A gold flash over the screen and a burst of coins from the middle.
  goldEffects() {
    document.getElementById("le-canard-flash")?.remove();
    const flash = document.createElement("div");
    flash.id = "le-canard-flash";
    flash.style.cssText = "position:fixed;inset:0;z-index:100004;pointer-events:none;background:radial-gradient(circle,rgba(255,216,77,.75),rgba(255,180,0,.35));transition:opacity .7s ease-out";
    document.body.append(flash);
    requestAnimationFrame(() => requestAnimationFrame(() => { flash.style.opacity = "0"; }));
    setTimeout(() => flash.remove(), 800);
    for (let i = 0; i < COIN_BURST; i++) {
      const coin = document.createElement("div");
      coin.className = "le-canard-piece";
      coin.textContent = "🪙";
      const angle = Math.random() * Math.PI * 2;
      const reach = 150 + Math.random() * 300;
      coin.style.cssText = `position:fixed;left:50%;top:50%;z-index:100005;font-size:${18 + Math.random() * 16}px;pointer-events:none;transition:transform .9s cubic-bezier(.2,.7,.3,1),opacity .9s ease-in`;
      document.body.append(coin);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        coin.style.transform = `translate(${Math.cos(angle) * reach}px,${Math.sin(angle) * reach + 120}px) rotate(${Math.random() * 720}deg)`;
        coin.style.opacity = "0";
      }));
      setTimeout(() => coin.remove(), 950);
    }
  }

  // The real mallard recording, decoded once and played loud when a golden duck appears.
  loadQuack() {
    try {
      const bytes = Uint8Array.from(atob(QUACK_SOUND), (c) => c.charCodeAt(0));
      this.quackAudio = new AudioContext();
      this.quackAudio.decodeAudioData(bytes.buffer).then((buffer) => { this.quackBuffer = buffer; }).catch((e) => console.error(`[${PLUGIN}] sound decode failed`, e));
    } catch (e) {
      console.error(`[${PLUGIN}] sound load failed`, e);
    }
  }

  playQuack() {
    if (BdApi.Data.load(PLUGIN, "goldSound") === false || !this.quackBuffer) return;
    try {
      const context = this.quackAudio;
      if (context.state === "suspended") context.resume();
      const source = context.createBufferSource();
      source.buffer = this.quackBuffer;
      const volume = context.createGain();
      const saved = BdApi.Data.load(PLUGIN, "goldVolume");
      volume.gain.value = QUACK_GAIN * (Number.isFinite(saved) ? saved : 100) / 100;
      const limiter = context.createDynamicsCompressor();
      source.connect(volume).connect(limiter).connect(context.destination);
      source.start(0, QUACK_START, QUACK_LENGTH);
      this.lastQuack = { start: QUACK_START, length: QUACK_LENGTH, gain: volume.gain.value };
    } catch (e) {
      console.error(`[${PLUGIN}] sound failed`, e);
    }
  }

  // Foxes only come during voice calls. Each dog can chase one off before it arrives.
  foxTurn() {
    this.schedule("fox");
    if (!this.channel || !unlocked.defense(this.game)) return;
    if (Math.random() < dogChance(this.game)) {
      const reward = perSecond(this.game) * 10;
      earn(this.game, reward);
      this.game.stats.foxes++;
      this.say(`Tes chiens ont chassé un renard ! +${format(reward)}`, 3000);
      return;
    }
    this.spriteNode(FOX_ID, "renard", `Clique ${FOX_HITS} fois pour le chasser !`, "bottom:0;cursor:crosshair", () => this.hitFox());
    this.fox = { x: Math.random() < 0.5 ? -30 : window.innerWidth, hits: FOX_HITS };
    this.say("UN RENARD ! Clique dessus !", 3000);
    this.chime(300);
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
    if (node) node.style.transform = `translateX(${this.fox.x}px) scaleX(${gap > 0 ? -1 : 1})`;
    if (Math.abs(gap) > 8) return;
    node?.remove();
    this.fox = null;
    const stolen = Math.min(this.game.coins * 0.02, perSecond(this.game) * 60);
    this.game.coins -= stolen;
    this.say(`Le renard a volé ${format(stolen)} Coins !`, 4000);
  }

  // A shower of ducks to click. "Grand parapluie" makes it last twice as long.
  startRain() {
    this.schedule("rain");
    if (this.game.lifetime < 1000) return;
    const length = RAIN_MS * (has(this.game, "parapluie") ? 2 : 1);
    const reward = Math.max(5, perSecond(this.game) * 2);
    this.say("Il pleut des canards !", 3000);
    this.chime(990);
    for (let i = 0; i < RAIN_DUCKS; i++) {
      const drop = this.sprite(CELL * 1.5, `position:fixed;top:-40px;left:${Math.random() * (window.innerWidth - 40)}px;z-index:10001;cursor:pointer;transition:top ${3 + Math.random() * 3}s linear`);
      drop.className = RAIN_CLASS;
      drop.onclick = () => {
        drop.remove();
        earn(this.game, reward);
        this.game.stats.rainDucks++;
        if (Math.random() < 0.004 * findBonus(this.game)) {
          const duck = findCatalogue(this.game, "rain", Math.random);
          if (duck) this.say(`${duck.name} rejoint ta collection !`, 5000);
        }
      };
      setTimeout(() => {
        document.body.append(drop);
        requestAnimationFrame(() => requestAnimationFrame(() => { drop.style.top = `${window.innerHeight + 40}px`; }));
        setTimeout(() => drop.remove(), 6500);
      }, Math.random() * length);
    }
  }

  // A seagull grabs some Pain. Click it before it leaves to get it back, with interest.
  spawnGull() {
    this.schedule("gull");
    if (!unlocked.market(this.game) || this.game.bread < 10) return;
    const stolen = Math.floor(this.game.bread * GULL_SHARE);
    this.game.bread -= stolen;
    this.spriteNode(GULL_ID, "mouette", "Rattrape la mouette !", `top:${80 + Math.random() * 120}px`, () => {
      document.getElementById(GULL_ID)?.remove();
      const back = stolen * (hasNode(this.game, "f2") ? 4 : 2);
      addBread(this.game, back);
      this.game.stats.seagulls++;
      this.gull = null;
      this.say(`Mouette attrapée ! +${format(back)} Pain`, 3000);
    });
    this.gull = { x: window.innerWidth, stolen };
    this.say(`Une mouette a volé ${format(stolen)} Pain !`, 3000);
    this.chime(600);
  }

  moveGull() {
    if (!this.gull) return;
    const node = document.getElementById(GULL_ID);
    this.gull.x -= GULL_SPEED;
    if (node) node.style.transform = `translateX(${this.gull.x}px) translateY(${Math.sin(this.gull.x / 40) * 10}px)`;
    if (this.gull.x > -60) return;
    node?.remove();
    this.gull = null;
  }

  spawnClover() {
    this.schedule("clover");
    if (this.game.lifetime < 1e5) return;
    const clover = this.spriteNode(CLOVER_ID, "trefle", "Un trèfle !", `top:${100 + Math.random() * (window.innerHeight - 260)}px;transform:translateX(${100 + Math.random() * (window.innerWidth - 260)}px) scale(2)`, () => {
      clover.remove();
      const length = CLOVER_MS * (has(this.game, "trefle") ? 2 : 1);
      this.cloverUntil = Date.now() + length;
      this.game.stats.clovers++;
      this.say(`Trèfle : production ×1,5 pendant ${Math.round(length / MINUTE)} min !`, 4000);
    });
    setTimeout(() => clover.remove(), CLOVER_SHOW_MS);
    this.chime(1100);
  }

  step(now) {
    if (!this.running) return;
    try {
      if (this.mode !== "walk" && this.mode !== "sleep" && now >= this.modeUntil) this.mode = "walk";
      const limit = Math.max(SIZE, window.innerWidth - SIZE);
      if (this.mode === "panic" && Math.random() < 0.06) this.direction *= -1;
      this.x += SPEED[this.mode] * this.direction;
      if (this.x <= 0) { this.x = 0; this.direction = 1; }
      if (this.x >= limit) { this.x = limit; this.direction = -1; }
      const wait = this.mode === "walk" ? FRAME_MS : FRAME_MS / 3;
      if (this.mode !== "stand" && this.mode !== "sleep" && now - this.frameAt >= wait) {
        this.frameAt = now;
        this.frame = (this.frame + 1) % FRAMES;
        this.skin.style.backgroundPositionX = `${-this.frame * SIZE}px`;
      }
      this.element.style.transform = `translateX(${this.x}px)`;
      this.body.style.transform = `scaleX(${-this.direction})`;
      this.recordPath();
      this.drawWorld(now);
      this.moveFox();
      this.moveGull();
      if (this.fishing) this.moveFish();

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
    panel.style.cssText = "position:fixed;right:20px;bottom:60px;z-index:10002;width:440px;height:min(660px,calc(100vh - 90px));display:flex;flex-direction:column;padding:12px 14px;border-radius:10px;background:rgba(17,18,20,.97);color:#fff;font:13px var(--font-primary,sans-serif);box-shadow:0 8px 24px rgba(0,0,0,.5)";
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
    const news = document.createElement("div");
    news.style.cssText = "margin-top:6px;padding:4px 8px;border-radius:4px;background:#1e1f22;color:#b5bac1;font-size:11px;font-style:italic;min-height:15px;transition:opacity .4s";
    const tabs = document.createElement("div");
    tabs.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;margin:8px 0";
    const body = document.createElement("div");
    body.style.cssText = "flex:1;min-height:0;overflow-y:auto;padding-right:6px";
    panel.append(top, stats, news, tabs, body);
    document.body.append(panel);
    this.rows = { stats, news, tabs, body };
    this.newsAt = 0;
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
    const boosts = this.boosts();
    const notes = [];
    if (boosts.voice) notes.push(`En vocal ×${String(VOICE_BONUS).replace(".", ",")}`);
    if (boosts.frenzy) notes.push(`Frénésie ×${FRENZY_BONUS}`);
    if (boosts.clickFrenzy) notes.push(`Clics fous ×${CLICK_FRENZY_BONUS}`);
    if (boosts.clover) notes.push("Trèfle ×1,5");
    if (game.hunger > 0.01) notes.push(`Faim -${Math.round(game.hunger * HUNGER_DROP * 100)} %`);
    if (game.challenge) notes.push(`Défi : ${activeChallenge(game).name}`);
    this.rows.stats.textContent = [
      `${format(game.coins)} Coins · ${format(perSecond(game))} /s · ${format(perClick(game))} par clic`,
      `Plumes ${game.feathers} · Pain ${format(game.bread)} · Gemmes ${game.gems} · Œufs ${game.eggs}`,
      ...(notes.length ? [notes.join(" · ")] : [])
    ].join("\n");
    const now = Date.now();
    if (now - this.newsAt >= NEWS_MS) {
      const lines = headlines(game);
      this.newsAt = now;
      this.newsIndex = (this.newsIndex + 1 + Math.floor(Math.random() * Math.max(1, lines.length - 1))) % lines.length;
      this.rows.news.textContent = `📰 ${lines[this.newsIndex]}`;
    }
    for (const update of this.updaters) update();
  }

  live(value) {
    return typeof value === "function" ? value() : value;
  }

  button(label, enabled, action, celebrate) {
    const node = document.createElement("button");
    node.style.cssText = "flex:none;min-width:70px;padding:5px 8px;border:none;border-radius:4px;background:#5865f2;color:#fff;font:600 12px var(--font-primary,sans-serif)";
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
      if (celebrate) this.celebrate();
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
    small.style.cssText = "font-size:11px;color:#b5bac1;white-space:pre-line";
    this.updaters.push(() => { name.textContent = this.live(title); small.textContent = this.live(note); });
    words.append(name, small);
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:4px;flex:none";
    actions.append(...buttons);
    line.append(words, actions);
    this.rows.body.append(line);
    return line;
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
    this.row("Acheter par", "", ...BULK.map((size) => this.button(() => `${size === "max" ? "Max" : `×${size}`}${this.bulk === size ? " ✓" : ""}`, () => true, () => { this.bulk = size; })));
    if (game().stats.leaps > 0) {
      this.row("Majordome canard", "Achète tout seul le meilleur bâtiment toutes les 5 secondes", this.button(() => (BdApi.Data.load(PLUGIN, "autoBuy") === true ? "Activé ✓" : "Désactivé"), () => true, () => BdApi.Data.save(PLUGIN, "autoBuy", BdApi.Data.load(PLUGIN, "autoBuy") !== true)));
    } else {
      this.text("Le Majordome canard (achats automatiques) se débloque après ton premier Grand Envol.");
    }
    let hidden = 0;
    for (const generator of GENERATORS) {
      if (!generatorOpen(game(), generator)) continue;
      if (game().owned[generator.id] === 0 && generator.base > Math.max(game().lifetime, game().coins) * 10) { hidden++; continue; }
      this.row(generator.name, () => `${game().owned[generator.id]} possédés · ${format(rateOf(game(), generator))} /s chacun`,
        this.button(() => this.bulkLabel(generator), () => game().coins >= costOf(game(), generator), () => buyGenerators(game(), generator.id, this.bulk), true));
    }
    if (hidden > 0) this.text(`${hidden} bâtiment(s) mystère encore à découvrir...`);
    if (unlocked.defense(game())) {
      this.row("Chien de garde", () => `${game().dogs} possédés · ${Math.round(dogChance(game()) * 100)} % de chasser les renards`,
        this.button(() => format(dogCost(game())), () => game().coins >= dogCost(game()), () => buyDog(game()), true));
    }
    if (!activeChallenge(game())?.noUpgrades) {
      const visible = UPGRADES.filter((u) => upgradeVisible(game(), u)).sort((a, b) => a.cost - b.cost);
      this.heading(`Améliorations (${game().upgrades.length} / ${UPGRADES.length})`);
      for (const upgrade of visible.slice(0, 25)) {
        this.row(upgrade.name, upgrade.note, this.button(format(upgradeCost(game(), upgrade)), () => game().coins >= upgradeCost(game(), upgrade), () => buyUpgrade(game(), upgrade.id), true));
      }
      if (visible.length === 0) this.text("Achète plus de bâtiments pour débloquer des améliorations.");
    }
    this.heading("Grand Envol");
    this.text(game().challenge ? "Termine ou abandonne ton défi d'abord." : "Recommence ta partie et gagne des plumes. Tu gardes tout le reste : canards, collection, reliques, succès.");
    this.rows.body.append(this.confirmButton("leap", () => (prestigeGain(game()) > 0 ? `S'envoler (+${prestigeGain(game())} plumes)` : `Il te faut ${format(PRESTIGE_STEP)} Coins gagnés`), () => prestigeGain(game()) > 0, () => {
      this.replaceGame(prestige(game()));
      this.say("Le canard s'envole !", 3000);
    }));
  }

  bulkLabel(generator) {
    const game = this.game;
    const count = this.bulk === "max" ? Math.max(1, maxAffordable(game, generator)) : this.bulk;
    return `${count > 1 ? `×${format(count)} : ` : ""}${format(bulkCost(game, generator, count))}`;
  }

  tab_market() {
    const game = () => this.game;
    this.text("Le prix change toutes les 5 minutes, et il est le même pour tout le monde. Tes canards mangent du Pain : sans stock, ta production baisse peu à peu.");
    const chart = document.createElement("canvas");
    chart.width = 400;
    chart.height = 70;
    chart.style.cssText = "width:100%;background:#1e1f22;border-radius:6px";
    this.rows.body.append(chart);
    this.updaters.push(() => this.drawChart(chart));
    this.text(() => {
      const index = marketIndex(Date.now());
      const event = marketEvent(Date.now());
      const trend = index < 0.8 ? "Bon prix d'achat" : index > 1.3 ? "Bon prix de vente" : "Prix moyen";
      const left = MARKET_SLOT_MS - (Date.now() % MARKET_SLOT_MS);
      return `${event ? `⚡ ${event.name}\n` : ""}1 Pain = ${format(breadPrice(game(), Date.now()))} Coins (${trend})\nStock : ${format(game().bread)} / ${format(breadCapacity(game()))} · Frais ${Math.round(marketFee(game()) * 100)} %\nProchain prix dans ${duration(left)}`;
    });
    for (const amount of BREAD_STEPS) {
      this.row(`${format(amount)} Pain`, "", this.button(() => this.buyLabel(amount), () => this.buyCount(amount) >= 1, () => buyBread(game(), amount, Date.now())),
        this.button(() => this.sellLabel(amount), () => game().bread >= 1, () => sellBread(game(), amount, Date.now())));
    }
  }

  buyCount(amount) {
    const game = this.game;
    const price = breadPrice(game, Date.now()) * (1 + marketFee(game));
    return Math.max(0, Math.min(amount, Math.floor(breadCapacity(game) - game.bread), Math.floor(game.coins / price)));
  }

  // The buttons say exactly what will happen: how many, and for how much.
  buyLabel(amount) {
    const count = this.buyCount(amount);
    const price = breadPrice(this.game, Date.now()) * (1 + marketFee(this.game));
    return count >= 1 ? `Acheter ${format(count)} : -${format(count * price)}` : "Acheter";
  }

  sellLabel(amount) {
    const count = Math.min(amount, Math.floor(this.game.bread));
    const income = count * breadPrice(this.game, Date.now()) * (1 - marketFee(this.game));
    return count >= 1 ? `Vendre ${format(count)} : +${format(income)}` : "Vendre";
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
      const value = Math.min(2.4, marketIndex(now - (points - 1 - i) * MARKET_SLOT_MS));
      const x = (i / (points - 1)) * chart.width;
      const y = chart.height - (value / 2.4) * (chart.height - 8) - 4;
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
          if (!reward) return;
          const extra = [reward.duck ? `${reward.duck.name} trouvé !` : "", reward.trophy ? `Trophée : ${reward.trophy.name}` : ""].filter(Boolean).join(" · ");
          this.say(`+${format(reward.coins)} · ${reward.eggs} œuf · ${reward.gems} gemme${reward.lost ? ` · ${reward.lost} perdus` : ""}${extra ? ` · ${extra}` : ""}`, 7000);
        }));
    }
    if (game().expeditions.length === 0) this.text("Personne en route.");
    this.heading("Partir");
    this.row("Combien de Canetons envoyer ?", () => `${this.tripSize(this.tripShare)} sur ${game().owned.caneton} (minimum ${EXPEDITION_MIN})`,
      ...TRIP_SHARES.map((share) => this.button(() => `${share * 100} %${this.tripShare === share ? " ✓" : ""}`, () => true, () => { this.tripShare = share; })));
    for (const zone of ZONES) {
      this.row(zone.name, () => this.tripPreview(zone),
        this.button("Partir", () => this.tripSize(this.tripShare) >= EXPEDITION_MIN && game().expeditions.length < expeditionSlots(game()), () => sendExpedition(game(), zone.id, this.tripSize(this.tripShare), Date.now())));
    }
    if (game().stories.length) {
      this.heading("Carnet de voyage");
      this.text(game().stories.slice(0, 8).join("\n"));
    }
  }

  tripPreview(zone) {
    const count = this.tripSize(this.tripShare);
    const about = estimateExpedition(this.game, zone, Math.max(count, 1));
    const odds = (value) => (value >= 1 ? `~${format(value)}` : `${Math.round(value * 100)} % de chance`);
    return [
      `${duration(zoneDuration(this.game, zone))} · ${count} Canetons`,
      `Gain : ~${format(about.coins)} Coins (+50 % si tu restes en vocal)`,
      `Œufs ${odds(about.eggs)} · Gemmes ${odds(about.gems)} · Éclats ~${format(about.fragments)}`,
      `Pertes : ${about.lostAverage} Canetons en moyenne, ${about.lostMost} au pire`,
      `Canard de collection ${Math.round(about.find * 100)} % · Trophée ${Math.round(about.find * 60)} %`
    ].join("\n");
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
        }, true));
    } else {
      this.row("Couveuse", "Fais éclore un œuf (30 min)", this.button("Couver", () => game().eggs > 0 && game().ducks.length < DUCK_LIMIT, () => startHatch(game(), Date.now())));
      this.row("Élevage", () => (this.parents.length === 2 ? `2 parents choisis · ${BREED_BREAD} Pain · 1 h` : `Choisis 2 parents avec ♥ · ${BREED_BREAD} Pain`),
        this.button("Élever", () => this.parents.length === 2 && game().bread >= BREED_BREAD && game().ducks.length < DUCK_LIMIT, () => { startBreeding(game(), this.parents[0], this.parents[1], Date.now()); this.parents = []; }));
    }
    this.heading("Tes canards");
    for (const duck of [...game().ducks].sort((a, b) => b.rarity - a.rarity)) {
      const traits = duck.traits.map((t) => TRAITS[t].name).join(", ");
      this.row(`${duck.shiny ? "✨ " : ""}${duck.name}`, `${RARITIES[duck.rarity]} · ${traits}`,
        this.button(() => (game().team.includes(duck.id) ? "Équipe ✓" : "Équipe"), () => game().team.includes(duck.id) || game().team.length < TEAM_SIZE, () => toggleTeam(game(), duck.id)),
        this.button(() => (this.parents.includes(duck.id) ? "♥ ✓" : "♥"), () => true, () => {
          this.parents = this.parents.includes(duck.id) ? this.parents.filter((id) => id !== duck.id) : [...this.parents, duck.id].slice(-2);
        }),
        this.confirmButton(`free-${duck.id}`, `+${1 + duck.rarity} 💎`, () => true, () => { releaseDuck(game(), duck.id); this.parents = this.parents.filter((id) => id !== duck.id); }));
    }
  }

  tab_games() {
    const game = () => this.game;
    const ready = (key) => () => gameReady(game(), key, Date.now());
    const wait = (key, label) => () => (gameReady(game(), key, Date.now()) ? label : `Dans ${duration(game().cooldowns[key] - Date.now())}`);
    if (this.hunt) return this.huntBoard();
    if (this.race) return this.raceTrack();
    if (this.fishing) return this.fishPond();
    this.text("Des minijeux pour gagner des Coins, des gemmes, des œufs et des canards de collection.");
    this.heading("Chasse aux œufs");
    this.row("Trouve 6 œufs en 30 secondes", "Chaque œuf : 1 min de production. Les 6 : un œuf bonus", this.button(wait("eggs", "Jouer"), ready("eggs"), () => {
      if (!useGame(game(), "eggs", Date.now())) return;
      this.hunt = { eggs: eggHuntBoard(Math.random), opened: new Set(), found: 0, end: Date.now() + EGG_HUNT_MS };
    }));
    this.heading("Course de canards");
    this.text(() => `Mise : 10 % de tes Coins (${format(Math.floor(game().coins * RACE_BET_SHARE))}). Le gagnant rapporte ×${String(RACE_PAYOUT).replace(".", ",")}.`);
    RACERS.forEach((name, pick) => this.row(name, ["En forme", "Rapide au départ", "Puissant", "Imprévisible"][pick], this.button(wait("race", "Parier"), () => ready("race")() && game().coins >= 10, () => {
      if (!useGame(game(), "race", Date.now())) return;
      const result = runRace(game(), pick, Math.random);
      this.race = { ...result, pick, end: Date.now() + RACE_MS, start: Date.now(), speeds: RACERS.map((_, i) => (i === result.winner ? 1 : 0.7 + Math.random() * 0.25)) };
    })));
    this.heading("Pêche");
    this.row("5 lancers", () => `Poissons en stock : ${game().fishStock} (${FISH_PER_GEM} = 1 gemme)`, this.button(wait("fish", "Pêcher"), ready("fish"), () => {
      if (!useGame(game(), "fish", Date.now())) return;
      this.fishing = { casts: FISH_CASTS, start: performance.now(), zone: 0.15 + Math.random() * 0.6, width: FISH_ZONE, log: [] };
    }), this.button("Échanger", () => game().fishStock >= FISH_PER_GEM, () => { const gems = tradeFish(game()); this.say(`+${gems} gemme(s) !`, 2500); }));
    this.heading("Machine à sous");
    this.row(`${SLOT_COST} Pain la partie`, () => this.slotsShown ?? "Trois symboles identiques : jackpot !", this.button("Jouer", () => game().bread >= SLOT_COST, () => {
      const prize = spinSlots(game(), Math.random);
      if (!prize) return;
      this.slotsShown = `${prize.reels.join(" ")}  ${prize.text}`;
      if (prize.text !== "Perdu !") this.chime(prize.text.startsWith("JACKPOT") ? 1500 : 1000);
    }));
  }

  huntBoard() {
    const hunt = this.hunt;
    this.text(() => `Œufs trouvés : ${hunt.found} / ${EGG_HUNT_EGGS} · ${Math.max(0, Math.ceil((hunt.end - Date.now()) / 1000))} s`);
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px";
    for (let cell = 0; cell < EGG_HUNT_CELLS; cell++) {
      const square = document.createElement("button");
      square.style.cssText = "height:56px;border:none;border-radius:6px;background:#2b2d31;font-size:24px;cursor:pointer;color:#fff";
      square.textContent = hunt.opened.has(cell) ? (hunt.eggs.has(cell) ? "🥚" : "🌿") : "";
      square.onclick = () => {
        if (hunt.opened.has(cell) || this.hunt !== hunt) return;
        hunt.opened.add(cell);
        square.textContent = hunt.eggs.has(cell) ? "🥚" : "🌿";
        square.style.background = hunt.eggs.has(cell) ? "#3a4f2b" : "#1e1f22";
        if (hunt.eggs.has(cell)) hunt.found++;
        if (hunt.found === EGG_HUNT_EGGS) this.finishHunt();
      };
      grid.append(square);
    }
    this.rows.body.append(grid);
  }

  finishHunt() {
    const hunt = this.hunt;
    if (!hunt) return;
    this.hunt = null;
    const reward = eggHuntReward(this.game, hunt.found, Math.random);
    this.say(`${hunt.found} œufs : +${format(reward.coins)}${reward.egg ? " · +1 œuf" : ""}${reward.duck ? ` · ${reward.duck.name} !` : ""}`, 5000);
    this.dirty = true;
  }

  raceTrack() {
    const race = this.race;
    this.text(`Tu as misé ${format(race.bet)} sur ${RACERS[race.pick]}.`);
    RACERS.forEach((name, index) => {
      const lane = document.createElement("div");
      lane.style.cssText = "position:relative;height:30px;margin:6px 0;border-radius:6px;background:#1e1f22;overflow:hidden";
      const runner = this.sprite(CELL, "position:absolute;top:4px;left:0;transform:scaleX(-1)");
      const tag = document.createElement("div");
      tag.textContent = name;
      tag.style.cssText = "position:absolute;right:8px;top:7px;font-size:11px;color:#b5bac1";
      lane.append(tag, runner);
      this.rows.body.append(lane);
      this.updaters.push(() => {
        const progress = Math.min(1, ((Date.now() - race.start) / RACE_MS) * race.speeds[index]);
        runner.style.left = `${progress * (lane.clientWidth - CELL - 4)}px`;
        runner.style.backgroundPositionX = `${-Math.floor(Date.now() / 90 + index) % FRAMES * CELL}px`;
      });
    });
  }

  finishRace() {
    const race = this.race;
    this.race = null;
    this.say(race.won ? `${RACERS[race.winner]} gagne ! +${format(race.bet * RACE_PAYOUT * gameBonus(this.game))}${race.duck ? ` · ${race.duck.name} !` : ""}` : `${RACERS[race.winner]} gagne. Perdu !`, 5000);
    this.dirty = true;
  }

  fishPond() {
    const fishing = this.fishing;
    this.text(() => `Lancers restants : ${fishing.casts}. Clique « Ferrer » quand le bouchon est dans la zone verte.`);
    const bar = document.createElement("div");
    bar.style.cssText = "position:relative;height:28px;margin:10px 0;border-radius:6px;background:#1e3a5f;overflow:hidden";
    const zone = document.createElement("div");
    zone.style.cssText = `position:absolute;top:0;bottom:0;left:${fishing.zone * 100}%;width:${fishing.width * 100}%;background:rgba(63,163,77,.7)`;
    const bob = document.createElement("div");
    bob.style.cssText = "position:absolute;top:6px;width:16px;height:16px;border-radius:50%;background:#c8383e;border:2px solid #fff";
    bar.append(zone, bob);
    this.rows.body.append(bar);
    this.fishBob = bob;
    const strike = document.createElement("button");
    strike.textContent = "Ferrer !";
    strike.style.cssText = "width:100%;padding:10px;border:none;border-radius:6px;background:#5865f2;color:#fff;font:700 14px var(--font-primary,sans-serif);cursor:pointer";
    strike.onclick = () => this.strike();
    this.rows.body.append(strike);
    this.text(() => fishing.log.slice(-5).join("\n"));
  }

  // The float moves at one steady speed, worked out from the clock, so every cast feels the same.
  fishMarker() {
    const phase = ((performance.now() - this.fishing.start) % FISH_PERIOD_MS) / FISH_PERIOD_MS;
    return phase < 0.5 ? phase * 2 : 2 - phase * 2;
  }

  moveFish() {
    if (this.fishBob?.isConnected) this.fishBob.style.left = `calc(${this.fishMarker() * 100}% - 8px)`;
  }

  strike() {
    const fishing = this.fishing;
    if (!fishing) return;
    const marker = this.fishMarker();
    const inside = marker >= fishing.zone - 0.02 && marker <= fishing.zone + fishing.width + 0.02;
    if (inside) {
      const { fish, duck } = catchFish(this.game, Math.random);
      fishing.log.push(`🐟 ${fish.name} !${duck ? ` Et ${duck.name} !` : ""}`);
    } else {
      fishing.log.push("Raté...");
    }
    fishing.casts--;
    fishing.zone = 0.15 + Math.random() * 0.6;
    if (fishing.casts <= 0) {
      this.say(fishing.log.filter((l) => l.startsWith("🐟")).length ? "Belle pêche !" : "Rien cette fois...", 3000);
      this.fishing = null;
    }
    this.dirty = true;
    this.refresh();
  }
  catalogueIcon(entry, known) {
    const icon = document.createElement("canvas");
    icon.width = CELL * 2;
    icon.height = CELL * 2;
    icon.style.cssText = `width:44px;height:44px;image-rendering:pixelated;${known ? "" : "filter:brightness(0) opacity(.35)"}`;
    const draw = () => {
      const pen = icon.getContext("2d");
      pen.imageSmoothingEnabled = false;
      pen.filter = `hue-rotate(${entry.hue}deg)`;
      pen.drawImage(this.strip, 0, 0, CELL, CELL, 0, 0, CELL * 2, CELL * 2);
      pen.filter = "none";
      pen.font = "16px sans-serif";
      pen.fillText(entry.badge, 26, 16);
    };
    if (this.strip.complete) draw(); else this.strip.addEventListener("load", draw, { once: true });
    return icon;
  }

  tab_collection() {
    const game = () => this.game;
    const sources = { expedition: "expéditions", slots: "machine à sous", gold: "canards dorés", eggs: "chasse aux œufs", rain: "pluies de canards", race: "courses", fish: "pêche" };
    this.text(() => `Canards célèbres : ${game().catalogue.length} / ${CATALOGUE.length} (+${CATALOGUE_BONUS * 100} % de production chacun).`);
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(5,1fr);gap:6px";
    this.text("Clique sur un canard trouvé pour porter son skin.");
    this.row("Skin classique", "", this.button(() => (game().skin ? "Porter" : "Porté"), () => Boolean(game().skin), () => { game().skin = null; this.applySkin(); }));
    for (const entry of CATALOGUE) {
      const known = game().catalogue.includes(entry.id);
      const cell = document.createElement("div");
      cell.title = known ? `${entry.name} : clique pour le porter` : `??? (se trouve via : ${sources[entry.source]})`;
      const worn = game().skin === entry.id;
      cell.style.cssText = `display:flex;flex-direction:column;align-items:center;padding:4px;border-radius:6px;background:#1e1f22;font-size:10px;text-align:center;color:#b5bac1;cursor:${known ? "pointer" : "default"};outline:${worn ? "2px solid #5865f2" : "none"}`;
      if (known) cell.onclick = () => { game().skin = entry.id; this.applySkin(); this.celebrate(); this.save(); this.dirty = true; this.refresh(); };
      const name = document.createElement("div");
      name.textContent = known ? entry.name.replace("Canard ", "") : "???";
      cell.append(this.catalogueIcon(entry, known), name);
      grid.append(cell);
    }
    this.rows.body.append(grid);
    this.heading(`Chapeaux (${game().hats.length} / ${HATS.length})`);
    this.row("Sans chapeau", "", this.button(() => (game().hat ? "Mettre" : "Porté"), () => Boolean(game().hat), () => { game().hat = null; this.drawHat(); }));
    for (const hat of HATS) {
      const owned = game().hats.includes(hat.id);
      this.row(hat.name, owned ? "Débloqué" : hat.how, this.button(() => (game().hat === hat.id ? "Porté" : owned ? "Mettre" : "🔒"), () => owned && game().hat !== hat.id, () => { game().hat = hat.id; this.drawHat(); }, true));
    }
    this.heading(`Salle des trophées (${game().trophies.length} / ${TROPHIES.length}, +${TROPHY_BONUS * 100} % chacun)`);
    this.text(TROPHIES.map((t) => (game().trophies.includes(t.id) ? `🏆 ${t.name}` : "▫️ ???")).join("\n"));
  }

  tab_tree() {
    const game = () => this.game;
    this.text(() => `${game().feathers} plumes à dépenser sur ${game().feathersTotal} gagnées. Bonus des plumes : ×${format(featherBonus(game()))} à tout (+2 % par plume jusqu'à 100, puis moins).`);
    for (const branch of ["Clics", "Production", "Expéditions", "Gestion", "Fête"]) {
      this.heading(branch);
      for (const node of TREE.filter((n) => n.branch === branch)) {
        this.row(node.name, node.note, this.button(() => (hasNode(game(), node.id) ? "Acquis" : node.needs && !hasNode(game(), node.needs) ? "Verrouillé" : `${node.cost} plumes`),
          () => !hasNode(game(), node.id) && game().feathers >= node.cost && (!node.needs || hasNode(game(), node.needs)), () => buyNode(game(), node.id), true));
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
    this.text(() => `${game().gems} gemmes. Les reliques restent pour toujours.`);
    for (const relic of RELICS) {
      this.row(relic.name, relic.note, this.button(() => (hasRelic(game(), relic.id) ? "Acquise" : `${relic.cost} 💎`), () => !hasRelic(game(), relic.id) && game().gems >= relic.cost, () => buyRelic(game(), relic.id), true));
    }
  }

  tab_quests() {
    const game = () => this.game;
    this.text(() => `Série de ${game().daily?.streak ?? 0} jour(s). Chaque quête donne 1 gemme, 600 Pain et 3 éclats de plume. Elles changent chaque jour.`);
    (game().daily?.quests ?? []).forEach((quest, index) => {
      const { about } = questProgress(game(), quest);
      const scale = about.scale ?? 1;
      this.row(about.name.replace("{n}", about.goal / scale), () => `${Math.floor(questProgress(game(), quest).value / scale)} / ${about.goal / scale}`,
        this.button(() => (quest.done ? "Reçu" : "Prendre"), () => !quest.done && questProgress(game(), quest).value >= about.goal, () => claimQuest(game(), index), true));
    });
  }

  tab_trophies() {
    const game = () => this.game;
    this.text(() => `${game().achievements.length} / ${ACHIEVEMENTS.length} succès. Chacun donne +1 % de production pour toujours.`);
    for (const achievement of ACHIEVEMENTS) {
      const done = game().achievements.includes(achievement.id);
      if (achievement.secret && !done) { this.row("??? Succès secret", "Trouve-le par toi-même"); continue; }
      this.row(`${done ? "✓ " : ""}${achievement.name}`, achievement.secret ? "Succès secret" : `Objectif : ${format(achievement.goal)}`);
    }
  }

  tab_stats() {
    const game = () => this.game;
    this.text(() => {
      const g = game();
      const s = g.stats;
      return [
        `Coins gagnés en tout : ${format(g.lifetime)}`, `Coins de cette partie : ${format(g.run)}`, `Meilleure production : ${format(s.bestPerSecond)} /s`,
        `Clics : ${format(g.clicks)} (record : ${s.fastestMinute} en une minute)`, `Grands Envols : ${s.leaps}`, `Canards dorés attrapés : ${s.goldCaught}`,
        `Canards de pluie attrapés : ${s.rainDucks}`, `Mouettes attrapées : ${s.seagulls}`, `Trèfles trouvés : ${s.clovers}`, `Renards chassés : ${s.foxes}`,
        `Expéditions : ${s.expeditions} (Canetons perdus en route : ${s.lostDucks})`, `Œufs éclos : ${s.hatched}`, `Échanges au marché : ${s.trades}`,
        `Poissons pêchés : ${s.fish}`, `Courses : ${s.racesWon} gagnées, ${s.racesLost} perdues`, `Machine à sous : ${s.slotsPlayed} parties, ${s.jackpots} jackpots`,
        `Œufs trouvés à la chasse : ${s.eggsFound}`, `Temps en vocal : ${duration(s.voiceSeconds * 1000)}`, `Cadeaux offerts : ${s.gifts}`,
        `Améliorations : ${g.upgrades.length} / ${UPGRADES.length}`, `Succès : ${g.achievements.length} / ${ACHIEVEMENTS.length}`,
        `Collection : ${g.catalogue.length} / ${CATALOGUE.length} · Trophées : ${g.trophies.length} / ${TROPHIES.length} · Chapeaux : ${g.hats.length} / ${HATS.length}`
      ].join("\n");
    });
  }

  tab_display() {
    this.text("Choisis ce qui s'affiche à l'écran. Les événements et le canard principal restent toujours visibles.");
    this.row("Tout le domaine en bas de l'écran", "", this.button(() => (this.setting("world") ? "Visible" : "Caché"), () => true, () => {
      const on = !this.setting("world");
      BdApi.Data.save(PLUGIN, "world", on);
      this.canvas.style.display = on ? "block" : "none";
    }));
    this.row("Tout afficher / tout cacher", "", this.button("Tout afficher", () => this.hidden().length > 0, () => { BdApi.Data.save(PLUGIN, "hidden", []); this.applyDisplay(); }),
      this.button("Tout cacher", () => true, () => { BdApi.Data.save(PLUGIN, "hidden", SHOWABLE.map(([id]) => id)); this.applyDisplay(); }));
    this.heading("Un par un");
    for (const [id, name] of SHOWABLE) {
      this.row(name, "", this.button(() => (this.visible(id) ? "Visible ✓" : "Caché"), () => true, () => {
        const hidden = this.hidden();
        BdApi.Data.save(PLUGIN, "hidden", hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]);
        this.applyDisplay();
      }));
    }
  }

  tab_gifts() {
    const game = () => this.game;
    this.text("Fais un cadeau à un ami : copie le code et envoie-le toi-même. Rien n'est jamais envoyé pour toi.");
    this.heading("Offrir");
    const fields = { pain: "bread", gemme: "gems", oeuf: "eggs" };
    this.row("Quoi ?", () => `Tu as ${format(game().bread)} Pain · ${game().gems} gemmes · ${game().eggs} œufs`,
      ...Object.keys(GIFT_NAMES).map((kind) => this.button(() => `${GIFT_NAMES[kind]}${this.giftKind === kind ? " ✓" : ""}`, () => true, () => { this.giftKind = kind; })));
    const amount = document.createElement("input");
    amount.type = "number";
    amount.min = "1";
    amount.value = String(this.giftAmount);
    amount.placeholder = "Combien ?";
    amount.style.cssText = "width:100%;box-sizing:border-box;padding:8px;margin:4px 0 6px;border:none;border-radius:4px;background:#1e1f22;color:#fff";
    amount.onkeydown = (e) => e.stopPropagation();
    amount.oninput = () => { this.giftAmount = Math.floor(Number(amount.value)); this.refresh(); };
    this.rows.body.append(amount);
    this.rows.body.append(this.button(() => `Copier le code : ${format(Math.max(0, this.giftAmount || 0))} ${GIFT_NAMES[this.giftKind]}`,
      () => this.giftAmount >= 1 && this.giftAmount <= GIFT_LIMIT && game()[fields[this.giftKind]] >= this.giftAmount, () => {
        const code = makeGift(game(), this.giftKind, this.giftAmount, Math.random);
        if (code) this.copy(code);
      }));    this.heading("Recevoir");
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

  tone(type, from, to, level, length) {
    try {
      this.audio ??= new AudioContext();
      const start = this.audio.currentTime;
      const tone = this.audio.createOscillator();
      const gain = this.audio.createGain();
      tone.type = type;
      tone.frequency.setValueAtTime(from, start);
      tone.frequency.exponentialRampToValueAtTime(to, start + length);
      gain.gain.setValueAtTime(level, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + length);
      tone.connect(gain).connect(this.audio.destination);
      tone.start(start);
      tone.stop(start + length + 0.01);
    } catch (e) {
      console.error(`[${PLUGIN}] sound failed`, e);
    }
  }

  quack() {
    const now = performance.now();
    if (!this.setting("sound") || now - this.soundAt < SOUND_GAP_MS) return;
    this.soundAt = now;
    this.tone("sawtooth", 420, 220, 0.05, 0.11);
  }

  chime(pitch) {
    if (BdApi.Data.load(PLUGIN, "eventSounds") !== true) return;
    this.tone("triangle", pitch, pitch * 1.5, 0.06, 0.25);
  }

  getSettingsPanel() {
    return BdApi.UI.buildSettingsPanel({
      settings: [
        { type: "switch", id: "sound", name: "Bruit des coin-coin", value: this.setting("sound") },
        { type: "switch", id: "eventSounds", name: "Sons des événements", value: BdApi.Data.load(PLUGIN, "eventSounds") === true },
        { type: "switch", id: "goldSound", name: "Cri du canard doré (vrai canard, fort)", note: "Son : « Mallard Duck » par Mike Koenig, SoundBible.com, licence CC BY 3.0", value: BdApi.Data.load(PLUGIN, "goldSound") !== false },
        { type: "slider", id: "goldVolume", name: "Volume du cri du canard doré", value: Number.isFinite(BdApi.Data.load(PLUGIN, "goldVolume")) ? BdApi.Data.load(PLUGIN, "goldVolume") : 100, min: 0, max: 100 },
        { type: "switch", id: "world", name: "Afficher le domaine en bas de l'écran", value: this.setting("world") }
      ],
      onChange: (_, id, value) => {
        BdApi.Data.save(PLUGIN, id, value);
        if (id === "world" && this.canvas) this.canvas.style.display = value ? "block" : "none";
      }
    });
  }
}

module.exports = LeCanard;
Object.assign(module.exports, { bulkCost, maxAffordable, buyGenerators, autoBuy, estimateExpedition, clean, perSecond, perClick, costOf, prestige, prestigeGain, offlineGain, format, earn, buyGenerator, buyUpgrade, upgradeVisible, buyNode, sendExpedition, claimExpedition, startHatch, collectNest, startBreeding, marketIndex, marketEvent, buyBread, sellBread, advance, startChallenge, makeGift, openGift, refreshDaily, claimQuest, eggHuntBoard, eggHuntReward, runRace, catchFish, tradeFish, spinSlots, useGame, findCatalogue, headlines, ACHIEVEMENTS, UPGRADES, GENERATORS, CATALOGUE, HATS, TROPHIES, TREE });
