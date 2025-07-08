// FILE: script.js

// --- Firebase Firestore Imports (MUST be at the top of the file) ---
// These specific Firestore functions are needed for database operations like adding, querying, and getting documents.
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- 1. Game State Variables ---
let currentSeedWord = "";
let currentTargetWord = "";
let currentChain = [];
let currentDifficulty = "N/A";
let optimalPathLength = 0;
let targetTransitionsForScoring = 0;
let powerUpCounts = { hint: 0, swap: 0, skip: 0 }; // Tracks AVAILABLE power-ups (reset on new game)
let powerUpsUsedThisGame = { hint: 0, swap: 0, skip: 0 }; // Tracks power-ups *ACTUALLY USED* in the current game (reset on new game)
let currentScore = 0;
let gameTimer = 0;
let timerInterval = null;
let gameInProgress = false;

// --- 2. Game Elements (Get References from HTML) ---
const seedWordDisplay = document.getElementById('seed-word-display');
const targetWordDisplay = document.getElementById('target-word-display');
const difficultyDisplay = document.getElementById('difficulty-display');
const wordChainList = document.getElementById('word-chain-list');
const userGuessInput = document.getElementById('user-guess-input');
const submitGuessBtn = document.getElementById('submit-guess-btn');
const currentScoreDisplay = document.getElementById('current-score');
const timerDisplay = document.getElementById('timer-display');
const hintCountDisplay = document.getElementById('hint-count');
const swapCountDisplay = document.getElementById('swap-count');
const skipCountDisplay = document.getElementById('skip-count');
const hintBtn = document.getElementById('hint-btn');
const swapBtn = document.getElementById('swap-btn');
const skipBtn = document.getElementById('skip-btn');
const leaderboardList = document.getElementById('leaderboard-list');

// --- 3. Game Dictionary (Crucial for Word Validation) ---
const dictionary = [
    "READ", "HEAD", "HELD", "HOLD", "HOLE", "ROLE", "ROSE", // For testing READ-ROSE
    "WAVE", "DAVE", "DIVE", "WANE", "WINE", "DINE",           // For testing WAVE-DIVE
    "CAT", "COT", "COG", "DOG",                               // For testing CAT-DOG
    "MAKE", "TAKE",
    "COLD", "CORD", "WORD", "WORM", "WARM",
    "PINE", "PANE", "SANE", "SALE", "SALT",
    "LIME", "LIMP", "SIMP", "SUMP", "PUMP", "POMP", "POOP", "COOP", "COUP", "SOUP",
    "BALE", "BALD", "BOLD", "COLD",
    "FLAME", "BLAME", "BLASE", "BLAST",
    "GAME", "DAME", "DOME", "HOME",
    "STAY", "SLAY", "PLAY",
    "FLAM",
    // --- Full Dictionary (Expanded for robustness) ---
    "AHEM", "ABLE", "ACID", "AIDE", "AIL", "AIM", "AIR", "ALAS", "ALGA", "ALL", "ALLY", "ALOE", "ALSO", "ALT", "AMEN", "AMI", "AMID", "AMMO", "AMOK", "AMP", "AND", "ANEW", "ANTI", "ANTS", "APE", "APEX", "APES", "APPS", "ARCH", "ARE", "ARID", "ARMS", "ARMY", "ARTS", "ASH", "ASIA", "ASK", "AUNT", "AURA", "AUTO", "AVE", "AWAY", "AWE", "AXE", "AXIS", "AXLE",
    "BACK", "BAD", "BAG", "BAIL", "BAIT", "BAKE", "BALD", "BALE", "BALL", "BALM", "BAND", "BANE", "BANG", "BANK", "BAR", "BARD", "BARE", "BARK", "BARN", "BASE", "BASH", "BAT", "BATH", "BATS", "BEAD", "BEAK", "BEAM", "BEAN", "BEAR", "BEAT", "BED", "BEEF", "BEEN", "BEER", "BELL", "BELT", "BEND", "BENT", "BEST", "BETA", "BIAS", "BIB", "BID", "BIG", "BIKE", "BILD", "BILL", "BIND", "BIRD", "BITE", "BITS", "BLAB", "BLACK", "BLAH", "BLAME", "BLAND", "BLARE", "BLASE", "BLAST", "BLEB", "BLESS", "BLIP", "BLOB", "BLOC", "BLOG", "BLON", "BLOT", "BLOW", "BLUE", "BLUM", "BLUR", "BOAR", "BOAT", "BODE", "BOG", "BOGY", "BOLD", "BOLE", "BOMB", "BONA", "BOND", "BONE", "BONK", "BOOK", "BOOM", "BOON", "BOOR", "BOOT", "BORD", "BORE", "BORN", "BOSS", "BOTH", "BOWL", "BOWS", "BOX", "BOY", "BRAD", "BRAG", "BRAID", "BRAIN", "BRAKE", "BRAN", "BRASS", "BRAT", "BRAVE", "BRAWL", "BRAY", "BRED", "BREW", "BRIEF", "BRIM", "BRIN", "BRIN", "BRIT", "BROD", "BROG", "BROK", "BROM", "BRON", "BROO", "BROW", "BUCK", "BUD", "BUFF", "BULB", "BULK", "BULL", "BUMP", "BUN", "BUNG", "BUNK", "BUNT", "BURG", "BURN", "BURP", "BURR", "BUSH", "BUSY", "BUT", "BUTT", "BUYS", "BUZZ",
    "CAB", "CAGE", "CAKE", "CALL", "CALM", "CAM", "CAME", "CAMP", "CAN", "CANE", "CANS", "CAPE", "CAR", "CARD", "CARE", "CARP", "CARS", "CART", "CASE", "CASH", "CAST", "CAT", "CAVE", "CEIL", "CELL", "CENT", "CHAP", "CHAR", "CHAT", "CHEF", "CHIC", "CHIN", "CHIP", "CHIT", "CHOIR", "CHOM", "CHOP", "CHOW", "CHUM", "CHUR", "CITE", "CITY", "CLAD", "CLAG", "CLAM", "CLAN", "CLAP", "CLAW", "CLAY", "CLIP", "CLOG", "CLON", "CLOT", "CLOU", "CLOW", "CLUB", "CLUE", "COAL", "COAT", "COAX", "COB", "COCK", "COD", "CODE", "COOK", "COIL", "COIN", "COKE", "COLD", "COLT", "COME", "COMP", "CON", "CONE", "CONK", "COOL", "COOP", "COP", "COPE", "COPS", "CORD", "CORE", "CORN", "CORS", "COST", "COT", "COUP", "COVE", "COWL", "COZY", "CRAB", "CRAD", "CRAG", "CRAM", "CRAN", "CRAP", "CRAS", "CRAW", "CRAY", "CRED", "CREM", "CREP", "CREW", "CRIA", "CRIM", "CRIN", "CRIP", "CROC", "CROP", "CROW", "CRUD", "CRUM", "CRUP", "CRUX", "CUB", "CUBE", "CUFF", "CULL", "CUP", "CURB", "CURD", "CURE", "CURL", "CURT", "CUSH", "CUSP", "CUT", "CUTE", "CYCL",
    "DAB", "DAD", "DAFT", "DALE", "DAME", "DAMN", "DAMP", "DAN", "DAND", "DANE", "DANG", "DANK", "DARE", "DARK", "DART", "DASH", "DATE", "DAUB", "DAWN", "DAYS", "DAZE", "DEAD", "DEAF", "DEAL", "DEAN", "DEAR", "DEBT", "DECK", "DEED", "DEEM", "DEEP", "DEER", "DEFT", "DELL", "DENT", "DENY", "DEPT", "DESK", "DIAL", "DICE", "DIE", "DIET", "DIG", "DIME", "DIN", "DINE", "DING", "DINT", "DIP", "DIRT", "DISC", "DISH", "DISK", "DIVA", "DIVE", "DOCK", "DOE", "DOFF", "DOG", "DOLE", "DOLL", "DOLT", "DOME", "DON", "DONE", "DONG", "DONS", "DOOM", "DOOR", "DOPE", "DORM", "DORP", "DORY", "DOS", "DOSE", "DOT", "DOUR", "DOWN", "DOZE", "DRAB", "DRAG", "DRAM", "DRAW", "DREW", "DRIB", "DRIP", "DROP", "DRUB", "DRUG", "DRUM", "DRY", "DUAL", "DUCT", "DUEL", "DUET", "DUFF", "DUG", "DUKE", "DULL", "DUMB", "DUMP", "DUN", "DUNE", "DUNG", "DUNK", "DUST", "DUTY", "DWELL", "DYKE",
    "EACH", "EAR", "EARL", "EARN", "EASE", "EAST", "EASY", "EATS", "EDGE", "EDIT", "EEL", "EGG", "EGO", "ELSE", "EMIT", "END", "ENDS", "EVEN", "EVER", "EVIL", "EXAM", "EXIT", "EYES",
    "FACE", "FACT", "FADE", "FAIL", "FAIN", "FAIR", "FAKE", "FALL", "FAME", "FAN", "FANG", "FANS", "FARM", "FAST", "FAT", "FATE", "FAULT", "FAWN", "FEAR", "FEAT", "FEED", "FEEL", "FEET", "FELL", "FELT", "FEM", "FEND", "FERN", "FEST", "FETA", "FIB", "FICK", "FIDO", "FIEF", "FIFE", "FIG", "FIGHT", "FILE", "FILL", "FILM", "FIND", "FINE", "FING", "FINK", "FIRE", "FIRM", "FISH", "FIST", "FIT", "FIVE", "FIX", "FLAG", "FLAK", "FLAM", "FLAME", "FLAN", "FLAP", "FLAT", "FLAW", "FLEA", "FLEE", "FLED", "FLET", "FLEX", "FLIX", "FLIP", "FLIT", "FLOG", "FLOP", "FLOW", "FLUB", "FLUE", "FLUG", "FLUM", "FLUS", "FLUT", "FOB", "FOG", "FOIL", "FOLD", "FOLK", "FOND", "FONT", "FOOD", "FOOL", "FOOT", "FOR", "FORD", "FORE", "FORK", "FORM", "FORT", "FOSS", "FOUL", "FOUR", "FOWL", "FOX", "FOXY", "FRAG", "FRAM", "FRAT", "FRAY", "FREE", "FRET", "FRIG", "FROG", "FROM", "FRONT", "FROTH", "FROW", "FRUG", "FULL", "FUME", "FUN", "FUND", "FUNK", "FURL", "FURY", "FUSE", "FUSS", "FUZZ",
    "GAB", "GAD", "GAFF", "GAG", "GAIN", "GAIT", "GALE", "GALL", "GAME", "GANG", "GAP", "GAPE", "GAPS", "GARB", "GASH", "GASP", "GATE", "GAWK", "GAY", "GAZE", "GEAR", "GELD", "GELT", "GEM", "GENE", "GENT", "GERM", "GET", "GHOST", "GIBE", "GIFT", "GILD", "GILL", "GILT", "GIN", "GING", "GIRD", "GIRL", "GIST", "GIVE", "GLAD", "GLAM", "GLEAM", "GLEN", "GLIB", "GLID", "GLIM", "GLINT", "GLITCH", "GLOB", "GLOP", "GLOS", "GLOW", "GLUE", "GLUT", "GOAD", "GOAL", "GOAT", "GOD", "GOLD", "GOLF", "GONE", "GONG", "GOOD", "GOOF", "GOON", "GOOP", "GOOS", "GORE", "GORY", "GOSP", "GOTH", "GOUT", "GOV", "GOWN", "GRAB", "GRAD", "GRAM", "GRAN", "GRAP", "GRAS", "GRAT", "GRAV", "GRAY", "GREE", "GREG", "GREN", "GRET", "GREW", "GRID", "GRIF", "GRIM", "GRIN", "GRIP", "GROG", "GROK", "GROM", "GRON", "GROP", "GROW", "GRUB", "GRUG", "GRUM", "GULL", "GULP", "GUM", "GUN", "GUNK", "GURG", "GUSH", "GUTS", "GUY",
    "HACK", "HAIL", "HAIR", "HALE", "HALL", "HALT", "HAME", "HAND", "HANG", "HANK", "HARD", "HARE", "HARK", "HARM", "HARP", "HASH", "HASP", "HASS", "HAST", "HAT", "HATE", "HATS", "HAUL", "HAVE", "HAWK", "HAY", "HEAD", "HEAL", "HEAP", "HEAR", "HEAT", "HECK", "HEED", "HEEL", "HEFT", "HELD", "HELL", "HELM", "HELP", "HEMP", "HEN", "HERD", "HERE", "HERO", "HERS", "HEX", "HIKE", "HILL", "HILT", "HIM", "HIND", "HINT", "HIP", "HIRE", "HIS", "HISS", "HIT", "HIVE", "HOAR", "HOB", "HOCK", "HOG", "HOLD", "HOLE", "HOLL", "HOLM", "HOLT", "HOME", "HONE", "HONS", "HOOD", "HOOK", "HOOT", "HOPE", "HORN", "HORS", "HOSP", "HOST", "HOT", "HOUR", "HOVE", "HOW", "HOWL", "HUB", "HUE", "HUFF", "HUG", "HULA", "HULL", "HUM", "HUMP", "HUNK", "HUNT", "HURL", "HURT", "HUSH", "HUT", "HYMN", "HYPO",
    "ICE", "IDEA", "IDLE", "IDOL", "IF", "ILL", "IMP", "IN", "INCH", "INFO", "INK", "INN", "INTO", "ION", "IONS", "IRE", "IRON", "IS", "ISH", "ISLE", "ITCH", "ITEM", "ITS", "IVY",
    "JAB", "JACK", "JAG", "JAIL", "JAM", "JAMS", "JAR", "JAW", "JAZZ", "JEAN", "JEER", "JELL", "JESU", "JET", "JIB", "JILT", "JIM", "JING", "JINX", "JOB", "JOCK", "JOEY", "JOG", "JOIN", "JOINT", "JOKE", "JOLT", "JOSH", "JOT", "JOWL", "JOY", "JUAN", "JUDO", "JUG", "JUMP", "JUNK", "JUST", "JUTE",
    "KEEL", "KEEN", "KEEP", "KELP", "KEN", "KENT", "KEPT", "KERN", "KEY", "KICK", "KID", "KILL", "KILO", "KILT", "KIN", "KIND", "KING", "KINK", "KINO", "KIP", "KIPS", "KISS", "KIT", "KITE", "KITS", "KNAP", "KNEE", "KNEW", "KNIT", "KNOB", "KNOC", "KNOW", "KNUB", "KNOX", "KOLA", "KONG", "KOOK", "KUDO", "KUDU", "KURL",
    "LAB", "LACE", "LACK", "LAD", "LADE", "LAG", "LAID", "LAIN", "LAIR", "LAKE", "LAMA", "LAMB", "LAME", "LAMP", "LAND", "LANE", "LANG", "LANK", "LARD", "LARGE", "LASH", "LAST", "LATE", "LATH", "LAVA", "LAVE", "LAW", "LAWN", "LAWS", "LAZY", "LEAD", "LEAF", "LEAK", "LEAN", "LEAP", "LEAR", "LEASE", "LEAST", "LEAVE", "LED", "LEE", "LEFT", "LEG", "LEND", "LENS", "LENT", "LESS", "LET", "LETS", "LEVY", "LIAR", "LICE", "LICK", "LID", "LIE", "LIEN", "LIFE", "LIFT", "LIKE", "LILL", "LILT", "LIME", "LIMP", "LINE", "LINK", "LINT", "LION", "LIRA", "LIRE", "LIST", "LIVE", "LOAD", "LOAF", "LOAM", "LOAN", "LOAT", "LOB", "LOBE", "LOCA", "LOCK", "LOCO", "LOD", "LODE", "LOFT", "LOG", "LOGO", "LOIN", "LOLL", "LONG", "LOOK", "LOOM", "LOON", "LOOP", "LOOS", "LOOT", "LOPE", "LORD", "LORE", "LOSE", "LOSS", "LOST", "LOT", "LOUD", "LOVE", "LOWS", "LUBE", "LUCK", "LUDO", "LUGE", "LUG", "LULL", "LUMP", "LUN", "LUNG", "LURE", "LURK", "LUSH", "LUST", "LUT", "LUXE", "LYNX", "LYRE",
    "MAAM", "MACE", "MACH", "MAD", "MADE", "MAGE", "MAGN", "MAID", "MAIL", "MAIN", "MAKE", "MALE", "MALI", "MALL", "MALT", "MAM", "MAN", "MANE", "MANY", "MAP", "MAR", "MARC", "MARE", "MARK", "MARL", "MARS", "MART", "MASH", "MASK", "MASS", "MAST", "MAT", "MATE", "MATH", "MAUL", "MAY", "MAYB", "MAZE", "MEAD", "MEAL", "MEAN", "MEAT", "MEET", "MELT", "MEMO", "MEN", "MEND", "MENT", "MENU", "MER", "MERE", "MESH", "MESS", "MET", "METAL", "METE", "MEW", "MICE", "MID", "MIKE", "MILD", "MILE", "MILK", "MILL", "MIM", "MIME", "MIMP", "MIN", "MIND", "MINE", "MING", "MINK", "MINT", "MINX", "MIRA", "MIRE", "MIRK", "MIRR", "MIST", "MIT", "MITE", "MIX", "MOAN", "MOAT", "MOCK", "MODE", "MOG", "MOLD", "MOLE", "MOLL", "MOLT", "MOM", "MOMS", "MONK", "MONO", "MOOD", "MOON", "MOOR", "MOOS", "MOOT", "MOP", "MOPE", "MOR", "MORE", "MORN", "MORT", "MOSS", "MOST", "MOTH", "MOVE", "MOW", "MUCH", "MUCK", "MUFF", "MUG", "MULL", "MUMP", "MUMY", "MUNI", "MURAL", "MUS", "MUSE", "MUST", "MUTT", "MUZZ", "MYRR", "MYTH",
    "NAB", "NAG", "NAIL", "NAME", "NAN", "NAP", "NAPE", "NAPS", "NASH", "NAST", "NAT", "NAVE", "NAVY", "NEAR", "NEAT", "NECK", "NEED", "NEEM", "NEIL", "NELL", "NEON", "NEP", "NERD", "NEST", "NET", "NEW", "NEWS", "NEXT", "NICE", "NICK", "NIGH", "NIL", "NIM", "NIMB", "NIML", "NINE", "NIP", "NIPS", "NIT", "NITS", "NOB", "NODE", "NOEL", "NOG", "NOIL", "NOIS", "NOM", "NONE", "NOOK", "NOON", "NOR", "NORM", "NOSE", "NOT", "NOTE", "NOUT", "NOV", "NOW", "NUDE", "NUG", "NULL", "NUMB", "NUN", "NUNC", "NURT", "NUT",
    "OAF", "OAK", "OAR", "OATH", "OBEY", "ODD", "ODE", "OF", "OFF", "OH", "OIL", "OK", "OLD", "ON", "ONCE", "ONE", "ONES", "ONLY", "ONTO", "OOH", "OOL", "OOM", "OON", "OOP", "OOPS", "OOR", "OOS", "OOT", "OOZE", "OPEN", "OPT", "OR", "ORAL", "ORE", "ORIG", "ORT", "OS", "OTHER", "OUCH", "OUR", "OUT", "OVAL", "OVEN", "OVER", "OWED", "OWEN", "OWN", "OXEN", "OXY",
    "PACE", "PACK", "PAD", "PAGE", "PAID", "PAIL", "PAIN", "PAIR", "PAL", "PALE", "PALM", "PAN", "PANE", "PANS", "PANT", "PAR", "PARA", "PARD", "PARE", "PARK", "PART", "PASS", "PAST", "PAT", "PATH", "PATS", "PAVE", "PAWN", "PAY", "PEAK", "PEAL", "PEAN", "PEAR", "PEAT", "PECK", "PEEK", "PEEL", "PEEP", "PEER", "PEG", "PELL", "PEN", "PEND", "PENN", "PENS", "PENT", "PER", "PERT", "PEST", "PET", "PHEW", "PIAN", "PICK", "PIED", "PIER", "PIG", "PILE", "PILL", "PIN", "PINE", "PING", "PINK", "PINT", "PION", "PIP", "PIPE", "PIPS", "PIRN", "PISS", "PIT", "PITH", "PITS", "PITY", "PLAN", "PLAY", "PLEA", "PLEB", "PLED", "PLEN", "PLEW", "PLIE", "PLOD", "PLON", "PLOT", "PLOW", "PLOY", "PLUG", "PLUM", "PLUS", "POCK", "POD", "POEM", "POET", "POGO", "POIL", "POIN", "POKE", "POL", "POLE", "POLL", "POMP", "POND", "PONE", "PONS", "PONY", "POO", "POOH", "POOL", "POOP", "POOR", "POP", "POPS", "PORE", "PORK", "PORT", "POSE", "POSH", "POST", "POT", "POUR", "POUT", "POWL", "POWS", "PRAY", "PREP", "PREY", "PRIG", "PRIM", "PRIN", "PRIS", "PRIV", "PRO", "PROB", "PROM", "PROP", "PROW", "PUCK", "PUFF", "PULL", "PULP", "PULS", "PUMP", "PUN", "PUNK", "PUNT", "PURE", "PURL", "PURP", "PURR", "PUSH", "PUT", "PUTT", "PUZZ",
    "QUAD", "QUAI", "QUAY", "QUE", "QUER", "QUI", "QUID", "QUIP", "QUIT", "QUIZ",
    "RACE", "RACK", "ROAD", "RADE", "RAGE", "RAGS", "RAID", "RAIL", "RAIN", "RAIS", "RAKE", "RAM", "RAMP", "RAN", "RANC", "RAND", "RANG", "RANK", "RANT", "RAP", "RAPS", "RARE", "RASH", "RATE", "RATS", "RAVE", "RAW", "RAZE", "READ", "REAL", "REAM", "REAP", "REAR", "REB", "RED", "REED", "REEF", "REEL", "REFS", "REFT", "REIN", "RELY", "REM", "REND", "RENE", "RENT", "REP", "REST", "RET", "REV", "REVS", "REW", "RHEA", "RHYM", "RIBS", "RICE", "RICH", "RICK", "RID", "RIDE", "RIFE", "RIFT", "RIG", "RILL", "RIM", "RIND", "RING", "RINK", "RIOT", "RIP", "RIPE", "RIPS", "RISE", "RISK", "RITE", "ROAM", "ROAR", "ROBE", "ROB", "ROCK", "ROD", "RODE", "ROG", "ROIL", "ROLE", "ROLL", "ROMA", "ROME", "ROMP", "RONE", "ROOF", "ROOK", "ROOM", "ROOT", "ROPE", "ROPY", "ROSE", "ROSY", "ROT", "ROTE", "ROUG", "ROUP", "ROUT", "ROW", "RUB", "RUBE", "RUBY", "RUCK", "RUDD", "RUDE", "RUFF", "RUG", "RUIN", "RULE", "RUM", "RUMP", "RUN", "RUNG", "RUNS", "RUNT", "RUR", "RUSH", "RUSK", "RUST", "RUT",
    "SACK", "SAD", "SAFE", "SAGA", "SAGE", "SAID", "SAIL", "SAIN", "SAINT", "SAKE", "SALE", "SALI", "SALT", "SAME", "SAND", "SANE", "SANG", "SANK", "SASH", "SAT", "SATE", "SAVE", "SAW", "SAWS", "SAX", "SAY", "SCAB", "SCAD", "SCAG", "SCAL", "SCAM", "SCAN", "SCAR", "SCAT", "SCOP", "SCOR", "SCOT", "SCOW", "SCRAG", "SCRAM", "SCRAP", "SCRAT", "SCREW", "SCROD", "SCUM", "SEA", "SEAL", "SEAM", "SEAN", "SEAR", "SEAT", "SEC", "SECT", "SEE", "SEED", "SEEK", "SEEM", "SEEN", "SEEP", "SEER", "SELL", "SEND", "SENS", "SENT", "SEPT", "SET", "SETS", "SEW", "SEX", "SHAD", "SHAG", "SHAK", "SHAL", "SHAM", "SHAN", "SHAP", "SHAR", "SHOT", "SHOW", "SHUT", "SICK", "SIDE", "SIFT", "SIGH", "SIGN", "SILK", "SILL", "SIM", "SIMP", "SIN", "SING", "SINK", "SINS", "SIP", "SIPS", "SIR", "SIRE", "SIRS", "SITE", "SIT", "SIX", "SIZE", "SKAG", "SKAL", "SKAT", "SKEE", "SKET", "SKEW", "SKID", "SKIM", "SKIN", "SKIP", "SKIT", "SKUL", "SLAB", "SLAD", "SLAM", "SLAT", "SLAW", "SLAY", "SLED", "SLEEK", "SLEET", "SLEW", "SLID", "SLIM", "SLING", "SLIP", "SLIT", "SLOB", "SLOG", "SLOP", "SLOT", "SLOW", "SLUG", "SLUM", "SLUM", "SLUR", "SLUT", "SMAL", "SMIT", "SNAG", "SNAP", "SNAR", "SNAT", "SNEAK", "SNIP", "SNIT", "SNOB", "SNOT", "SNOW", "SNUB", "SNUG", "SOAK", "SOAP", "SOAR", "SOCK", "SOD", "SODA", "SOFA", "SOIL", "SOLA", "SOLD", "SOLE", "SOLO", "SOLV", "SOME", "SON", "SONG", "SONS", "SOON", "SOP", "SOPS", "SORE", "SORT", "SOU", "SOUL", "SOUP", "SOUR", "SOW", "SPAC", "SPAD", "SPAG", "SPAN", "SPAR", "SPAS", "SPAT", "SPAW", "SPEC", "SPED", "SPIN", "SPIT", "SPOT", "SPRY", "SPUD", "SPUR", "SQUA", "STAB", "STAG", "STAL", "STAR", "STAT", "STAY", "STEM", "STEP", "STEW", "STIC", "STIM", "STIR", "STOB", "STOP", "STOW", "STUD", "STUM", "STUN", "STUP", "SUCH", "SUCK", "SUD", "SUE", "SUET", "SUM", "SUMP", "SUN", "SUNG", "SUNK", "SUP", "SURE", "SURF", "SWAB", "SWAG", "SWAM", "SWAN", "SWAP", "SWAT", "SWAY", "SWEL", "SWIM", "SWIN", "SWIP", "SWOB", "SWOP", "SWOT",
    "TAB", "TACK", "TACT", "TAIL", "TAKE", "TALC", "TALE", "TALK", "TALL", "TAME", "TAMP", "TAN", "TANG", "TANK", "TAPE", "TAR", "TARD", "TARE", "TARN", "TARP", "TART", "TASK", "TAST", "TATE", "TAUT", "TAX", "TAXA", "TEAL", "TEAM", "TEAR", "TEAS", "TEAT", "TED", "TEEM", "TEEN", "TELL", "TEMP", "TEN", "TEND", "TENS", "TENT", "TERM", "TEST", "TEXT", "THAN", "THAT", "THE", "THEM", "THEN", "THEN", "THIS", "THIN", "THIO", "THIR", "THUS", "TICK", "TIDE", "TIE", "TIED", "TIER", "TIES", "TIG", "TIGHT", "TILE", "TILL", "TILT", "TIME", "TIMP", "TIN", "TINE", "TING", "TINK", "TINT", "TINY", "TIP", "TIPS", "TIRE", "TIRL", "TOAD", "TOE", "TOIL", "TOLD", "TOLE", "TOM", "TOME", "TON", "TONE", "TONG", "TONS", "TOOK", "TOOL", "TOOM", "TOON", "TOOT", "TOP", "TOPE", "TOPS", "TOR", "TORE", "TORN", "TORT", "TORY", "TOSS", "TOT", "TOTE", "TOUR", "TOUT", "TOW", "TOWN", "TOWS", "TOY", "TRAC", "TRAD", "TRAIL", "TRAM", "TRAP", "TRAS", "TRAW", "TRAY", "TRED", "TREE", "TREK", "TRES", "TREW", "TRIB", "TRIM", "TRIN", "TRIP", "TROC", "TROD", "TROP", "TROT", "TROW", "TRUE", "TUG", "TULP", "TUMP", "TUNA", "TUNE", "TUNG", "TURF", "TURN", "TUSK", "TUSS", "TUTU", "TWIN", "TWIRL", "TWIS", "TWIT", "TYPE", "TYPO", "TYR",
    "UGH", "UKES", "ULNA", "ULTRA", "UNCE", "UNCI", "UNCLE", "UNDO", "UNIT", "UNS", "UNT", "UP", "UPON", "UPS", "URGE", "URN", "US", "USE", "USED", "USER", "USES", "UTAH", "UTIL",
    "VACU", "VAGA", "VAIL", "VALE", "VAMP", "VAN", "VANE", "VANS", "VANT", "VAPE", "VARY", "VAST", "VEAL", "VEER", "VEIL", "VEIN", "VELA", "VELD", "VENT", "VERT", "VERY", "VETO", "VEX", "VIA", "VICE", "VICK", "VIDE", "VIES", "VIEW", "VIG", "VILL", "VIM", "VIN", "VINE", "VINO", "VINS", "VIP", "VIRE", "VIRT", "VISA", "VISE", "VITA", "VITE", "VIVA", "FIVE", "VOC", "VOID", "VOIL", "VOL", "VOLT", "VOM", "VOTE", "VOW", "VUGS", "VUZZ",
    "WACK", "WADE", "WADS", "WAGE", "WAGS", "WAIL", "WAIN", "WAIT", "WAKE", "WALK", "WALL", "WALT", "WAN", "WAND", "WANE", "WANG", "WANT", "WAR", "WARD", "WARE", "WARM", "WARN", "WARP", "WARS", "WART", "WASH", "WASP", "WAST", "WAT", "WATCH", "WAVE", "WAVY", "WAX", "WAY", "WAYS", "WEAK", "WEAL", "WEAN", "WEAR", "WEAVE", "WED", "WEE", "WEED", "WEEK", "WEEL", "WEEN", "WEET", "WEFT", "WEIG", "WEIR", "WELD", "WELL", "WEND", "WENT", "WERE", "WERT", "WEST", "WET", "WHAM", "WHAP", "WHAT", "WHEN", "WHEW", "WHEY", "WHIG", "WHIM", "WHIP", "WHIR", "WHIT", "WHO", "WHOA", "WHOM", "WHOP", "WHOR", "WHY", "WICK", "WIDE", "WIDG", "WIFE", "WIG", "WILD", "WILL", "WILT", "WIN", "WINC", "WIND", "WINE", "WING", "WINK", "WINS", "WINT", "WIPE", "WIRE", "WIRY", "WIS", "WISE", "WISH", "WISP", "WIT", "WITH", "WITS", "WIZ", "WOE", "WOLF", "WOM", "WOMB", "WON", "WOND", "WONG", "WONK", "WOO", "WOOD", "WOOF", "WOOL", "WOON", "WOOP", "WOOS", "WOOT", "WORD", "WORE", "WORK", "WORM", "WORN", "WORP", "WORS", "WORT", "WOVE", "WOW", "WRAP", "WREN", "WRIE", "WRIO", "WRIT", "WROK", "WROW", "WRY", "WYND",
    "XRAY",
    "YACH", "YACK", "YAGI", "YAK", "YALE", "YAMS", "YANK", "YAP", "YAPS", "YARD", "YARN", "YAW", "YAWL", "YAWN", "YAWP", "YEAR", "YEAS", "YELL", "YEN", "YENS", "YEP", "YET", "YETI", "YIELD", "YELL", "YIP", "YIPS", "YOB", "YOD", "YOGI", "YOLK", "YOMP", "YON", "YORK", "YOU", "YOUR", "YOW", "YUAN", "YURT", "YUTZ",
    "ZAP", "ZEAL", "ZEB", "ZEN", "ZINC", "ZING", "ZIP", "ZIPS", "ZIT", "ZITS", "ZIZZ", "ZONE", "ZONK", "ZOO", "ZOOM", "ZOUK", "ZULU"
].map(word => word.toUpperCase());

// --- 4. Basic Word Validation Functions ---
/**
 * Checks if a word exists in our predefined dictionary.
 * @param {string} word The word to check.
 * @returns {boolean} True if the word is valid, false otherwise.
 */
function isValidWord(word) {
    return dictionary.includes(word.toUpperCase());
}

/**
 * Checks if a 'nextWord' is a valid Word Morph step from 'currentWord'.
 * - Must be the same length.
 * - Must differ by exactly one letter.
 * - The changed letter must be in the same position.
 * @param {string} currentWord The word currently at the end of the chain.
 * @param {string} nextWord The word the player is trying to add.
 * @returns {boolean} True if it's a valid morph step, false otherwise.
 */
function isValidMorphStep(currentWord, nextWord) {
    if (currentWord.length !== nextWord.length) {
        return false; // Words must be the same length
    }

    let diffCount = 0;
    for (let i = 0; i < currentWord.length; i++) {
        if (currentWord[i] !== nextWord[i]) {
            diffCount++;
        }
    }
    // Must differ by exactly one letter
    return diffCount === 1;
}

// --- 5. Game Initialization & Start ---
/**
 * Initializes or resets the game state and UI for a new puzzle.
 * This is the main function that sets up a new game round.
 */
async function initializeGame() {
    console.log("initializeGame() function started!");

    // --- Load Today's Puzzle from Firebase --- (NEW CODE STARTS HERE)
    // The current date in YYYY-MM-DD format to match Firebase Document ID
    const today = new Date();
    const todayString = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

    try {
        // Use `window.firestoreDb` and `window.appId` which are global from index.html
        const dailyPuzzlesRef = collection(window.firestoreDb, `dailyPuzzles`);
        // Query for the document matching today's date (document ID is the date string)
        const q = query(dailyPuzzlesRef, where("__name__", "==", todayString));
        const querySnapshot = await getDocs(q); // Await the asynchronous fetch

        if (!querySnapshot.empty) {
            const puzzleData = querySnapshot.docs[0].data(); // Get the data from the first (and only) doc
            currentSeedWord = puzzleData.start_word;
            currentTargetWord = puzzleData.target_word;
            currentDifficulty = puzzleData.difficulty;
            optimalPathLength = puzzleData.optimal_path_length;
            window.currentOptimalPath = puzzleData.optimal_path; // Store the full optimal path
            console.log(`Successfully loaded puzzle for ${todayString}: ${currentSeedWord} to ${currentTargetWord}`);
        } else {
            console.warn(`No puzzle found for ${todayString}. Using default puzzle.`);
            // Fallback to a default puzzle if none found for today's date
            currentSeedWord = "READ";
            currentTargetWord = "ROSE";
            currentDifficulty = "Medium";
            optimalPathLength = 3; // Optimal for READ-ROSE
            window.currentOptimalPath = ['READ', 'HEAD', 'HELD', 'HOLD', 'HOLE', 'ROLE', 'ROSE']; // Default optimal path
            window.showMessage(`No puzzle for ${todayString}. Using default READ to ROSE.`, 5000);
        }
    } catch (e) {
        console.error("Error loading daily puzzle from Firebase: ", e);
        window.showMessage("Error loading daily puzzle. Using default.", 5000);
        // Fallback to a default puzzle on error
        currentSeedWord = "READ";
        currentTargetWord = "ROSE";
        currentDifficulty = "Medium";
        optimalPathLength = 3;
    }
    // --- End Load Today's Puzzle from Firebase --- (NEW CODE ENDS HERE)

    // --- Reset Game State for a New Round (REMAINING ORIGINAL CODE) ---
    // Make sure optimalPathLength and currentSeedWord are set by the above block *before* this runs
    currentChain = [currentSeedWord]; // Start chain with the seed word
    currentScore = 0; // Reset score
    gameTimer = 0; // Reset timer
    clearInterval(timerInterval); // Clear any old timer
    gameInProgress = true; // Set game active

    // Reset power-up counts and track used ones for a new game
    powerUpCounts = { // Reset AVAILABLE power-ups
        hint: 0,
        swap: 0,
        skip: 0
    };
    powerUpsUsedThisGame = { // Reset *USED* power-ups
        hint: 0,
        swap: 0,
        skip: 0
    };

    // Give player initial hint for the day (or based on daily allowance)
    powerUpCounts.hint = 1; // Give 1 hint to start

    // --- Update UI Elements ---
    seedWordDisplay.textContent = currentSeedWord;
    targetWordDisplay.textContent = currentTargetWord;
    difficultyDisplay.textContent = currentDifficulty;
    userGuessInput.value = ''; // Clear input field
    userGuessInput.disabled = false; // Enable input
    submitGuessBtn.disabled = false; // Enable submit button

    renderWordChain(); // Display the seed word
    updateScoreDisplay();
    updatePowerUpDisplays(); // Update power-up button states

    // Start the game timer
    startTimer();

    // Show initial puzzle message (will use loaded words)
    window.showMessage(`Today's puzzle: ${currentSeedWord} to ${currentTargetWord}!`, 5000);
    // loadLeaderboard is called by the main DOMContentLoaded trigger after full Firebase init
    // (This line was previously `loadLeaderboard();` but should be commented/removed here as it's called globally)
}

// --- 6. Core Game Loop Functions ---

/**
 * Handles a player's guess submitted via input or button click.
 */
function processGuess() {
    if (!gameInProgress) { // Prevent input if game is not active
        window.showMessage("Game not in progress. Refresh for a new puzzle.", 5000);
        return;
    }

    const guess = userGuessInput.value.trim().toUpperCase();
    userGuessInput.value = ''; // Clear input field immediately

    if (guess.length === 0) {
        window.showMessage("Please enter a word.", 5000);
        return;
    }

    const lastWordInChain = currentChain[currentChain.length - 1];

    if (!isValidWord(guess)) {
        window.showMessage(`'${guess}' is not a valid word.`, 5000);
        return;
    }

    if (!isValidMorphStep(lastWordInChain, guess)) {
        window.showMessage(`'${guess}' is not a valid morph from '${lastWordInChain}'. One letter, same position!`, 5000);
        return;
    }

    // If all checks pass, add to chain
    currentChain.push(guess);
    renderWordChain();

    // Check for win condition
    if (guess === currentTargetWord) {
        endGame(true); // Player won!
    }
}

/**
 * Renders the current word chain to the HTML list.
 */
function renderWordChain() {
    wordChainList.innerHTML = ''; // Clear existing list
    currentChain.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        listItem.className = 'py-1 text-gray-800 text-2xl md:text-3xl font-bold'; // Tailwind classes for styling
        wordChainList.appendChild(listItem);
    });
    // Scroll to the bottom of the list for long chains
    wordChainList.scrollTop = wordChainList.scrollHeight;
}

/**
 * Updates the score display in the UI.
 */
function updateScoreDisplay() {
    currentScoreDisplay.textContent = currentScore;
}

/**
 * Updates the power-up count displays and button enabled states.
 */
function updatePowerUpDisplays() {
    hintCountDisplay.textContent = powerUpCounts.hint;
    swapCountDisplay.textContent = powerUpCounts.swap;
    skipCountDisplay.textContent = powerUpCounts.skip;

    hintBtn.disabled = powerUpCounts.hint <= 0;
    swapBtn.disabled = powerUpCounts.swap <= 0;
    skipBtn.disabled = powerUpCounts.skip <= 0;

    hintBtn.classList.toggle('opacity-50', powerUpCounts.hint <= 0);
    hintBtn.classList.toggle('cursor-not-allowed', powerUpCounts.hint <= 0);
    swapBtn.classList.toggle('opacity-50', powerUpCounts.swap <= 0);
    swapBtn.classList.toggle('cursor-not-allowed', powerUpCounts.swap <= 0);
    skipBtn.classList.toggle('opacity-50', powerUpCounts.skip <= 0);
    skipBtn.classList.toggle('cursor-not-allowed', powerUpCounts.skip <= 0);
}

/**
 * Starts the game timer.
 */
function startTimer() {
    gameTimer = 0; // Reset timer to 0 seconds
    timerDisplay.textContent = `0:00`; // Ensure display is reset
    timerInterval = setInterval(() => {
        gameTimer++;
        const minutes = Math.floor(gameTimer / 60);
        const seconds = gameTimer % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        // Basic time limit for testing (e.g., 3 minutes)
        if (gameTimer >= 180 && gameInProgress) { // 3 minutes = 180 seconds
            endGame(false); // Game over due to time
        }
    }, 1000); // Update every second
}

/**
 * Ends the game and calculates the final score.
 * @param {boolean} won True if the player reached the target word.
 */
function endGame(won) {
    if (!gameInProgress) return; // Prevent multiple calls
    gameInProgress = false; // Set game inactive

    clearInterval(timerInterval); // Stop the timer
    userGuessInput.disabled = true; // Disable input
    submitGuessBtn.disabled = true; // Disable submit button
    hintBtn.disabled = true; // Disable power-up buttons
    swapBtn.disabled = true;
    skipBtn.disabled = true;

    // Calculate final score using the dedicated function
    currentScore = calculateFinalScore(won, currentChain.length, gameTimer, powerUpsUsedThisGame, optimalPathLength);
    updateScoreDisplay(); // Update UI with final score

    window.showMessage(won ? `Congratulations! You morphed '${currentSeedWord}' to '${currentTargetWord}'! Final Score: ${currentScore}` : `Time's up! Game over. Final Score: ${currentScore}`, 5000);
    console.log("Game ended. Player chain:", currentChain);
    console.log("Time taken:", gameTimer, "seconds.");
    console.log("Final Calculated Score (after endGame):", currentScore);

    // Call saveScore function if the player won
    if (window.firestoreDb && window.currentUserId && won) {
        saveScore(window.currentUserId, {
            score: currentScore,
            chain: currentChain,
            time: gameTimer,
            puzzleId: `${currentSeedWord}-${currentTargetWord}-${optimalPathLength}`, // Unique ID for today's puzzle variant
            date: new Date().toISOString(), // Standard date format for sorting
            difficulty: currentDifficulty // Save difficulty too
        });
        window.showMessage("Score saved and leaderboard updated!", 5000); // Confirm saving
    }
}

/**
 * Saves a player's score to Firestore.
 * @param {string} userId The current authenticated user's ID.
 * @param {object} scoreData The data object containing the score, chain, time, etc.
 */
async function saveScore(userId, scoreData) {
    try {
        // window.appId and window.firestoreDb are made global by the index.html script block
        // window.appId defaults to `default-app-id` if not running in Canvas environment (fine for local testing)
        const scoresCollection = collection(window.firestoreDb, `artifacts/${window.appId}/public/data/wordMorphScores`);

        await addDoc(scoresCollection, {
            userId: userId,
            score: scoreData.score,
            chain: scoreData.chain,
            time: scoreData.time,
            puzzleId: scoreData.puzzleId,
            date: scoreData.date,
            difficulty: scoreData.difficulty,
            submissionId: crypto.randomUUID(), // Unique ID for this specific submission
            timestamp: new Date() // Firestore timestamp for server-side accuracy
        });
        console.log("Score successfully written to Firestore!");
        const minutes = Math.floor(gameTimer / 60);
        const seconds = gameTimer % 60;
        window.showMessage(`Score ${currentScore} (Time: ${minutes}:${String(seconds).padStart(2, '0')}) saved and leaderboard updated!`, 5000);
        loadLeaderboard(); // Reload leaderboard to display the updated scores

    } catch (e) {
        console.error("Error adding document to Firestore: ", e);
        window.showMessage("Error saving score.", 3000);
    }
}

/**
 * Loads and displays the top scores for the current puzzle from Firestore.
 */
/**
 * Loads and displays the top scores for the current puzzle from Firestore.
 * This function uses the global `window.firestoreDb` and `window.appId`
 * which are set by the Firebase script in `index.html`.
 */
async function loadLeaderboard() {
    if (!leaderboardList) { // Defensive check: ensure HTML element exists
        console.error("Leaderboard HTML element not found.");
        return;
    }
    leaderboardList.innerHTML = '<li class="text-gray-600 italic text-center py-2">Loading scores...</li>'; // Show loading message

    try {
        // We trust the main DOMContentLoaded interval to ensure window.firestoreDb and window.appId are set.
        // No need for a redundant internal check here, as it was causing timing issues.
        const scoresCollectionRef = collection(window.firestoreDb, `artifacts/${window.appId}/public/data/wordMorphScores`);

        // Filter by current puzzleId
        const q = query(
            scoresCollectionRef,
            where("puzzleId", "==", `${currentSeedWord}-${currentTargetWord}-${optimalPathLength}`)
        );

        const querySnapshot = await getDocs(q);
        let scores = [];
        querySnapshot.forEach((doc) => {
            scores.push(doc.data());
        });

        // Sort scores in JavaScript (Score: descending, then Time: ascending)
        scores.sort((a, b) => {
            if (a.score === b.score) {
                return a.time - b.time; // Shorter time is better for same score
            }
            return b.score - a.score; // Higher score is better
        });

        leaderboardList.innerHTML = ''; // Clear previous leaderboard content
        if (scores.length === 0) {
            const listItem = document.createElement('li');
            listItem.className = 'text-gray-600 italic text-center py-2';
            listItem.textContent = 'No scores yet for this puzzle. Be the first!';
            leaderboardList.appendChild(listItem);
        } else {
            scores.slice(0, 10).forEach((scoreData, index) => { // Display top 10 scores
                const listItem = document.createElement('li');
                listItem.className = 'flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0 px-2';

                // Shorten userId for display
                let displayUserId = scoreData.userId;
                if (scoreData.userId && scoreData.userId.length > 8) {
                    displayUserId = scoreData.userId.substring(0, 8) + '...';
                } else if (!scoreData.userId) { // Fallback for undefined userId
                    displayUserId = 'Anonymous';
                }

                // Highlight current user's score
                let displayName = displayUserId;
                if (window.currentUserId && scoreData.userId === window.currentUserId) {
                    displayName = "You (" + displayUserId + ")";
                    listItem.className += ' font-bold text-blue-700'; // Make current user's score bold/blue
                }

                const minutes = Math.floor(scoreData.time / 60);
                const seconds = scoreData.time % 60;
                const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                listItem.innerHTML = `
                    <span class="w-1/4">${index + 1}.</span>
                    <span class="w-1/2">${displayName}</span>
                    <span class="w-1/4 text-right">${scoreData.score}</span>
                    <span class="w-1/4 text-right">${timeFormatted}</span>
                `;
                leaderboardList.appendChild(listItem);
            });
        }

    } catch (e) {
        console.error("Error loading leaderboard: ", e);
        leaderboardList.innerHTML = '<li class="text-red-500 text-center py-2">Error loading scores. Please check console for Firebase security rules or connection issues.</li>';
    }
}

// --- 5.5. Score Calculation Function ---
/**
 * Calculates the player's final score based on game rules.
 * @param {boolean} won True if the player reached the target word.
 * @param {number} chainLength The number of words in the player's chain (including seed).
 * @param {number} timeTaken The time taken in seconds.
 * @param {object} powerUpsUsed Counts of each power-up type used.
 * @param {number} optimalLength The pre-determined optimal path length for the puzzle (transitions).
 * @returns {number} The calculated final score.
 */
function calculateFinalScore(won, chainLength, timeTaken, powerUpsUsed, optimalLength) {
    console.log("--- Calculating Final Score ---");
    console.log("Input: won =", won, ", chainLength =", chainLength, ", timeTaken =", timeTaken, ", powerUpsUsed =", powerUpsUsed, ", optimalLength =", optimalLength);

    let score = 0;
    const playerTransitions = chainLength - 1; // Number of steps player took

    // 1. Completion Bonus (3 points)
    if (won) {
        score += 3;
        console.log("Score Component: Completion Bonus (+3)");
    } else {
        console.log("Score Component: Completion Bonus (+0) - Did not win.");
    }

    // 2. Efficiency Bonus (4 points)
    // Target Number of transitions = Optimal Path Length + 1
    const targetForEfficiency = optimalLength + 1;

    if (won) { // Only award efficiency if game was won
        console.log("Efficiency Check: Player transitions =", playerTransitions, ", Optimal Length =", optimalLength, ", Target for Efficiency =", targetForEfficiency);
        if (playerTransitions <= optimalLength) { // Beats the Target Number (found Optimal Path)
            score += 4;
            console.log("Score Component: Efficiency Bonus (+4) - Beat Target");
        } else if (playerTransitions === targetForEfficiency) { // Meets the Target Number
            score += 3;
            console.log("Score Component: Efficiency Bonus (+3) - Met Target");
        } else if (playerTransitions === targetForEfficiency + 1) { // One step longer
            score += 2;
            console.log("Score Component: Efficiency Bonus (+2) - One step longer");
        } else if (playerTransitions === targetForEfficiency + 2) { // Two steps longer
            score += 1;
            console.log("Score Component: Efficiency Bonus (+1) - Two steps longer");
        } else { // Three or more steps longer
            score += 0;
            console.log("Score Component: Efficiency Bonus (+0) - Three or more steps longer");
        }
    } else {
        console.log("Score Component: Efficiency Bonus (+0) - Game not won.");
    }

    // 3. Power-Up Usage (2 points)
    // Now correctly uses the powerUpsUsedThisGame object
    const totalPowerUpsUsed = powerUpsUsed.hint + powerUpsUsed.swap + powerUpsUsed.skip;
    console.log("Power-Up Check: Hint Used =", powerUpsUsed.hint, ", Swap Used =", powerUpsUsed.swap, ", Skip Used =", powerUpsUsed.skip, ", Total Used =", totalPowerUpsUsed);
    if (totalPowerUpsUsed === 0) {
        score += 2;
        console.log("Score Component: Power-Up Usage (+2)");
    } else if (totalPowerUpsUsed === 1) {
        score += 1;
        console.log("Score Component: Power-Up Usage (+1)");
    } else { // 2 or more
        score += 0;
        console.log("Score Component: Power-Up Usage (+0)");
    }

    // 4. Time Bonus (1 point)
    console.log("Time Check: Time Taken =", timeTaken, "seconds.");
    if (timeTaken < 60) { // Under 1 minute
        score += 1;
        console.log("Score Component: Time Bonus (+1)");
    } else if (timeTaken < 120) { // Under 2 minutes
        score += 0.5;
        console.log("Score Component: Time Bonus (+0.5)");
    } else {
        score += 0;
        console.log("Score Component: Time Bonus (+0)");
    }

    console.log("--- End Score Calculation ---");
    return score;
}

// --- 7. Event Listeners ---
submitGuessBtn.addEventListener('click', processGuess);
userGuessInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        processGuess();
    }
});

// Power-up button placeholders (will add specific logic later)
hintBtn.addEventListener('click', () => {
    if (powerUpCounts.hint > 0) { // Check if hints are available
        powerUpCounts.hint--; // Decrement available hints
        powerUpsUsedThisGame.hint++; // Increment count of hints *used this game*
        updatePowerUpDisplays(); // Update UI for hint count
        // PASTE THIS CODE BLOCK HERE, after updatePowerUpDisplays();
        // REPLACE the existing hint logic block with this:
        const lastWord = currentChain[currentChain.length - 1];
        let hintWord = null;

        // Find the index of the last word in the current chain within the optimal path
        const lastWordIndexInOptimalPath = window.currentOptimalPath.indexOf(lastWord);

        if (lastWordIndexInOptimalPath !== -1 && lastWordIndexInOptimalPath < window.currentOptimalPath.length - 1) {
            // If the current word is on the optimal path and not the target word,
            // the hint is the *next* word on the optimal path.
            hintWord = window.currentOptimalPath[lastWordIndexInOptimalPath + 1];
            window.showMessage(`Hint: The next optimal step is '${hintWord}'!`, 5000);
        } else {
            // Fallback: If current word is not on optimal path, or is the target,
            // provide a random valid morph from the dictionary (current behavior).
            let possibleNextWords = [];
            for (let i = 0; i < dictionary.length; i++) {
                const dictWord = dictionary[i];
                if (isValidMorphStep(lastWord, dictWord) && dictWord !== lastWord) {
                    possibleNextWords.push(dictWord);
                }
            }
            if (possibleNextWords.length > 0) {
                hintWord = possibleNextWords[Math.floor(Math.random() * possibleNextWords.length)];
                window.showMessage(`Hint: Try '${hintWord}' next! (Not on optimal path)`, 5000);
            } else {
                window.showMessage("No direct hint available from the dictionary for this word.", 5000);
            }
        }
    } else {
        window.showMessage("No hints available!", 5000);
    }
});
swapBtn.addEventListener('click', () => { window.showMessage("Swap power-up clicked (logic coming soon!)", 5000); });
skipBtn.addEventListener('click', () => { window.showMessage("Skip power-up clicked (logic coming soon!)", 5000); });

// --- Game Initialization Trigger ---
// This listener ensures the game initializes only AFTER the entire HTML document is parsed.
// It also checks if Firebase has finished its async initialization.
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired. Checking Firebase readiness...");

    const checkFirebaseGlobalsAndInit = setInterval(() => {
        // Check if ALL necessary global Firebase variables are available
        if (window.firebaseReady && window.firestoreDb && window.appId && window.currentUserId) {
            clearInterval(checkFirebaseGlobalsAndInit); // Stop checking
            console.log("All Firebase globals are ready. Initializing game and loading leaderboard.");
            initializeGame(); // Start the game's UI and logic
            loadLeaderboard(); // Load the leaderboard now that Firebase DB is guaranteed to be ready
        } else {
            console.log("Waiting for Firebase globals to be fully ready...");
        }
    }, 50); // Check more frequently (e.g., every 50ms)
});