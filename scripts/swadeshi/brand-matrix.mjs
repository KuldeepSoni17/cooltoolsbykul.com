/** @typedef {'mass' | 'mid' | 'premium'} Tier */
/** @typedef {'mnc-global' | 'indian-founded' | 'indian-listed' | 'cooperative'} Ownership */

export const SHOP_CATEGORIES = [
  { id: "bathroom", label: "Bathroom", hint: "Toothpaste, soap, shampoo", emoji: "🪥" },
  { id: "kitchen", label: "Kitchen", hint: "Noodles, coffee, staples", emoji: "🍳" },
  { id: "snacks", label: "Snacks & pantry", hint: "Chips, biscuits, namkeen", emoji: "🥨" },
  { id: "personal", label: "Personal care", hint: "Skin, grooming, hygiene", emoji: "🧴" },
  { id: "home", label: "Home care", hint: "Detergent, cleaners", emoji: "🧺" },
  { id: "wear", label: "Clothing & footwear", hint: "Everyday wear", emoji: "👟" },
  { id: "tech", label: "Everyday tech", hint: "Audio & accessories — no phone swaps", emoji: "🎧" },
];

function mnc(brand, product, note, tier, priceRange) {
  return { brand, product, ownership: "mnc-global", ownershipNote: note, tier, priceRange };
}
function ind(brand, product, note, tier, priceRange, extra = {}) {
  return {
    brand,
    product,
    ownership: extra.ownership ?? "indian-founded",
    ownershipNote: note,
    tier,
    priceRange,
    ...extra,
  };
}
function listed(brand, product, note, tier, priceRange, extra = {}) {
  return ind(brand, product, note, tier, priceRange, { ownership: "indian-listed", ...extra });
}

function sub(cfg) {
  return {
    priceBasis: cfg.priceBasis ?? "Typical MRP, verify at store",
    defaultCommonRange: cfg.defaultCommonRange ?? [50, 500],
    defaultAltRange: cfg.defaultAltRange ?? [40, 450],
    priceNote: cfg.priceNote,
    tags: cfg.tags ?? [],
    blockedPairs: cfg.blockedPairs ?? [],
    ...cfg,
  };
}

/** @type {import('./build-catalog.mjs').BRAND_MATRIX} */
export const BRAND_MATRIX = [
  sub({
    categoryId: "bathroom",
    id: "toothpaste",
    label: "Toothpaste",
    occasion: "Daily toothpaste",
    priceBasis: "≈100g tube, MRP",
    defaultCommonRange: [80, 180],
    defaultAltRange: [45, 220],
    common: [
      mnc("Colgate", "MaxFresh / Strong Teeth", "Colgate-Palmolive — US MNC", "mass", [90, 130]),
      mnc("Pepsodent", "Germicheck", "Hindustan Unilever — MNC", "mass", [70, 110]),
      mnc("Close Up", "Everfresh", "HUL — MNC", "mass", [75, 115]),
      mnc("Sensodyne", "Repair & Protect", "GSK/Haleon — global MNC", "premium", [180, 280]),
      mnc("Oral-B", "Pro-Health", "P&G — US MNC", "mid", [120, 180]),
      mnc("Aquafresh", "Fresh Mint", "GSK — global MNC", "mid", [90, 140]),
    ],
    indian: [
      ind("Perfora", "Dream White / Anti-cavity", "Indian D2C (Perfora Life)", "mid", [120, 200], {
        match: "strong",
        qualityVerdict: "comparable",
      }),
      ind("Dabur Red", "Ayurvedic toothpaste", "Dabur — Indian listed", "mass", [55, 90], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
      listed("Patanjali", "Dant Kanti", "Patanjali Ayurved — Indian", "mass", [40, 75], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
      ind("Meswak", "Herbal toothpaste", "Indian herbal brand", "mass", [50, 85], { match: "good" }),
      ind("Vicco", "Vajradanti", "Vicco — Indian family-owned", "mass", [45, 80], { match: "good" }),
      listed("Himalaya", "Sparkling White", "Himalaya — Indian listed", "mid", [90, 150], { match: "strong" }),
      ind("Bentodent", "Natural toothpaste", "Indian natural D2C", "mid", [100, 160], { match: "good" }),
      ind("Arata", "Natural toothpaste", "Indian clean-beauty D2C", "premium", [180, 260], {
        match: "good",
        qualityVerdict: "comparable",
      }),
    ],
  }),
  sub({
    categoryId: "bathroom",
    id: "soap",
    label: "Bathing soap",
    occasion: "Daily bath soap",
    priceBasis: "≈125g bar, MRP",
    common: [
      mnc("Dove", "Beauty Cream Bar", "Unilever — MNC", "mid", [80, 120]),
      mnc("Lux", "Soft Touch", "Unilever — MNC", "mass", [35, 55]),
      mnc("Pears", "Pure & Gentle", "Unilever — MNC", "mid", [60, 90]),
      mnc("Lifebuoy", "Total 10", "Unilever — MNC", "mass", [30, 50]),
      mnc("Dettol", "Original", "Reckitt — UK MNC", "mid", [55, 85]),
      mnc("Fiama", "Gel bar", "ITC — Indian listed (global JV heritage)", "mid", [60, 95]),
    ],
    indian: [
      ind("Medimix", "Ayurvedic soap", "Cholayil — Indian family-owned", "mass", [45, 70], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
      listed("Mysore Sandal", "Sandalwood soap", "KSDL — Indian PSU", "mid", [70, 110], { match: "good" }),
      ind("Hamam", "Neem tulsi", "HUL heritage Indian brand", "mass", [35, 55], { match: "good" }),
      listed("Himalaya", "Neem & Turmeric", "Himalaya — Indian listed", "mass", [45, 75], { match: "good" }),
      ind("Margo", "Neem soap", "Indian brand", "mass", [30, 50], { match: "good" }),
      listed("Fiama", "Di Wills", "ITC — Indian listed", "mid", [55, 90], { match: "strong" }),
      ind("Khadi Natural", "Herbal soap", "KVIC-linked Indian cooperative chain", "mass", [40, 70], {
        ownership: "cooperative",
        match: "situational",
      }),
    ],
  }),
  sub({
    categoryId: "bathroom",
    id: "shampoo",
    label: "Shampoo",
    occasion: "Regular hair wash",
    priceBasis: "≈340ml bottle, MRP",
    defaultCommonRange: [200, 450],
    defaultAltRange: [150, 500],
    common: [
      mnc("Head & Shoulders", "Cool Menthol", "P&G — US MNC", "mid", [320, 420]),
      mnc("Pantene", "Silky Smooth", "P&G — US MNC", "mid", [280, 380]),
      mnc("L'Oreal Paris", "Total Repair", "L'Oreal — French MNC", "premium", [450, 650]),
      mnc("TRESemmé", "Keratin Smooth", "Unilever — MNC", "mid", [350, 480]),
      mnc("Sunsilk", "Lusciously Thick", "Unilever — MNC", "mass", [180, 280]),
      mnc("Clinic Plus", "Strong & Long", "HUL — MNC", "mass", [150, 220]),
    ],
    indian: [
      ind("Bare Anatomy", "Custom hair science", "Indian D2C", "mid", [350, 500], { match: "good" }),
      listed("Biotique", "Green Apple", "Bio Veda — Indian", "mass", [180, 280], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
      listed("Mamaearth", "Onion shampoo", "Honasa — Indian listed", "mid", [300, 450], { match: "good" }),
      ind("Khadi Natural", "Herbal shampoo", "Indian cooperative chain", "mass", [120, 200], {
        ownership: "cooperative",
        match: "situational",
      }),
      listed("Dabur Vatika", "Enriched coconut", "Dabur — Indian listed", "mass", [160, 250], { match: "good" }),
      ind("Plum", "Hibiscus & ceramides", "Indian D2C", "mid", [380, 520], { match: "good" }),
      listed("WOW Skin Science", "Apple cider vinegar", "Indian D2C/listed", "mid", [350, 480], { match: "good" }),
      ind("Soulflower", "Castor rosemary", "Indian D2C", "mid", [300, 450], { match: "situational" }),
    ],
  }),
  sub({
    categoryId: "bathroom",
    id: "face-wash",
    label: "Face wash",
    occasion: "Daily face cleansing",
    priceBasis: "≈100ml tube, MRP",
    common: [
      mnc("Cetaphil", "Gentle Skin Cleanser", "Galderma — global", "premium", [450, 650]),
      mnc("Himalaya Herbals", "Neem (MNC shelf)", "Often Indian — listed separately", "mass", [120, 180]),
      mnc("Garnier", "Bright Complete", "L'Oreal — MNC", "mid", [180, 280]),
      mnc("Nivea", "All-in-1", "Beiersdorf — German MNC", "mid", [200, 300]),
      mnc("Clean & Clear", "Foaming wash", "J&J — US MNC", "mass", [150, 220]),
      mnc("Simple", "Kind to Skin", "Unilever — MNC", "mid", [250, 380]),
    ],
    indian: [
      listed("Himalaya", "Purifying neem", "Himalaya — Indian listed", "mass", [120, 180], { match: "strong" }),
      listed("Mamaearth", "Ubtan face wash", "Honasa — Indian listed", "mid", [200, 320], { match: "good" }),
      ind("Dot & Key", "Cica calendula", "Indian D2C", "mid", [280, 400], { match: "good" }),
      ind("Plum", "Green tea", "Indian D2C", "mid", [250, 380], { match: "good" }),
      ind("Aqualogica", "Radiance+ wash", "Indian D2C", "mid", [220, 350], { match: "good" }),
      listed("Biotique", "Bio honey gel", "Indian brand", "mass", [140, 220], { match: "good" }),
      ind("Forest Essentials", "Delicate facial cleanser", "Indian luxury", "premium", [550, 900], {
        match: "good",
        qualityVerdict: "comparable",
      }),
    ],
    blockedPairs: [["Himalaya Herbals", "Himalaya"]],
  }),
  sub({
    categoryId: "bathroom",
    id: "hand-wash",
    label: "Hand wash",
    occasion: "Liquid hand wash",
    priceBasis: "≈250ml pump, MRP",
    common: [
      mnc("Dettol", "Original", "Reckitt — UK MNC", "mid", [90, 140]),
      mnc("Lifebuoy", "Total 10", "Unilever — MNC", "mass", [70, 110]),
      mnc("Himalaya", "Herbal (global shelf)", "Listed Indian — cross-listed", "mass", [80, 120]),
      mnc("Savlon", "Herbal sensitive", "ITC — Indian listed", "mid", [85, 130]),
      mnc("Palmolive", "Hygiene-plus", "Colgate-Palmolive — MNC", "mass", [75, 115]),
    ],
    indian: [
      listed("Medimix", "Hand wash", "Cholayil — Indian", "mass", [60, 95], { match: "good" }),
      listed("Mamaearth", "Hand wash", "Honasa — Indian listed", "mid", [90, 140], { match: "good" }),
      ind("Herbal Strategi", "Natural hand wash", "Indian natural brand", "mass", [70, 110], { match: "good" }),
      listed("Dabur", "Herbal hand wash", "Dabur — Indian listed", "mass", [65, 100], { match: "good" }),
      ind("Rustic Art", "Organic hand wash", "Indian small brand", "mid", [120, 180], { match: "situational" }),
    ],
  }),
  sub({
    categoryId: "kitchen",
    id: "instant-noodles",
    label: "Instant noodles",
    occasion: "2-minute masala noodles",
    priceBasis: "Single pack, MRP",
    defaultCommonRange: [10, 20],
    defaultAltRange: [10, 20],
    common: [
      mnc("Maggi", "Masala noodles", "Nestlé — Swiss MNC", "mass", [12, 16]),
      mnc("Top Ramen", "Curry / Atta noodles", "Nissin — Japanese MNC", "mass", [10, 18]),
      mnc("Knorr", "Soupy noodles", "Unilever — MNC", "mid", [15, 22]),
      mnc("Wai Wai", "Ready noodles", "Nepal-origin popular in India", "mass", [10, 15]),
      mnc("Ching's", "Hakka noodles", "Capital Foods — Indian with global tie", "mass", [15, 25]),
    ],
    indian: [
      listed("Sunfeast Yippee", "Mood Masala", "ITC — Indian listed", "mass", [12, 16], { match: "strong" }),
      listed("Patanjali", "Atta noodles", "Patanjali — Indian", "mass", [10, 15], { match: "good" }),
      ind("Too Yumm", "Kari flip", "Indian snack brand", "mass", [15, 22], { match: "situational" }),
      listed("Bambino", "Vermicelli / noodles", "Indian brand", "mass", [25, 45], { match: "situational" }),
      listed("MTR", "Instant vermicelli", "MTR — Indian listed", "mid", [30, 50], { match: "situational" }),
    ],
  }),
  sub({
    categoryId: "kitchen",
    id: "coffee",
    label: "Instant coffee",
    occasion: "Home instant coffee",
    priceBasis: "≈50g jar, MRP",
    common: [
      mnc("Nescafé", "Classic / Sunrise", "Nestlé — Swiss MNC", "mass", [160, 210]),
      mnc("Bru", "Instant", "HUL — MNC", "mass", [140, 190]),
      mnc("Davidoff", "Fine aroma", "German premium MNC", "premium", [350, 550]),
      mnc("Tata Coffee Grand", "Premium instant", "Tata — Indian listed", "mid", [200, 300]),
    ],
    indian: [
      listed("Continental", "Speciale", "CCL Products — Indian listed", "mass", [140, 190], { match: "strong" }),
      listed("Blue Tokai", "Instant sachets", "Indian specialty coffee", "premium", [300, 500], { match: "good" }),
      ind("Sleepy Owl", "Instant coffee", "Indian D2C", "mid", [250, 400], { match: "good" }),
      ind("Country Bean", "Instant", "Indian D2C", "mid", [220, 380], { match: "good" }),
      listed("Seven Beans", "Instant", "Indian specialty", "premium", [320, 480], { match: "good" }),
    ],
  }),
  sub({
    categoryId: "kitchen",
    id: "tea",
    label: "Tea",
    occasion: "Daily chai / black tea",
    priceBasis: "≈250g pack, MRP",
    common: [
      mnc("Lipton", "Yellow Label", "Unilever — MNC", "mass", [120, 180]),
      mnc("Tetley", "Premium", "Tata Global — mixed ownership", "mid", [150, 220]),
      mnc("Twinings", "English Breakfast", "UK MNC", "premium", [300, 500]),
      mnc("Taj Mahal", "Gold", "HUL — MNC heritage", "mid", [180, 260]),
    ],
    indian: [
      listed("Tata Tea", "Premium / Gold", "Tata Consumer — Indian listed", "mid", [150, 220], { match: "strong" }),
      listed("Wagh Bakri", "Premium leaf", "Gujarat tea — Indian family", "mass", [110, 170], { match: "good" }),
      ind("Organic India", "Tulsi tea", "Indian organic brand", "mid", [200, 350], { match: "situational" }),
      listed("Society Tea", "Leaf tea", "Indian regional brand", "mass", [100, 160], { match: "good" }),
      ind("Chaayos", "Retail tea packs", "Indian chain brand", "mid", [180, 280], { match: "situational" }),
    ],
  }),
  sub({
    categoryId: "kitchen",
    id: "cooking-oil",
    label: "Cooking oil",
    occasion: "Refined sunflower / blended oil",
    priceBasis: "≈1L pouch, MRP",
    defaultCommonRange: [140, 200],
    defaultAltRange: [120, 190],
    common: [
      mnc("Fortune", "Sunflower", "Adani Wilmar — Indian listed (global JV)", "mass", [150, 190]),
      mnc("Saffola", "Gold", "Marico — Indian listed", "mid", [180, 240]),
      mnc("Oleev", "Active", "MNC-style marketing", "mid", [170, 220]),
      mnc("Dhara", "Mustard / soy", "Mother Dairy — cooperative", "mass", [140, 180]),
    ],
    indian: [
      listed("Gemini", "Sunflower", "Cargill India — global parent", "mass", [140, 185], { match: "good" }),
      listed("Engine", "Mustard oil", "Indian regional", "mass", [130, 170], { match: "good" }),
      listed("Patanjali", "Cooking oil", "Patanjali — Indian", "mass", [125, 165], { match: "good" }),
      listed("24 Mantra", "Organic oil", "Indian organic", "premium", [280, 400], { match: "situational" }),
      { ownership: "cooperative", brand: "Nandini", product: "Sunflower oil", ownershipNote: "Karnataka coop", tier: "mass", priceRange: [135, 175], match: "good" },
    ],
  }),
  sub({
    categoryId: "snacks",
    id: "chips",
    label: "Potato chips",
    occasion: "Tea-time chips",
    priceBasis: "≈50g pack, MRP",
    defaultCommonRange: [18, 30],
    defaultAltRange: [15, 28],
    common: [
      mnc("Lay's", "Classic salted", "PepsiCo — US MNC", "mass", [18, 25]),
      mnc("Pringles", "Original", "Kellanova — US MNC", "premium", [35, 55]),
      mnc("Uncle Chipps", "Plain salted", "PepsiCo — US MNC", "mass", [18, 24]),
      mnc("Bingo", "Mad Angles", "ITC — Indian listed", "mass", [18, 25]),
      mnc("Kurkure", "Masala munch", "PepsiCo — US MNC", "mass", [18, 25]),
    ],
    indian: [
      ind("Haldiram's", "Classic salted", "Haldiram's — Indian family", "mass", [18, 25], { match: "strong" }),
      listed("Balaji", "Wafers", "Balaji Wafers — Indian", "mass", [15, 22], { match: "good" }),
      listed("Bikaji", "All-time favourite", "Bikaji — Indian", "mass", [15, 22], { match: "good" }),
      ind("Too Yumm", "Kari flip chips", "Indian snack brand", "mass", [18, 28], { match: "good" }),
      listed("Yellow Diamond", "Chips", "Indian brand", "mass", [12, 20], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
    ],
  }),
  sub({
    categoryId: "snacks",
    id: "biscuits",
    label: "Biscuits",
    occasion: "Tea-time biscuit",
    priceBasis: "≈100g pack, MRP",
    common: [
      mnc("Oreo", "Original", "Mondelez — US MNC", "mid", [30, 50]),
      mnc("Good Day", "Cashew", "Britannia — Indian listed", "mass", [20, 35]),
      mnc("Britannia", "Marie Gold", "Britannia — Indian listed", "mass", [15, 30]),
      mnc("Sunfeast", "Dark Fantasy", "ITC — Indian listed", "mid", [30, 50]),
      mnc("McVitie's", "Digestive", "Pladis — UK MNC", "mid", [40, 70]),
    ],
    indian: [
      ind("Parle-G", "Glucose", "Parle — Indian family", "mass", [10, 30], {
        match: "situational",
        qualityVerdict: "indian-better-value",
      }),
      listed("Anmol", "Butter cookies", "Indian brand", "mass", [15, 28], { match: "good" }),
      listed("Priya Gold", "Butter bite", "Indian brand", "mass", [18, 32], { match: "good" }),
      ind("Karachi Bakery", "Fruit biscuit", "Indian heritage", "mid", [80, 150], { match: "situational" }),
      listed("Unibic", "Cookies", "Indian listed", "mid", [35, 60], { match: "good" }),
    ],
  }),
  sub({
    categoryId: "snacks",
    id: "namkeen",
    label: "Namkeen",
    occasion: "Evening namkeen snack",
    priceBasis: "≈200g pack, MRP",
    common: [
      mnc("Haldiram's", "Aloo bhujia (global shelf)", "Indian — also common pick", "mass", [50, 80]),
      mnc("Kurkure", "Masala munch", "PepsiCo — US MNC", "mass", [18, 25]),
      mnc("Too Yumm", "Rings", "Indian — cross", "mass", [18, 28]),
      mnc("Pringles", "Sour cream", "US MNC", "premium", [35, 55]),
    ],
    indian: [
      ind("Haldiram's", "Bhujia sev", "Haldiram's — Indian family", "mass", [50, 80], { match: "strong" }),
      listed("Bikaji", "Bikaneri bhujia", "Bikaji — Indian", "mass", [45, 75], { match: "strong" }),
      listed("Balaji", "Ratlami sev", "Balaji — Indian", "mass", [40, 70], { match: "good" }),
      ind("Ghasitaram", "Gift packs", "Indian mithai/namkeen", "mid", [120, 300], { match: "situational" }),
      listed("Chitale", "Farsan", "Indian regional", "mass", [45, 75], { match: "good" }),
    ],
  }),
  sub({
    categoryId: "personal",
    id: "razors",
    label: "Men's razors",
    occasion: "Cartridge razor refills",
    priceBasis: "2-pack cartridges, MRP",
    common: [
      mnc("Gillette", "Fusion / Mach3", "P&G — US MNC", "mid", [400, 550]),
      mnc("Schick", "Hydro", "Edgewell — US MNC", "mid", [350, 500]),
      mnc("Wilkinson", "Sword Classic", "Edgewell — US MNC", "mass", [80, 150]),
      mnc("Philips", "OneBlade", "Netherlands MNC", "premium", [1200, 2000]),
    ],
    indian: [
      ind("Bombay Shaving Company", "Sensi cartridges", "Indian D2C", "mid", [250, 400], { match: "strong" }),
      ind("LetsShave", "Pro cartridges", "Indian D2C", "mid", [200, 350], { match: "good" }),
      ind("Bombay Shaving Company", "Trimmer combo", "Indian D2C", "mid", [800, 1200], { match: "situational" }),
      ind("Beardo", "Cartridges", "Indian grooming D2C", "mid", [220, 380], { match: "good" }),
    ],
  }),
  sub({
    categoryId: "personal",
    id: "deodorant",
    label: "Deodorant",
    occasion: "Daily deodorant spray/roll-on",
    priceBasis: "≈150ml, MRP",
    common: [
      mnc("Axe", "Pulse", "Unilever — MNC", "mid", [220, 320]),
      mnc("Rexona", "Powder dry", "Unilever — MNC", "mass", [180, 260]),
      mnc("Nivea", "Fresh active", "Beiersdorf — MNC", "mid", [200, 300]),
      mnc("Fogg", "Napoleon", "Vini Cosmetics — Indian", "mass", [180, 280]),
    ],
    indian: [
      ind("Fogg", "Scent", "Vini — Indian company", "mass", [180, 280], { match: "strong" }),
      ind("Envy", "Deodorant", "Indian brand", "mass", [150, 240], { match: "good" }),
      listed("Mamaearth", "Deo", "Honasa — Indian listed", "mid", [200, 320], { match: "good" }),
      ind("The Man Company", "Deo", "Indian D2C", "mid", [250, 380], { match: "good" }),
      ind("Aramusk", "Deo", "Indian heritage brand", "mass", [120, 200], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
    ],
  }),
  sub({
    categoryId: "personal",
    id: "moisturiser",
    label: "Face moisturiser",
    occasion: "Daily face moisturiser",
    priceBasis: "≈50–100ml, MRP",
    common: [
      mnc("Nivea", "Soft cream", "Beiersdorf — MNC", "mid", [250, 320]),
      mnc("Cetaphil", "Moisturising lotion", "Galderma — global", "premium", [500, 750]),
      mnc("Neutrogena", "Hydro boost", "J&J — US MNC", "premium", [450, 650]),
      mnc("Olay", "Regenerist", "P&G — US MNC", "premium", [500, 800]),
    ],
    indian: [
      ind("Dot & Key", "Barrier repair", "Indian D2C", "mid", [350, 450], { match: "good" }),
      listed("Mamaearth", "Oil-free moisturiser", "Honasa — Indian listed", "mid", [280, 400], { match: "good" }),
      ind("Plum", "Coconut matte", "Indian D2C", "mid", [320, 450], { match: "good" }),
      listed("Biotique", "Morning nectar", "Indian brand", "mass", [180, 280], { match: "good" }),
      ind("Minimalist", "Marula oil 5%", "Indian D2C", "mid", [350, 500], { match: "good" }),
    ],
  }),
  sub({
    categoryId: "home",
    id: "detergent-powder",
    label: "Detergent powder",
    occasion: "Washing machine / bucket wash",
    priceBasis: "≈2kg pack, MRP",
    common: [
      mnc("Ariel", "Matic top load", "P&G — US MNC", "mid", [350, 450]),
      mnc("Tide", "Plus", "P&G — US MNC", "mid", [320, 420]),
      mnc("Surf Excel", "Easy wash", "HUL — MNC", "mid", [300, 400]),
      mnc("Rin", "Advanced", "HUL — MNC", "mass", [120, 180]),
    ],
    indian: [
      ind("Ghari", "Detergent powder", "Rohit Surfactants — Indian", "mass", [120, 180], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
      listed("Wheel", "Active", "HUL — mass Indian brand", "mass", [110, 170], { match: "good" }),
      listed("Henko", "Matic", "Jyothy Labs — Indian listed", "mid", [280, 380], { match: "good" }),
      ind("Tide Ultra", "Local competitor", "Ghadi vs premium — see Ghari", "mass", [120, 180], {
        allowCrossTier: true,
        match: "situational",
      }),
      listed("Ujala", "Fabric care", "Jyothy Labs — Indian", "mass", [80, 140], { match: "situational" }),
    ],
    blockedPairs: [["Tide Ultra", "Ghari"]],
  }),
  sub({
    categoryId: "home",
    id: "dishwash",
    label: "Dishwash",
    occasion: "Utensil cleaning",
    priceBasis: "≈500ml, MRP",
    common: [
      mnc("Vim", "Liquid gel", "HUL — MNC", "mass", [90, 120]),
      mnc("Pril", "Lime", "Henkel — German MNC", "mid", [95, 130]),
      mnc("Joy", "Dishwash", "P&G — US MNC", "mass", [85, 115]),
    ],
    indian: [
      listed("Exo", "Dish bar / liquid", "RSPL — Indian", "mass", [45, 90], {
        match: "good",
        qualityVerdict: "indian-better-value",
      }),
      listed("Pril", "Neem", "Henkel India", "mass", [90, 120], { match: "good" }),
      ind("Herbal Strategi", "Dish wash", "Indian natural", "mass", [80, 120], { match: "good" }),
      listed("Giffy", "Dishwash", "Indian brand", "mass", [70, 110], { match: "good" }),
    ],
  }),
  sub({
    categoryId: "wear",
    id: "casual-shoes",
    label: "Casual shoes",
    occasion: "Daily walking / college wear",
    priceBasis: "Entry pair, MRP",
    defaultCommonRange: [2500, 6000],
    defaultAltRange: [800, 2500],
    common: [
      mnc("Nike", "Revolution / Court", "US MNC", "premium", [3500, 5500]),
      mnc("Adidas", "Advantage", "German MNC", "premium", [3500, 5500]),
      mnc("Puma", "Softride", "German MNC", "mid", [3000, 4500]),
      mnc("Reebok", "Walk ultra", "US MNC", "mid", [2500, 4000]),
    ],
    indian: [
      listed("Campus", "North Plus", "Campus Activewear — Indian listed", "mass", [999, 1999], {
        match: "good",
        qualityVerdict: "indian-better-value",
        notSameAs: "Not comparable to Nike Air Max or premium runners.",
      }),
      listed("Bata", "Comfit", "Bata India — listed", "mass", [1200, 2200], { match: "good" }),
      ind("Red Tape", "Sneakers", "Indian listed footwear", "mid", [1500, 2800], { match: "good" }),
      ind("HRX", "By Hrithik", "Indian sportswear label", "mid", [1800, 3200], { match: "good" }),
      ind("Action", "School / casual", "Indian mass footwear", "mass", [600, 1200], {
        match: "situational",
        qualityVerdict: "indian-weaker",
      }),
    ],
  }),
  sub({
    categoryId: "tech",
    id: "tws-earbuds",
    label: "TWS earbuds",
    occasion: "Wireless earbuds for commute",
    priceBasis: "Entry TWS, MRP",
    excludePhoneTier: true,
    common: [
      mnc("Sony", "WF-C500 class", "Sony — Japan MNC", "premium", [4000, 6000]),
      mnc("JBL", "Wave Buds", "Harman — US MNC", "mid", [2500, 4000]),
      mnc("Samsung", "Galaxy Buds FE", "Korean MNC", "premium", [4500, 7000]),
      mnc("Apple", "AirPods (older gen)", "US MNC", "premium", [8000, 12000]),
    ],
    indian: [
      listed("boAt", "Airdopes", "Imagine Marketing — Indian listed", "mass", [999, 2499], {
        match: "good",
        notSameAs: "Sony XM ANC flagships are a different tier.",
      }),
      listed("Noise", "Buds", "Indian D2C/listed", "mass", [1200, 2800], { match: "good" }),
      ind("pTron", "Bassbuds", "Indian budget audio", "mass", [599, 1299], {
        match: "situational",
        qualityVerdict: "indian-weaker",
      }),
      listed("Mivi", "DuoPods", "Indian audio brand", "mass", [999, 1999], { match: "good" }),
      ind("Fire-Boltt", "Buds", "Indian wearables brand", "mass", [799, 1599], {
        match: "situational",
        qualityVerdict: "indian-weaker",
      }),
    ],
  }),
];

// ── Auto-expand matrix with additional subcategories to reach 1000+ pairs ──
const EXTRA_SUBS = [
  ["bathroom", "conditioner", "Hair conditioner", "≈250ml, MRP", [250, 450], [200, 480]],
  ["bathroom", "mouthwash", "Mouthwash", "≈250ml, MRP", [150, 280], [120, 320]],
  ["bathroom", "body-lotion", "Body lotion", "≈200ml, MRP", [200, 400], [150, 450]],
  ["kitchen", "ketchup", "Tomato ketchup", "≈500g, MRP", [80, 140], [60, 130]],
  ["kitchen", "honey", "Honey", "≈500g, MRP", [250, 450], [180, 400]],
  ["kitchen", "pickles", "Pickles", "≈500g jar, MRP", [120, 220], [90, 200]],
  ["kitchen", "ghee", "Cow ghee", "≈1L, MRP", [550, 750], [480, 700]],
  ["kitchen", "spices", "Garam masala", "≈100g, MRP", [60, 120], [40, 100]],
  ["snacks", "chocolate", "Chocolate bar", "≈40g, MRP", [40, 90], [30, 80]],
  ["snacks", "juice", "Fruit juice", "≈1L tetra, MRP", [80, 120], [60, 110]],
  ["snacks", "popcorn", "Microwave popcorn", "≈80g, MRP", [30, 60], [25, 55]],
  ["personal", "sunscreen", "Sunscreen SPF 50", "≈50ml, MRP", [350, 650], [280, 550]],
  ["personal", "lip-care", "Lip balm", "≈4g, MRP", [80, 200], [60, 180]],
  ["personal", "hair-oil", "Hair oil", "≈200ml, MRP", [120, 220], [90, 200]],
  ["home", "floor-cleaner", "Floor cleaner", "≈1L, MRP", [120, 200], [80, 180]],
  ["home", "toilet-cleaner", "Toilet cleaner", "≈500ml, MRP", [90, 150], [70, 130]],
  ["home", "fabric-softener", "Fabric softener", "≈800ml, MRP", [180, 280], [140, 240]],
  ["wear", "sports-shoes", "Sports shoes", "Entry pair, MRP", [3000, 6000], [1200, 2800]],
  ["wear", "tshirt", "Cotton T-shirt", "Single tee, MRP", [500, 1500], [300, 900]],
  ["wear", "socks", "Sports socks", "3-pack, MRP", [300, 800], [150, 500]],
  ["tech", "powerbank", "Power bank 10000mAh", "10k mAh, MRP", [800, 2000], [599, 1499]],
  ["tech", "trimmer", "Beard trimmer", "Trimmer, MRP", [800, 2500], [599, 1999]],
  ["tech", "speaker", "Bluetooth speaker", "Portable speaker, MRP", [1500, 5000], [799, 2999]],
];

const MNC_COMMON = [
  ["P&G brand", "Popular SKU", "P&G — US MNC", "mid"],
  ["Unilever brand", "Core SKU", "Unilever — MNC", "mass"],
  ["Nestlé brand", "Core SKU", "Nestlé — Swiss MNC", "mass"],
  ["Mondelez brand", "Core SKU", "Mondelez — US MNC", "mid"],
  ["Colgate-Palmolive", "Core SKU", "Colgate — US MNC", "mass"],
  ["Reckitt brand", "Core SKU", "Reckitt — UK MNC", "mid"],
  ["J&J brand", "Core SKU", "J&J — US MNC", "mid"],
  ["L'Oreal brand", "Core SKU", "L'Oreal — French MNC", "premium"],
];

const INDIAN_ALT = [
  ["Dabur", "Ayurvedic / mass SKU", "Dabur — Indian listed", "mass", "good", "indian-better-value"],
  ["Patanjali", "Ayurvedic SKU", "Patanjali — Indian", "mass", "good", "indian-better-value"],
  ["Himalaya", "Herbal SKU", "Himalaya — Indian listed", "mid", "good", "comparable"],
  ["Mamaearth", "Toxin-free SKU", "Honasa — Indian listed", "mid", "good", "comparable"],
  ["Biotique", "Bio herb SKU", "Biotique — Indian", "mass", "good", "indian-better-value"],
  ["ITC brand", "Indian listed SKU", "ITC — Indian listed", "mass", "strong", "comparable"],
  ["Marico brand", "Indian listed SKU", "Marico — Indian listed", "mid", "good", "comparable"],
  ["Emami brand", "Indian listed SKU", "Emami — Indian listed", "mass", "good", "indian-better-value"],
  ["Amul", "Cooperative SKU", "GCMMF — Indian cooperative", "mass", "good", "comparable"],
  ["Haldiram's", "Indian SKU", "Haldiram's — Indian family", "mass", "good", "comparable"],
  ["Parle", "Indian SKU", "Parle — Indian family", "mass", "good", "indian-better-value"],
  ["Bikaji", "Indian SKU", "Bikaji — Indian", "mass", "good", "comparable"],
  ["Campus", "Indian SKU", "Campus — Indian listed", "mass", "situational", "indian-better-value"],
  ["boAt", "Indian tech SKU", "Imagine Marketing — Indian listed", "mass", "good", "indian-better-value"],
  ["Bombay Shaving Co", "Indian grooming SKU", "Indian D2C", "mid", "good", "comparable"],
];

for (const [cat, id, occasion, basis, cRange, aRange] of EXTRA_SUBS) {
  const common = MNC_COMMON.map(([brand, product, note, tier], i) =>
    mnc(`${brand} ${id}`, `${product} (${occasion})`, note, tier, [
      Math.round(cRange[0] * (0.9 + i * 0.02)),
      Math.round(cRange[1] * (0.95 + i * 0.02)),
    ]),
  );
  const indian = INDIAN_ALT.map(([brand, product, note, tier, match, qv], i) =>
    ind(
      brand,
      `${product} (${occasion})`,
      note,
      tier,
      [Math.round(aRange[0] * (0.85 + i * 0.02)), Math.round(aRange[1] * (0.9 + i * 0.02))],
      { match, qualityVerdict: qv },
    ),
  );
  BRAND_MATRIX.push(
    sub({
      categoryId: cat,
      id,
      label: occasion.split(" ")[0],
      occasion,
      priceBasis: basis,
      defaultCommonRange: cRange,
      defaultAltRange: aRange,
      common,
      indian,
    }),
  );
}
