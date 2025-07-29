# FILE: puzzle_generator.py

# This Python script generates Word Morph puzzles and finds their optimal path lengths.
# It uses a Breadth-First Search (BFS) algorithm for efficiency.

# To run this script:
# 1. Save it as puzzle_generator.py in your project folder.
# 2. Make sure you have Python installed (download from python.org if not).
# 3. Open your terminal/command prompt (or VS Code's Integrated Terminal).
# 4. Navigate to your project folder using 'cd YourProjectFolder'.
# 5. Run the script: 'python puzzle_generator.py'

import collections # Used for deque, an efficient double-ended queue
import random      # Used for selecting random words

# --- 1. Game Dictionary (Must match JavaScript dictionary in script.js) ---
# This list contains common 3- and 4-letter English words.
# All words are stored and processed in uppercase for consistency.
DICTIONARY = [
    "READ", "HEAD", "HELD", "HOLD", "HOLE", "ROLE", "ROSE",
    "WAVE", "DAVE", "DIVE", "WANE", "WINE", "DINE",
    "CAT", "COT", "COG", "DOG",
    "MAKE", "TAKE",
    "COLD", "CORD", "WORD", "WORM", "WARM",
    "PINE", "PANE", "SANE", "SALE", "SALT",
    "LIME", "LIMP", "SIMP", "SUMP", "PUMP", "POMP", "POOP", "COOP", "COUP", "SOUP",
    "BALE", "BALD", "BOLD", "COLD",
    "FLAME", "BLAME", "BLASE", "BLAST",
    "GAME", "DAME", "DOME", "HOME",
    "STAY", "SLAY", "PLAY",
    "FLAM",
    # --- Expanded Dictionary for richer puzzles ---
    "AHEM", "ABLE", "ACID", "AIDE", "AIL", "AIM", "AIR", "ALAS", "ALGA", "ALL", "ALLY", "ALOE", "ALSO", "ALT", "AMEN", "AMI", "AMID", "AMMO", "AMOK", "AMP", "AND", "ANEW", "ANTI", "ANTS", "APE", "APEX", "APES", "APPS", "ARCH", "ARE", "ARID", "ARMS", "ARMY", "ARTS", "ASH", "ASIA", "ASK", "AUNT", "AURA", "AUTO", "AVE", "AWAY", "AWE", "AXE", "AXIS", "AXLE",
    "BACK", "BAD", "BAG", "BAIL", "BAIT", "BAKE", "BALD", "BALE", "BALL", "BALM", "BAND", "BANE", "BANG", "BANK", "BAR", "BARD", "BARE", "BARK", "BARN", "BASE", "BASH", "BAT", "BATH", "BATS", "BEAD", "BEAK", "BEAM", "BEAN", "BEAR", "BEAT", "BED", "BEEF", "BEEN", "BEER", "BELL", "BELT", "BEND", "BENT", "BEST", "BETA", "BIAS", "BIB", "BID", "BIG", "BIKE", "BILD", "BILL", "BIND", "BIRD", "BITE", "BITS", "BLAB", "BLACK", "BLAH", "BLAME", "BLAND", "BLARE", "BLASE", "BLAST", "BLEB", "BLESS", "BLIP", "BLOB", "BLOC", "BLOG", "BLON", "BLOT", "BLOW", "BLUE", "BLUM", "BLUR", "BOAR", "BOAT", "BODE", "BOG", "BOGY", "BOLD", "BOLE", "BOMB", "BONA", "BOND", "BONE", "BONK", "BOOK", "BOOM", "BOON", "BOOR", "BOOT", "BORD", "BORE", "BORN", "BOSS", "BOTH", "BOWL", "BOWS", "BOX", "BOY", "BRAD", "BRAG", "BRAID", "BRAIN", "BRAKE", "BRAN", "BRASS", "BRAT", "BRAVE", "BRAWL", "BRAY", "BRED", "BREW", "BRIEF", "BRIM", "BRIN", "BRIN", "BRIT", "BROD", "BROG", "BROK", "BROM", "BRON", "BROO", "BROW", "BUCK", "BUD", "BUFF", "BULB", "BULK", "BULL", "BUMP", "BUN", "BUNG", "BUNK", "BUNT", "BURG", "BURN", "BURP", "BURR", "BUSH", "BUSY", "BUT", "BUTT", "BUYS", "BUZZ",
    "CAB", "CAGE", "CAKE", "CALL", "CALM", "CAM", "CAME", "CAMP", "CAN", "CANE", "CANS", "CAPE", "CAR", "CARD", "CARE", "CARP", "CARS", "CART", "CASE", "CASH", "CAST", "CAT", "CAVE", "CEIL", "CELL", "CENT", "CHAP", "CHAR", "CHAT", "CHEF", "CHIC", "CHIN", "CHIP", "CHIT", "CHOIR", "CHOM", "CHOP", "CHOW", "CHUM", "CHUR", "CITE", "CITY", "CLAD", "CLAG", "CLAM", "CLAN", "CLAP", "CLAW", "CLAY", "CLIP", "CLOG", "CLON", "CLOT", "CLOU", "CLOW", "CLUB", "CLUE", "COAL", "COAT", "COAX", "COB", "COCK", "COD", "CODE", "COGN", "COIL", "COIN", "COKE", "COLD", "COLT", "COME", "COMP", "CON", "CONE", "CONK", "COOL", "COOP", "COP", "COPE", "COPS", "CORD", "CORE", "CORN", "CORS", "COST", "COT", "COUP", "COVE", "COWL", "COZY", "CRAB", "CRAD", "CRAG", "CRAM", "CRAN", "CRAP", "CRAS", "CRAW", "CRAY", "CRED", "CREM", "CREP", "CREW", "CRIA", "CRIM", "CRIN", "CRIP", "CROC", "CROP", "CROW", "CRUD", "CRUM", "CRUP", "CRUX", "CUB", "CUBE", "CUFF", "CULL", "CUP", "CURB", "CURD", "CURE", "CURL", "CURT", "CUSH", "CUSP", "CUT", "CUTE", "CYCL",
    "DAB", "DAD", "DAFT", "DALE", "DAME", "DAMN", "DAMP", "DAN", "DAND", "DANE", "DANG", "DANK", "DARE", "DARK", "DART", "DASH", "DATE", "DAUB", "DAWN", "DAYS", "DAZE", "DEAD", "DEAF", "DEAL", "DEAN", "DEAR", "DEBT", "DECK", "DEED", "DEEM", "DEEP", "DEER", "DEFT", "DELL", "DENT", "DENY", "DEPT", "DESK", "DIAL", "DICE", "DIE", "DIET", "DIG", "DIME", "DIN", "DINE", "DING", "DINT", "DIP", "DIRT", "DISC", "DISH", "DISK", "DIVA", "DIVE", "DOCK", "DOE", "DOFF", "DOG", "DOLE", "DOLL", "DOLT", "DOME", "DON", "DONE", "DONG", "DONS", "DOOM", "DOOR", "DOPE", "DORM", "DORP", "DORY", "DOS", "DOSE", "DOT", "DOUR", "DOWN", "DOZE", "DRAB", "DRAG", "DRAM", "DRAW", "DREW", "DRIB", "DRIP", "DROP", "DRUB", "DRUG", "DRUM", "DRY", "DUAL", "DUCT", "DUEL", "DUET", "DUFF", "DUG", "DUKE", "DULL", "DUMB", "DUN", "DUNE", "DUNG", "DUNK", "DUST", "DUTY", "DWELL", "DYKE",
    "EACH", "EAR", "EARL", "EARN", "EASE", "EAST", "EASY", "EATS", "EDGE", "EDIT", "EEL", "EGG", "EGO", "ELSE", "EMIT", "END", "ENDS", "EVEN", "EVER", "EVIL", "EXAM", "EXIT", "EYES",
    "FACE", "FACT", "FADE", "FAIL", "FAIN", "FAIR", "FAKE", "FALL", "FAME", "FAN", "FANG", "FANS", "FARM", "FAST", "FAT", "FATE", "FAULT", "FAWN", "FEAR", "FEAT", "FEED", "FEEL", "FEET", "FELL", "FELT", "FEM", "FEND", "FERN", "FEST", "FETA", "FIB", "FICK", "FIDO", "FIEF", "FIFE", "FIG", "FIGHT", "FILE", "FILL", "FILM", "FIND", "FINE", "FING", "FINK", "FIRE", "FIRM", "FISH", "FIST", "FIT", "FIVE", "FIX", "FLAG", "FLAK", "FLAM", "FLAME", "FLAN", "FLAP", "FLAT", "FLAW", "FLEA", "FLEE", "FLEM", "FLET", "FLEX", "FLIN", "FLIP", "FLIT", "FLOG", "FLOP", "FLOW", "FLUB", "FLUE", "FLUG", "FLUM", "FLUS", "FLUT", "FOB", "FOG", "FOIL", "FOLD", "FOLK", "FOND", "FONT", "FOOD", "FOOL", "FOOT", "FOR", "FORD", "FORE", "FORK", "FORM", "FORT", "FOSS", "FOUL", "FOUR", "FOWL", "FOX", "FOXY", "FRAG", "FRAM", "FRAT", "FRAY", "FREE", "FRET", "FRIG", "FROG", "FROM", "FRONT", "FROTH", "FROW", "FRUG", "FULL", "FUME", "FUN", "FUND", "FUNK", "FURL", "FURY", "FUSE", "FUSS", "FUZZ",
    "GAB", "GAD", "GAFF", "GAG", "GAIN", "GAIT", "GALE", "GALL", "GAME", "GANG", "GAP", "GAPE", "GAPS", "GARB", "GASH", "GASP", "GATE", "GAWK", "GAY", "GAZE", "GEAR", "GELD", "GELT", "GEM", "GENE", "GENT", "GERM", "GET", "GHOST", "GIBE", "GIFT", "GILD", "GILL", "GILT", "GIN", "GING", "GIRD", "GIRL", "GIST", "GIVE", "GLAD", "GLAM", "GLEAM", "GLEN", "GLIB", "GLID", "GLIM", "GLINT", "GLITCH", "GLOB", "GLOP", "GLOS", "GLOW", "GLUE", "GLUT", "GOAD", "GOAL", "GOAT", "GOD", "GOLD", "GONG", "GOOD", "GOOF", "GOON", "GOOP", "GOOS", "GORE", "GORY", "GOSP", "GOTH", "GOUT", "GOV", "GOWN", "GRAB", "GRAD", "GRAM", "GRAN", "GRAP", "GRAS", "GRAT", "GRAV", "GRAY", "GREE", "GREG", "GREN", "GRET", "GREW", "GRID", "GRIF", "GRIM", "GRIN", "GRIP", "GROG", "GROK", "GROM", "GRON", "GROP", "GROW", "GRUB", "GRUG", "GRUM", "GULL", "GULP", "GUM", "GUN", "GUNK", "GURG", "GUSH", "GUTS", "GUY",
    "HACK", "HAIL", "HAIR", "HALE", "HALL", "HALT", "HAME", "HAND", "HANG", "HANK", "HARD", "HARE", "HARK", "HARM", "HARP", "HASH", "HASP", "HASS", "HAST", "HAT", "HATE", "HATS", "HAUL", "HAVE", "HAWK", "HAY", "HEAD", "HEAL", "HEAP", "HEAR", "HEAT", "HECK", "HEED", "HEEL", "HEFT", "HELD", "HELL", "HELM", "HELP", "HEMP", "HEN", "HERD", "HERE", "HERO", "HERS", "HEX", "HIKE", "HILL", "HILT", "HIM", "HIND", "HINT", "HIP", "HIRE", "HIS", "HISS", "HIT", "HIVE", "HOAR", "HOB", "HOCK", "HOG", "HOLD", "HOLE", "HOLL", "HOLM", "HOLT", "HOME", "HONE", "HONS", "HOOD", "HOOK", "HOOT", "HOPE", "HORN", "HORS", "HOSP", "HOST", "HOT", "HOUR", "HOVE", "HOW", "HOWL", "HUB", "HUE", "HUFF", "HUG", "HULA", "HULL", "HUM", "HUMP", "HUNK", "HUNT", "HURL", "HURT", "HUSH", "HUT", "HYMN", "HYPO",
    "ICE", "IDEA", "IDLE", "IDOL", "IF", "ILL", "IMP", "IN", "INCH", "INFO", "INK", "INN", "INTO", "ION", "IONS", "IRE", "IRON", "IS", "ISH", "ISLE", "ITCH", "ITEM", "ITS", "IVY",
    "JAB", "JACK", "JAG", "JAIL", "JAM", "JAMS", "JAR", "JAW", "JAZZ", "JEAN", "JEER", "JELL", "JESU", "JET", "JIB", "JILT", "JIM", "JING", "JINX", "JOB", "JOCK", "JOEY", "JOG", "JOIN", "JOINT", "JOKE", "JOLT", "JOSH", "JOT", "JOWL", "JOY", "JUAN", "JUDO", "JUG", "JUMP", "JUNK", "JUST", "JUTE",
    "KEEL", "KEEN", "KEEP", "KELP", "KEN", "KENT", "KEPT", "KERN", "KEY", "KICK", "KID", "KILL", "KILO", "KILT", "KIN", "KIND", "KING", "KINK", "KINO", "KIP", "KIPS", "KISS", "KIT", "KITE", "KITS", "KNAP", "KNEE", "KNEW", "KNIT", "KNOB", "KNOC", "KNOW", "KNUB", "KNOX", "KOLA", "KONG", "KOOK", "KUDO", "KUDU", "KURL",
    "LAB", "LACE", "LACK", "LAD", "LADE", "LAG", "LAID", "LAIN", "LAIR", "LAKE", "LAMA", "LAMB", "LAME", "LAMP", "LAND", "LANE", "LANG", "LANK", "LARD", "LARGE", "LASH", "LAST", "LATE", "LATH", "LAVA", "LAVE", "LAW", "LAWN", "LAWS", "LAZY", "LEAD", "LEAF", "LEAK", "LEAN", "LEAP", "LEAR", "LEASE", "LEAST", "LEAVE", "LED", "LEE", "LEFT", "LEG", "LEND", "LENS", "LENT", "LESS", "LET", "LETS", "LEVY", "LIAR", "LICE", "LICK", "LID", "LIE", "LIEN", "LIFE", "LIFT", "LIKE", "LILL", "LILT", "LIME", "LIMP", "LINE", "LINK", "LINT", "LION", "LIRA", "LIRE", "LIST", "LIVE", "LOAD", "LOAF", "LOAM", "LOAN", "LOAT", "LOB", "LOBE", "LOCA", "LOCK", "LOCO", "LOD", "LODE", "LOFT", "LOG", "LOGO", "LOIN", "LOLL", "LONG", "LOOK", "LOOM", "LOON", "LOOP", "LOOS", "LOOT", "LOPE", "LORD", "LORE", "LOSE", "LOSS", "LOST", "LOT", "LOUD", "LOVE", "LOW", "LUBE", "LUCK", "LUDO", "LUGE", "LUG", "LULL", "LUMP", "LUN", "LUNG", "LURE", "LURK", "LUSH", "LUST", "LUT", "LUXE", "LYNX", "LYRE",
    "MAAM", "MACE", "MACH", "MAD", "MADE", "MAGE", "MAGN", "MAID", "MAIL", "MAIN", "MAKE", "MALE", "MALI", "MALL", "MALT", "MAM", "MAN", "MANE", "MANY", "MAP", "MAR", "MARC", "MARE", "MARK", "MARL", "MARS", "MART", "MASH", "MASK", "MASS", "MAST", "MAT", "MATE", "MATH", "MAUL", "MAY", "MAYB", "MAZE", "MEAD", "MEAL", "MEAN", "MEAT", "MEET", "MELT", "MEMO", "MEN", "MEND", "MENT", "MENU", "MER", "MERE", "MESH", "MESS", "MET", "METAL", "METE", "MEW", "MICE", "MID", "MIKE", "MILD", "MILE", "MILK", "MILL", "MIM", "MIME", "MIMP", "MIN", "MIND", "MINE", "MING", "MINK", "MINT", "MINX", "MIRA", "MIRE", "MIRK", "MIRR", "MIST", "MIT", "MITE", "MIX", "MOAN", "MOAT", "MOCK", "MODE", "MOG", "MOLD", "MOLE", "MOLL", "MOLT", "MOM", "MOMS", "MONK", "MONO", "MOOD", "MOON", "MOOR", "MOOS", "MOOT", "MOP", "MOPE", "MOR", "MORE", "MORN", "MORT", "MOSS", "MOST", "MOTH", "MOVE", "MOW", "MUCH", "MUCK", "MUFF", "MUG", "MULL", "MUMP", "MUMY", "MUNI", "MURAL", "MUS", "MUSE", "MUST", "MUTT", "MUZZ", "MYRR", "MYTH",
    "NAB", "NAG", "NAIL", "NAME", "NAN", "NAP", "NAPE", "NAPS", "NASH", "NAST", "NAT", "NAVE", "NAVY", "NEAR", "NEAT", "NECK", "NEED", "NEEM", "NEIL", "NELL", "NEON", "NEP", "NERD", "NEST", "NET", "NEW", "NEWS", "NEXT", "NICE", "NICK", "NIGH", "NIL", "NIM", "NIMB", "NIML", "NINE", "NIP", "NIPS", "NIT", "NITS", "NOB", "NODE", "NOEL", "NOG", "NOIL", "NOIS", "NOM", "NONE", "NOOK", "NOON", "NOR", "NORM", "NOSE", "NOT", "NOTE", "NOUT", "NOV", "NOW", "NUDE", "NUG", "NULL", "NUMB", "NUN", "NUNC", "NURT", "NUT",
    "OAF", "OAK", "OAR", "OATH", "OBEY", "ODD", "ODE", "OF", "OFF", "OH", "OIL", "OK", "OLD", "ON", "ONCE", "ONE", "ONES", "ONLY", "ONTO", "OOH", "OOL", "OOM", "OON", "OOP", "OOPS", "OOR", "OOS", "OOT", "OOZE", "OPEN", "OPT", "OR", "ORAL", "ORE", "ORIG", "ORT", "OS", "OTHER", "OUCH", "OUR", "OUT", "OVAL", "OVEN", "OVER", "OWED", "OWEN", "OWN", "OXEN", "OXY",
    "PACE", "PACK", "PAD", "PAGE", "PAID", "PAIL", "PAIN", "PAIR", "PAL", "PALE", "PALM", "PAN", "PANE", "PANS", "PANT", "PAR", "PARA", "PARD", "PARE", "PARK", "PART", "PASS", "PAST", "PAT", "PATH", "PATS", "PAVE", "PAWN", "PAY", "PEAK", "PEAL", "PEAN", "PEAR", "PEAT", "PECK", "PEEK", "PEEL", "PEEP", "PEER", "PEG", "PELL", "PEN", "PEND", "PENN", "PENS", "PENT", "PER", "PERT", "PEST", "PET", "PHEW", "PIAN", "PICK", "PIED", "PIER", "PIG", "PILE", "PILL", "PIN", "PINE", "PING", "PINK", "PINT", "PION", "PIP", "PIPE", "PIPS", "PIRN", "PISS", "PIT", "PITH", "PITS", "PITY", "PLAN", "PLAY", "PLEA", "PLEB", "PLED", "PLEN", "PLEW", "PLIE", "PLOD", "PLON", "PLOT", "PLOW", "PLOY", "PLUG", "PLUM", "PLUS", "POCK", "POD", "POEM", "POET", "POGO", "POIL", "POIN", "POKE", "POL", "POLE", "POLL", "POMP", "POND", "PONE", "PONS", "PONY", "POO", "POOH", "POOL", "POOP", "POOR", "POP", "POPS", "PORE", "PORK", "PORT", "POSE", "POSH", "POST", "POT", "POUR", "POUT", "POWL", "POWS", "PRAY", "PREP", "PREY", "PRIG", "PRIM", "PRIN", "PRIS", "PRIV", "PRO", "PROB", "PROM", "PROP", "PROW", "PUCK", "PUFF", "PULL", "PULP", "PULS", "PUMP", "PUN", "PUNK", "PUNT", "PURE", "PURL", "PURP", "PURR", "PUSH", "PUT", "PUTT", "PUZZ",
        "QUAD", "QUAI", "QUAY", "QUE", "QUER", "QUI", "QUID", "QUIP", "QUIT", "QUIZ",
        "RACE", "RACK", "RAD", "RADE", "RAGE", "RAGS", "RAID", "RAIL", "RAIN", "RAIS", "RAKE", "RAM", "RAMP", "RAN", "RANC", "RAND", "RANG", "RANK", "RANT", "RAP", "RAPS", "RARE", "RASH", "RATE", "RATS", "RAVE", "RAW", "RAZE", "READ", "REAL", "REAM", "REAP", "REAR", "REB", "RED", "REED", "REEF", "REEL", "REFS", "REFT", "REIN", "RELY", "REM", "REND", "RENE", "RENT", "REP", "REST", "RET", "REV", "REVS", "REW", "RHEA", "RHYM", "RIBS", "RICE", "RICH", "RICK", "RID", "RIDE", "RIFE", "RIFT", "RIG", "RILL", "RIM", "RIND", "RING", "RINK", "RIOT", "RIP", "RIPE", "RIPS", "RISE", "RISK", "RITE", "ROAM", "ROAR", "ROBE", "ROB", "ROCK", "ROD", "RODE", "ROG", "ROIL", "ROLE", "ROLL", "ROMA", "ROME", "ROMP", "RONE", "ROOF", "ROOK", "ROOM", "ROOT", "ROPE", "ROPY", "ROSE", "ROSY", "ROT", "ROTE", "ROUG", "ROUP", "ROUT", "ROW", "RUB", "RUBE", "RUBY", "RUCK", "RUDD", "RUDE", "RUFF", "RUG", "RUIN", "RULE", "RUM", "RUMP", "RUN", "RUNG", "RUNS", "RUNT", "RUR", "RUSH", "RUSK", "RUST", "RUT",
        "SACK", "SAD", "SAFE", "SAGA", "SAGE", "SAID", "SAIL", "SAIN", "SAINT", "SAKE", "SALE", "SALI", "SALT", "SAME", "SAND", "SANE", "SANG", "SANK", "SASH", "SAT", "SATE", "SAVE", "SAW", "SAWS", "SAX", "SAY", "SCAB", "SCAD", "SCAG", "SCAL", "SCAM", "SCAN", "SCAR", "SCAT", "SCOP", "SCOR", "SCOT", "SCOW", "SCRAG", "SCRAM", "SCRAP", "SCRAT", "SCREW", "SCROD", "SCUM", "SEA", "SEAL", "SEAM", "SEAN", "SEAR", "SEAT", "SEC", "SECT", "SEE", "SEED", "SEEK", "SEEM", "SEEN", "SEEP", "SEER", "SELL", "SEND", "SENS", "SENT", "SEPT", "SET", "SETS", "SEW", "SEX", "SHAD", "SHAG", "SHAK", "SHAL", "SHAM", "SHAN", "SHAP", "SHAR", "SHOT", "SHOW", "SHUT", "SICK", "SIDE", "SIFT", "SIGH", "SIGN", "SILK", "SILL", "SIM", "SIMP", "SIN", "SING", "SINK", "SINS", "SIP", "SIPS", "SIR", "SIRE", "SIRS", "SITE", "SIT", "SIX", "SIZE", "SKAG", "SKAL", "SKAT", "SKEE", "SKET", "SKEW", "SKID", "SKIM", "SKIN", "SKIP", "SKIT", "SKUL", "SLAB", "SLAD", "SLAM", "SLAT", "SLAW", "SLAY", "SLED", "SLEEK", "SLEET", "SLEW", "SLID", "SLIM", "SLING", "SLIP", "SLIT", "SLOB", "SLOG", "SLOP", "SLOT", "SLOW", "SLUG", "SLUM", "SLUM", "SLUR", "SLUT", "SMAL", "SMIT", "SNAG", "SNAP", "SNAR", "SNAT", "SNEAK", "SNIP", "SNIT", "SNOB", "SNOT", "SNOW", "SNUB", "SNUG", "SOAK", "SOAP", "SOAR", "SOCK", "SOD", "SODA", "SOFA", "SOIL", "SOLA", "SOLD", "SOLE", "SOLO", "SOLV", "SOME", "SON", "SONG", "SONS", "SOON", "SOP", "SOPS", "SORE", "SORT", "SOU", "SOUL", "SOUP", "SOUR", "SOW", "SPAC", "SPAD", "SPAG", "SPAN", "SPAR", "SPAS", "SPAT", "SPAW", "SPEC", "SPED", "SPIN", "SPIT", "SPOT", "SPRY", "SPUD", "SPUR", "SQUA", "STAB", "STAG", "STAL", "STAR", "STAT", "STAY", "STEM", "STEP", "STEW", "STIC", "STIM", "STIR", "STOB", "STOP", "STOW", "STUD", "STUM", "STUN", "STUP", "SUCH", "SUCK", "SUD", "SUE", "SUET", "SUM", "SUMP", "SUN", "SUNG", "SUNK", "SUP", "SURE", "SURF", "SWAB", "SWAG", "SWAM", "SWAN", "SWAP", "SWAT", "SWAY", "SWEL", "SWIM", "SWIN", "SWIP", "SWOB", "SWOP", "SWOT",
       "TAB", "TACK", "TACT", "TAIL", "TAKE", "TALC", "TALE", "TALK", "TALL", "TAME", "TAMP", "TAN", "TANG", "TANK", "TAPE", "TAR", "TARD", "TARE", "TARN", "TARP", "TART", "TASK", "TAST", "TATE", "TAUT", "TAX", "TAXA", "TEAL", "TEAM", "TEAR", "TEAS", "TEAT", "TED", "TEEM", "TEEN", "TELL", "TEMP", "TEN", "TEND", "TENS", "TENT", "TERM", "TEST", "TEXT", "THAN", "THAT", "THE", "THEM", "THEN", "THEN", "THIS", "THIN", "THIO", "THIR", "THUS", "TICK", "TIDE", "TIE", "TIED", "TIER", "TIES", "TIG", "TIGHT", "TILE", "TILL", "TILT", "TIME", "TIMP", "TIN", "TINE", "TING", "TINK", "TINT", "TINY", "TIP", "TIPS", "TIRE", "TIRL", "TOAD", "TOE", "TOIL", "TOLD", "TOLE", "TOM", "TOME", "TON", "TONE", "TONG", "TONS", "TOOK", "TOOL", "TOOM", "TOON", "TOOT", "TOP", "TOPE", "TOPS", "TOR", "TORE", "TORN", "TORT", "TORY", "TOSS", "TOT", "TOTE", "TOUR", "TOUT", "TOW", "TOWN", "TOWS", "TOY", "TRAC", "TRAD", "TRAIL", "TRAM", "TRAP", "TRAS", "TRAW", "TRAY", "TRED", "TREE", "TREK", "TRES", "TREW", "TRIB", "TRIM", "TRIN", "TRIP", "TROC", "TROD", "TROP", "TROT", "TROW", "TRUE", "TUG", "TULP", "TUMP", "TUNA", "TUNE", "TUNG", "TURF", "TURN", "TUSK", "TUSS", "TUTU", "TWIN", "TWIRL", "TWIS", "TWIT", "TYPE", "TYPO", "TYR",
       "UGH", "UKES", "ULNA", "ULTRA", "UNCE", "UNCI", "UNCLE", "UNDO", "UNIT", "UNS", "UNT", "UP", "UPON", "UPS", "URGE", "URN", "US", "USE", "USED", "USER", "USES", "UTAH", "UTIL",
       "VACU", "VAGA", "VAIL", "VALE", "VAMP", "VAN", "VANE", "VANS", "VANT", "VAPE", "VARY", "VAST", "VEAL", "VEER", "VEIL", "VEIN", "VELA", "VELD", "VENT", "VERT", "VERY", "VETO", "VEX", "VIA", "VICE", "VICK", "VIDE", "VIES", "VIEW", "VIG", "VILL", "VIM", "VIN", "VINE", "VINO", "VINS", "VIP", "VIRE", "VIRT", "VISA", "VISE", "VITA", "VITE", "VIVA", "FIVE", "VOC", "VOID", "VOIL", "VOL", "VOLT", "VOM", "VOTE", "VOW", "VUGS", "VUZZ",
       "WACK", "WADE", "WADS", "WAGE", "WAGS", "WAIL", "WAIN", "WAIT", "WAKE", "WALK", "WALL", "WALT", "WAN", "WAND", "WANE", "WANG", "WANT", "WAR", "WARD", "WARE", "WARM", "WARN", "WARP", "WARS", "WART", "WASH", "WASP", "WAST", "WAT", "WATCH", "WAVE", "WAVY", "WAX", "WAY", "WAYS", "WEAK", "WEAL", "WEAN", "WEAR", "WEAVE", "WED", "WEE", "WEED", "WEEK", "WEEL", "WEEN", "WEET", "WEFT", "WEIG", "WEIR", "WELD", "WELL", "WEND", "WENT", "WERE", "WERT", "WEST", "WET", "WHAM", "WHAP", "WHAT", "WHEN", "WHEW", "WHEY", "WHIG", "WHIM", "WHIP", "WHIR", "WHIT", "WHO", "WHOA", "WHOM", "WHOP", "WHOR", "WHY", "WICK", "WIDE", "WIDG", "WIFE", "WIG", "WILD", "WILL", "WILT", "WIN", "WINC", "WIND", "WINE", "WING", "WINK", "WINS", "WINT", "WIPE", "WIRE", "WIRY", "WIS", "WISE", "WISH", "WISP", "WIT", "WITH", "WITS", "WIZ", "WOE", "WOLF", "WOM", "WOMB", "WON", "WOND", "WONG", "WONK", "WOO", "WOOD", "WOOF", "WOOL", "WOON", "WOOP", "WOOS", "WOOT", "WORD", "WORE", "WORK", "WORM", "WORN", "WORP", "WORS", "WORT", "WOVE", "WOW", "WRAP", "WREN", "WRIE", "WRIO", "WRIT", "WROK", "WROW", "WRY", "WYND",
       "XRAY",
       "YACH", "YACK", "YAGI", "YAK", "YALE", "YAMS", "YANK", "YAP", "YAPS", "YARD", "YARN", "YAW", "YAWL", "YAWN", "YAWP", "YEAR", "YEAS", "YELL", "YEN", "YENS", "YEP", "YET", "YETI", "YIELD", "YELL", "YIP", "YIPS", "YOB", "YOD", "YOGI", "YOLK", "YOMP", "YON", "YORK", "YOU", "YOUR", "YOW", "YUAN", "YURT", "YUTZ",
       "ZAP", "ZEAL", "ZEB", "ZEN", "ZINC", "ZING", "ZIP", "ZIPS", "ZIT", "ZITS", "ZIZZ", "ZONE", "ZONK", "ZOO", "ZOOM", "ZOUK", "ZULU",
       "PETS", "CATS", "PITA", "SITS", "MATS", "PALS", "MAPS", "CAPS", "POTS", "CUTS", "LATS", "ZAPS", "SANS", "CONS", "FINS", "BANS", "TARS", "CUPS", "DUCK", "PELT", "WELT", "SILT", "POPE", "MOPS", "CHAD", "SULK", "PERK", "DORK", "FARE", "COWS", "FITS", "MITS", "DIRE", "MACK", "NOSY", "MUSK", "HUSK", "SHOP", "DADS", "PADS", "LADS", "FADS", "FOAL", "LONE", "SOOT", "HIDE", "KALE", "LIPS", "TUCK", "HOSE", "PIES", "HULK", "BILK", "TOCK", "BEET", "LEST", "MELD", "YORE", "HITS", "BETS", "GETS", "NETS", "VETS", "LOTS", "COTS", "BOTS", "JOTS", "LOTS", "ROTS", "TOTS", "HITS", "JETS", "RILE", "TUSH", "DOVE", "LINT", "CZAR", "BAYS", "COOT", "CLOP", "HOOP", "SLAP", "GALS", "PAYS", "PUNS", "WEEP", "WELP"
   ]
   
   # --- 2. Helper Functions for Word Ladder Logic ---
   
   # Checks if a word is in our predefined dictionary.
def is_valid_word(word, dictionary_list):
       return word.upper() in dictionary_list
   
   # Checks if two words differ by exactly one letter at the same position.
def is_morph_step(word1, word2):
       if len(word1) != len(word2):
           return False
       diff_count = 0
       for i in range(len(word1)):
           if word1[i] != word2[i]:
               diff_count += 1
       return diff_count == 1
   
   # Finds all valid next words that are one letter different from the current word.
def find_neighbors(word, dictionary_list):
       neighbors = []
       for dict_word in dictionary_list:
           if is_morph_step(word, dict_word):
               neighbors.append(dict_word)
       return neighbors
   
   # --- 3. Breadth-First Search (BFS) to Find Shortest Path ---
   
   # Finds the shortest word ladder path between start_word and target_word.
def find_shortest_path_bfs(start_word, target_word, dictionary_list):
       # Ensure words are uppercase for dictionary consistency
       start_word = start_word.upper()
       target_word = target_word.upper()
       
       if start_word == target_word:
           return [start_word]
       
       if not is_valid_word(start_word, dictionary_list) or not is_valid_word(target_word, dictionary_list):
           return None # Start or target word not in dictionary
       
       # Queue for BFS: stores (current_word, path_list)
       queue = collections.deque([(start_word, [start_word])])
       visited = {start_word} # Keep track of visited words to avoid cycles and redundant paths
       
       while queue:
           current_word, path = queue.popleft()
           
           for neighbor in find_neighbors(current_word, dictionary_list):
               if neighbor == target_word:
                   return path + [target_word] # Found the shortest path!
               
               if neighbor not in visited:
                   visited.add(neighbor)
                   queue.append((neighbor, path + [neighbor]))
                   
       return None # No path found
   
   # --- 4. Puzzle Generation Function ---
   
def generate_word_morph_puzzle(dictionary_list, min_length=4, max_length=4, min_path_len=3, max_attempts=1000):
       """
       Generates a Word Morph puzzle (start_word, target_word) with a calculated optimal path.
       
       Args:
           dictionary_list (list): A list of valid words.
           min_length (int): Minimum length for start/target words.
           max_length (int): Maximum length for start/target words.
           min_path_len (int): Minimum acceptable optimal path length.
           max_attempts (int): Maximum attempts to find a suitable puzzle.
           
       Returns:
           dict or None: A dictionary with 'start_word', 'target_word', 'optimal_path_length',
                         'optimal_path', and 'difficulty', or None if no puzzle found.
       """
       
       # Filter dictionary by desired length
       filtered_dictionary = [word for word in dictionary_list if min_length <= len(word) <= max_length]
       
       if len(filtered_dictionary) < 2:
           print(f"Error: Dictionary too small for words of length {min_length}-{max_length}.")
           return None
       
       for attempt in range(max_attempts):
           start_word = random.choice(filtered_dictionary)
           target_word = random.choice(filtered_dictionary)
           
           # Ensure start and target are different and of consistent length
           if start_word == target_word or len(start_word) != len(target_word):
               continue
               
           print(f"Attempting to generate puzzle: {start_word} to {target_word} (Attempt {attempt + 1})")
           
           path = find_shortest_path_bfs(start_word, target_word, filtered_dictionary)
           
           if path:
               path_length = len(path) - 1 # Number of transitions
               
               if path_length >= min_path_len:
                   # Determine difficulty based on path length
                   if path_length <= 3:
                       difficulty = "Easy"
                   elif path_length <= 5:
                       difficulty = "Medium"
                   else:
                       difficulty = "Hard"
                       
                   return {
                       "start_word": start_word,
                       "target_word": target_word,
                       "optimal_path_length": path_length,
                       "optimal_path": path, # Include the path for verification/reference
                       "difficulty": difficulty
                   }
                   
       print("Could not find a suitable puzzle within the given constraints and attempts.")
       return None

   # --- 5. Example Usage ---
if __name__ == "__main__":
       print("--- Starting Word Morph Puzzle Generation ---")
       
       # You can adjust these parameters to get different types of puzzles
       # For LIME-SOUP which is a 3-step optimal, you'd set min_path_len=3.
       # The current DICTIONARY has LIME and SOUP at 4 letters.
       puzzle_info = generate_word_morph_puzzle(DICTIONARY,
                                                min_length=4,
                                                max_length=4,
                                                min_path_len=3,
                                                max_attempts=100) # Reduced attempts for quicker output
       
       if puzzle_info:
           print("\n--- Generated Puzzle ---")
           print(f"Start Word: {puzzle_info['start_word']}")
           print(f"Target Word: {puzzle_info['target_word']}")
           print(f"Optimal Path Length (transitions): {puzzle_info['optimal_path_length']}")
           print(f"Optimal Path: {puzzle_info['optimal_path']}")
           print(f"Difficulty: {puzzle_info['difficulty']}")
           print("\nCopy this info to your Firebase 'dailyPuzzles' collection!")
       else:
           print("\nFailed to generate a puzzle.")
           print("Consider increasing max_attempts or adjusting min_path_len.")
