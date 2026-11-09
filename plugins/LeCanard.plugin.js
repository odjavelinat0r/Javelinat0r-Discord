/**
 * @name LeCanard
 * @author Kerminat0r
 * @version 4.0.0
 * @description Un énorme jeu incrémental dans Discord : 18 bâtiments, 100+ améliorations, événements, minijeux, collection de canards, chapeaux, expéditions, marché du Pain et 150+ succès. Clic sur le canard pour gagner, clic droit pour ouvrir le jeu.
 */

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
  { id: "mains", name: "Sans les mains", note: "Les clics ne rapportent rien", noClick: true },
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
  catalogue: [], hats: [], hat: null, trophies: [], cooldowns: {}, stories: []
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

// What survives a restart: everything except the run itself.
function restart(game) {
  const keep = { ...game };
  for (const key of ["coins", "run", "owned", "upgrades", "hunger", "challenge"]) delete keep[key];
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
    Object.assign(this, { frenzyUntil: 0, clickFrenzyUntil: 0, cloverUntil: 0, hunt: null, race: null, fishing: null, slotsShown: null });
    this.lastActive = Date.now();
    this.lastTick = Date.now();
    this.next = {};
    for (const key of Object.keys(TIMERS)) this.schedule(key);
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
    for (const id of [DUCK_ID, GOLD_ID, FOX_ID, GULL_ID, CLOVER_ID, PANEL_ID, WORLD_ID]) document.getElementById(id)?.remove();
    for (const node of document.querySelectorAll(`.${RAIN_CLASS}`)) node.remove();
    this.audio?.close?.();
    this.audio = null;
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
    const body = this.sprite(SIZE, "position:relative");
    const hat = document.createElement("canvas");
    hat.style.cssText = "position:absolute;image-rendering:pixelated;pointer-events:none";
    body.append(hat);
    const label = "position:absolute;left:50%;transform:translateX(-50%);padding:1px 6px;border-radius:7px;font:700 11px var(--font-primary,sans-serif);white-space:nowrap;pointer-events:none";
    const counter = document.createElement("div");
    counter.style.cssText = `${label};bottom:calc(100% + 6px);background:rgba(17,18,20,.85);color:#ffd84d`;
    const bubble = document.createElement("div");
    bubble.style.cssText = `${label};bottom:calc(100% + 26px);background:#fff;color:#111;display:none`;
    duck.append(body, counter, bubble);
    duck.onclick = () => this.peck();
    duck.oncontextmenu = (e) => { e.preventDefault(); this.togglePanel(); };
    document.body.append(duck);
    Object.assign(this, { element: duck, body, hatCanvas: hat, counter, bubble });
    this.buildWorld();
    this.drawHat();
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
    canvas.style.display = "block";
    canvas.style.left = `${30 - art.width / 2}px`;
    canvas.style.top = `${4 - art.height}px`;
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
    if (!owned) return;
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
    const gain = clickGain(this.game, this.boosts(), Math.random);
    earn(this.game, gain);
    this.game.clicks++;
    const now = Date.now();
    this.clickTimes = [...this.clickTimes.filter((at) => now - at < MINUTE), now];
    this.game.stats.fastestMinute = Math.max(this.game.stats.fastestMinute, this.clickTimes.length);
    this.showCount();
    this.setMode("stand", STAND_MS);
    this.floatText(this.element, `+${format(gain)}`);
    this.quack();
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

  spawnGold() {
    this.schedule("gold");
    const gold = document.createElement("div");
    gold.id = GOLD_ID;
    gold.title = "Attrape-le !";
    gold.style.cssText = `position:fixed;left:0;bottom:0;z-index:9999;width:${SIZE}px;height:${SIZE}px;cursor:pointer;filter:sepia(1) saturate(4) brightness(1.2) drop-shadow(0 0 6px #ffd84d)`;
    gold.append(this.sprite(SIZE, "transform:scaleX(-1)"));
    gold.onclick = () => this.catchGold();
    document.body.append(gold);
    this.goldX = window.innerWidth;
    this.chime(1320);
  }

  // Four kinds of golden duck, picked at random when caught.
  catchGold() {
    document.getElementById(GOLD_ID)?.remove();
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
    if (node) node.style.transform = `translateX(${this.fox.x}px) scaleX(${gap < 0 ? -1 : 1})`;
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
        this.body.style.backgroundPositionX = `${-this.frame * SIZE}px`;
      }
      this.element.style.transform = `translateX(${this.x}px)`;
      this.body.style.transform = `scaleX(${this.direction})`;
      this.recordPath();
      this.drawWorld(now);
      this.moveFox();
      this.moveGull();
      if (this.fishing) this.moveFish(now);
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
    small.style.cssText = "font-size:11px;color:#b5bac1";
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
    let hidden = 0;
    for (const generator of GENERATORS) {
      if (!generatorOpen(game(), generator)) continue;
      if (game().owned[generator.id] === 0 && generator.base > Math.max(game().lifetime, game().coins) * 10) { hidden++; continue; }
      this.row(generator.name, () => `${game().owned[generator.id]} possédés · ${format(rateOf(game(), generator))} /s chacun`,
        this.button(() => format(costOf(game(), generator)), () => game().coins >= costOf(game(), generator), () => buyGenerator(game(), generator.id), true));
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
    for (const zone of ZONES) {
      this.row(zone.name, () => `${duration(zoneDuration(game(), zone))} · risque ${Math.round(zoneRisk(game(), zone) * 100)} %`,
        ...[0.25, 0.5, 1].map((share) => this.button(`${share * 100} %`, () => this.tripSize(share) >= EXPEDITION_MIN && game().expeditions.length < expeditionSlots(game()), () => sendExpedition(game(), zone.id, this.tripSize(share), Date.now()))));
    }
    if (game().stories.length) {
      this.heading("Carnet de voyage");
      this.text(game().stories.slice(0, 8).join("\n"));
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
      this.fishing = { casts: FISH_CASTS, marker: 0, speed: 0.012 + Math.random() * 0.01, zone: 0.3 + Math.random() * 0.4, width: 0.16, log: [] };
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
      const runner = this.sprite(CELL, "position:absolute;top:4px;left:0");
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

  moveFish() {
    const fishing = this.fishing;
    fishing.marker += fishing.speed;
    if (fishing.marker >= 1 || fishing.marker <= 0) { fishing.speed *= -1; fishing.marker = Math.max(0, Math.min(1, fishing.marker)); }
    if (this.fishBob?.isConnected) this.fishBob.style.left = `calc(${fishing.marker * 100}% - 8px)`;
  }

  strike() {
    const fishing = this.fishing;
    if (!fishing) return;
    const inside = fishing.marker >= fishing.zone && fishing.marker <= fishing.zone + fishing.width;
    if (inside) {
      const { fish, duck } = catchFish(this.game, Math.random);
      fishing.log.push(`🐟 ${fish.name} !${duck ? ` Et ${duck.name} !` : ""}`);
    } else {
      fishing.log.push("Raté...");
    }
    fishing.casts--;
    fishing.zone = 0.1 + Math.random() * 0.7;
    fishing.speed = Math.sign(fishing.speed) * (0.012 + Math.random() * 0.012);
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
    for (const entry of CATALOGUE) {
      const known = game().catalogue.includes(entry.id);
      const cell = document.createElement("div");
      cell.title = known ? entry.name : `??? (se trouve via : ${sources[entry.source]})`;
      cell.style.cssText = "display:flex;flex-direction:column;align-items:center;padding:4px;border-radius:6px;background:#1e1f22;font-size:10px;text-align:center;color:#b5bac1";
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

  tab_gifts() {
    const game = () => this.game;
    this.text("Fais un cadeau à un ami : copie le code et envoie-le toi-même. Rien n'est jamais envoyé pour toi.");
    this.heading("Offrir");
    const gift = (kind, amount, enabled) => this.button("Copier le code", enabled, () => {
      const code = makeGift(game(), kind, amount, Math.random);
      if (code) this.copy(code);
    });
    this.row("1 000 Pain", () => `Tu as ${format(game().bread)} Pain`, gift("pain", 1000, () => game().bread >= 1000));
    this.row("1 gemme", () => `Tu as ${game().gems} gemmes`, gift("gemme", 1, () => game().gems >= 1));
    this.row("1 œuf", () => `Tu as ${game().eggs} œufs`, gift("oeuf", 1, () => game().eggs >= 1));
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
Object.assign(module.exports, { clean, perSecond, perClick, costOf, prestige, prestigeGain, offlineGain, format, earn, buyGenerator, buyUpgrade, upgradeVisible, buyNode, sendExpedition, claimExpedition, startHatch, collectNest, startBreeding, marketIndex, marketEvent, buyBread, sellBread, advance, startChallenge, makeGift, openGift, refreshDaily, claimQuest, eggHuntBoard, eggHuntReward, runRace, catchFish, tradeFish, spinSlots, useGame, findCatalogue, headlines, ACHIEVEMENTS, UPGRADES, GENERATORS, CATALOGUE, HATS, TROPHIES, TREE });
