export type ResourceKind =
  | "book"
  | "channel"
  | "essay"
  | "site"
  | "master"
  | "talk"
  | "course";

export type Resource = {
  id: string;
  kind: ResourceKind;
  title: string;
  by?: string;
  note: string;
  href: string;
};

export type Craft = {
  id: string;
  name: string;
  tagline: string;
  hue: string;
  intro: string;
  resources: Resource[];
};

export const KIND_META: Record<
  ResourceKind,
  { label: string; verb: string; order: number }
> = {
  book: { label: "Books", verb: "Read", order: 1 },
  essay: { label: "Essays", verb: "Read", order: 2 },
  channel: { label: "Channels", verb: "Watch", order: 3 },
  talk: { label: "Talks", verb: "Watch", order: 4 },
  course: { label: "Courses", verb: "Study", order: 5 },
  site: { label: "Sites", verb: "Explore", order: 6 },
  master: { label: "Masters", verb: "Study", order: 7 },
};

const songwriting: Craft = {
  id: "songwriting",
  name: "Songwriting",
  tagline: "Three chords and the truth.",
  hue: "#8B5CF6",
  intro:
    "A song is the smallest, oldest piece of art with a beginning, a middle and an end. These are the books and conversations the working writers swear by.",
  resources: [
    {
      id: "sw-tunesmith",
      kind: "book",
      title: "Tunesmith",
      by: "Jimmy Webb",
      note: "By the writer of MacArthur Park and Wichita Lineman. The best comprehensive book on the craft.",
      href: "https://www.goodreads.com/book/show/79635",
    },
    {
      id: "sw-pattison",
      kind: "book",
      title: "Writing Better Lyrics",
      by: "Pat Pattison",
      note: "The Berklee professor's classic. Object writing, prosody, structure.",
      href: "https://www.goodreads.com/book/show/4011081",
    },
    {
      id: "sw-zollo",
      kind: "book",
      title: "Songwriters On Songwriting",
      by: "Paul Zollo",
      note: "Long interviews with Dylan, Cohen, Mitchell, Simon and many more on how the songs actually came.",
      href: "https://www.goodreads.com/book/show/187728",
    },
    {
      id: "sw-rolling",
      kind: "talk",
      title: "Rick Rubin: The Creative Act",
      note: "The legendary producer's audiobook and interviews on what creating actually is.",
      href: "https://en.wikipedia.org/wiki/Rick_Rubin",
    },
    {
      id: "sw-sodajerker",
      kind: "talk",
      title: "Sodajerker on Songwriting",
      note: "The longest-running podcast of long-form interviews with hit songwriters.",
      href: "https://www.sodajerker.com/podcast/",
    },
    {
      id: "sw-dylan",
      kind: "master",
      title: "Bob Dylan",
      note: "The body of work to study first. Listen to Blood on the Tracks and read the Nobel lecture.",
      href: "https://en.wikipedia.org/wiki/Bob_Dylan",
    },
    {
      id: "sw-mitchell",
      kind: "master",
      title: "Joni Mitchell",
      note: "The greatest songwriter alive on a tuning system most pop never touches. Start with Blue.",
      href: "https://en.wikipedia.org/wiki/Joni_Mitchell",
    },
    {
      id: "sw-cohen",
      kind: "master",
      title: "Leonard Cohen",
      note: "Took five years to write Hallelujah. The patron saint of slow, deliberate writing.",
      href: "https://en.wikipedia.org/wiki/Leonard_Cohen",
    },
  ],
};

const standup: Craft = {
  id: "standup",
  name: "Stand-up Comedy",
  tagline: "Five minutes of truth, on cue.",
  hue: "#FACC15",
  intro:
    "There is no school for stand-up. The classroom is the open mic. These are the books and conversations that the working comics actually study.",
  resources: [
    {
      id: "su-judy-carter",
      kind: "book",
      title: "The Comedy Bible",
      by: "Judy Carter",
      note: "The most-recommended workbook for new stand-ups. Premise to closer.",
      href: "https://www.goodreads.com/book/show/85820",
    },
    {
      id: "su-step-by-step",
      kind: "book",
      title: "Step by Step to Stand-up Comedy",
      by: "Greg Dean",
      note: "The setup-punchline mechanic taught with care. Long the textbook for working classes in LA.",
      href: "https://www.goodreads.com/book/show/580089",
    },
    {
      id: "su-born-standing",
      kind: "book",
      title: "Born Standing Up",
      by: "Steve Martin",
      note: "Steve Martin's memoir of his eighteen years of struggling. The honest cost of comedy.",
      href: "https://en.wikipedia.org/wiki/Born_Standing_Up",
    },
    {
      id: "su-sick-in-the-head",
      kind: "book",
      title: "Sick in the Head",
      by: "Judd Apatow",
      note: "Thirty years of conversations with the great comics about how comedy actually works.",
      href: "https://en.wikipedia.org/wiki/Sick_in_the_Head",
    },
    {
      id: "su-comedians-cars",
      kind: "talk",
      title: "Comedians in Cars Getting Coffee",
      by: "Jerry Seinfeld",
      note: "The accidental masterclass. Watch how working comics actually talk to each other.",
      href: "https://en.wikipedia.org/wiki/Comedians_in_Cars_Getting_Coffee",
    },
    {
      id: "su-louis-ck-talk",
      kind: "talk",
      title: "Inside the Actors Studio - Comedy",
      note: "Long-form conversations on craft with Robin Williams, Dave Chappelle, and the great stand-ups.",
      href: "https://en.wikipedia.org/wiki/Inside_the_Actors_Studio",
    },
    {
      id: "su-pryor",
      kind: "master",
      title: "Richard Pryor",
      note: "The most important stand-up of the 20th century. Watch Live in Concert.",
      href: "https://en.wikipedia.org/wiki/Richard_Pryor",
    },
    {
      id: "su-carlin",
      kind: "master",
      title: "George Carlin",
      note: "Forty years, fourteen specials, language as instrument. Watch Jammin' in New York.",
      href: "https://en.wikipedia.org/wiki/George_Carlin",
    },
  ],
};

const programming: Craft = {
  id: "programming",
  name: "Programming",
  tagline: "Make a computer do something true.",
  hue: "#10B981",
  intro:
    "Programming has more daily writing than any other craft. These are the books and essays the working senior engineers actually return to.",
  resources: [
    {
      id: "pg-sicp",
      kind: "book",
      title: "Structure and Interpretation of Computer Programs",
      by: "Abelson and Sussman",
      note: "The famous MIT introduction to computation. Free in full online. Hardest, most important first book.",
      href: "https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/index.html",
    },
    {
      id: "pg-pragmatic",
      kind: "book",
      title: "The Pragmatic Programmer",
      by: "Hunt and Thomas",
      note: "A career's worth of habits and aphorisms in 300 pages. Most-quoted book in software.",
      href: "https://en.wikipedia.org/wiki/The_Pragmatic_Programmer",
    },
    {
      id: "pg-code",
      kind: "book",
      title: "Code",
      by: "Charles Petzold",
      note: "From light bulbs to a working computer, told as a story. Read this before any other systems book.",
      href: "https://en.wikipedia.org/wiki/Code:_The_Hidden_Language_of_Computer_Hardware_and_Software",
    },
    {
      id: "pg-refactoring",
      kind: "book",
      title: "Refactoring",
      by: "Martin Fowler",
      note: "The vocabulary every team uses for improving running code without breaking it.",
      href: "https://refactoring.com/",
    },
    {
      id: "pg-tao",
      kind: "book",
      title: "The Art of Computer Programming",
      by: "Donald Knuth",
      note: "The thirty-year masterpiece. Most engineers own it; the very best read it.",
      href: "https://en.wikipedia.org/wiki/The_Art_of_Computer_Programming",
    },
    {
      id: "pg-norvig",
      kind: "essay",
      title: "Teach Yourself Programming in Ten Years",
      by: "Peter Norvig",
      note: "The honest essay on becoming actually good at programming. Antidote to every 21-day book.",
      href: "https://norvig.com/21-days.html",
    },
    {
      id: "pg-pg-essays",
      kind: "essay",
      title: "Paul Graham Essays",
      note: "Twenty years of clear writing about hackers, startups, and how to think.",
      href: "https://paulgraham.com/articles.html",
    },
    {
      id: "pg-joel",
      kind: "essay",
      title: "Joel on Software",
      by: "Joel Spolsky",
      note: "The classic blog of pragmatic, opinionated software engineering essays.",
      href: "https://www.joelonsoftware.com/",
    },
  ],
};

const woodworking: Craft = {
  id: "woodworking",
  name: "Woodworking",
  tagline: "Sharp tools, square joints.",
  hue: "#92400E",
  intro:
    "Hand tools, then machines. Sharpening, then everything else. The classic working knowledge of woodworking lives in these resources.",
  resources: [
    {
      id: "ww-essential",
      kind: "book",
      title: "The Essential Woodworker",
      by: "Robert Wearing",
      note: "The most recommended single book on hand-tool woodworking. Every page is a workshop.",
      href: "https://lostartpress.com/products/the-essential-woodworker",
    },
    {
      id: "ww-understanding-wood",
      kind: "book",
      title: "Understanding Wood",
      by: "R. Bruce Hoadley",
      note: "The wood scientist's classic. Why wood moves, splits, glues, finishes. Every working maker has a copy.",
      href: "https://www.tauntonstore.com/understanding-wood-a-craftsman-s-guide-to-wood-technology.html",
    },
    {
      id: "ww-anarchist",
      kind: "book",
      title: "The Anarchist's Workbench",
      by: "Christopher Schwarz",
      note: "Free PDF from Lost Art Press. Builds a workbench and an entire philosophy.",
      href: "https://blog.lostartpress.com/2020/05/15/free-download-the-anarchists-workbench/",
    },
    {
      id: "ww-paul-sellers",
      kind: "channel",
      title: "Paul Sellers",
      note: "The English master of hand-tool woodworking. Calm, thorough, every video a lesson.",
      href: "https://www.youtube.com/@PaulSellersWoodwork",
    },
    {
      id: "ww-rex-krueger",
      kind: "channel",
      title: "Rex Krueger",
      note: "Hand tools, low budget, high taste. Excellent for the beginner with a small apartment.",
      href: "https://www.youtube.com/@RexKrueger",
    },
    {
      id: "ww-wood-whisperer",
      kind: "channel",
      title: "The Wood Whisperer",
      by: "Marc Spagnuolo",
      note: "Twenty years of project-based teaching. Friendly, exact, modern shop.",
      href: "https://www.youtube.com/@TheWoodWhisperer",
    },
    {
      id: "ww-ishitani",
      kind: "channel",
      title: "Ishitani Furniture",
      note: "Wordless, immaculate Japanese furniture making. Watch and learn to slow down.",
      href: "https://www.youtube.com/@IshitaniFurniture",
    },
    {
      id: "ww-finewoodworking",
      kind: "site",
      title: "Fine Woodworking",
      note: "The magazine of record. Articles, plans and a deep technique archive.",
      href: "https://www.finewoodworking.com/",
    },
  ],
};

const cooking: Craft = {
  id: "cooking",
  name: "Cooking",
  tagline: "Heat, salt, attention.",
  hue: "#EF4444",
  intro:
    "Cooking well is repetition under feedback. These are the books that teach the why and the channels that show the how.",
  resources: [
    {
      id: "ck-salt-fat",
      kind: "book",
      title: "Salt, Fat, Acid, Heat",
      by: "Samin Nosrat",
      note: "The four elements, gorgeously illustrated. The most-recommended modern cookbook for understanding food.",
      href: "https://en.wikipedia.org/wiki/Salt,_Fat,_Acid,_Heat",
    },
    {
      id: "ck-food-lab",
      kind: "book",
      title: "The Food Lab",
      by: "J. Kenji Lopez-Alt",
      note: "The science of home cooking, exhaustively tested. The reference book in most modern kitchens.",
      href: "https://en.wikipedia.org/wiki/The_Food_Lab",
    },
    {
      id: "ck-on-food",
      kind: "book",
      title: "On Food and Cooking",
      by: "Harold McGee",
      note: "The encyclopedia of why food behaves the way it does. The book the chefs read.",
      href: "https://en.wikipedia.org/wiki/On_Food_and_Cooking",
    },
    {
      id: "ck-bittman",
      kind: "book",
      title: "How to Cook Everything",
      by: "Mark Bittman",
      note: "If you only own one cookbook. The flexible American kitchen reference.",
      href: "https://en.wikipedia.org/wiki/How_to_Cook_Everything",
    },
    {
      id: "ck-kenji",
      kind: "channel",
      title: "J. Kenji Lopez-Alt",
      note: "POV cooking from one of the best food writers alive. The kitchen is the classroom.",
      href: "https://www.youtube.com/@JKenjiLopezAlt",
    },
    {
      id: "ck-babish",
      kind: "channel",
      title: "Babish Culinary Universe",
      note: "Andrew Rea cooks the dish from the show, then teaches it properly. The gateway drug for home cooks.",
      href: "https://www.youtube.com/@babishculinaryuniverse",
    },
    {
      id: "ck-jean-pierre",
      kind: "channel",
      title: "Chef Jean-Pierre",
      note: "Decades of French technique taught by a beloved old-school chef. Onions, hello?",
      href: "https://www.youtube.com/@ChefJeanPierre",
    },
    {
      id: "ck-ragusea",
      kind: "channel",
      title: "Adam Ragusea",
      note: "Practical, opinionated, food-science-aware home cooking with a journalist's eye.",
      href: "https://www.youtube.com/@aragusea",
    },
    {
      id: "ck-serious-eats",
      kind: "site",
      title: "Serious Eats",
      note: "The most rigorously tested recipe site on the internet, founded by Kenji.",
      href: "https://www.seriouseats.com/",
    },
    {
      id: "ck-nyt-cooking",
      kind: "site",
      title: "NYT Cooking",
      note: "The largest curated recipe library, with notes from millions of cooks.",
      href: "https://cooking.nytimes.com/",
    },
  ],
};

const crochet: Craft = {
  id: "crochet-knitting",
  name: "Crochet & Knitting",
  tagline: "Yarn, time, and a little patience.",
  hue: "#F472B6",
  intro:
    "A craft you can carry anywhere, with one of the warmest communities on the internet. Start with the slow free tutorials, then graduate to Ravelry.",
  resources: [
    {
      id: "ck-ravelry",
      kind: "site",
      title: "Ravelry",
      note: "The world's pattern library and yarn community. Free patterns, queues, and the project pages of every knitter you will ever meet.",
      href: "https://www.ravelry.com/",
    },
    {
      id: "ck-bella-coco",
      kind: "channel",
      title: "Bella Coco Crochet",
      note: "The clearest, kindest absolute-beginner crochet teacher on YouTube.",
      href: "https://www.youtube.com/@BellaCoco",
    },
    {
      id: "ck-crochet-crowd",
      kind: "channel",
      title: "The Crochet Crowd",
      note: "Twenty years of free patterns and tutorials with Mikey. Huge, warm community.",
      href: "https://www.youtube.com/@TheCrochetCrowd",
    },
    {
      id: "ck-sheep-stitch",
      kind: "channel",
      title: "Sheep and Stitch",
      note: "Designer Davina Choy teaches knitting from the cast-on to your first sweater.",
      href: "https://www.youtube.com/@SheepAndStitch",
    },
    {
      id: "ck-verypink",
      kind: "channel",
      title: "VeryPink Knits",
      note: "Decades of meticulous knitting technique videos from teacher Staci Perry.",
      href: "https://www.youtube.com/@verypinkknits",
    },
    {
      id: "ck-purlsoho",
      kind: "site",
      title: "Purl Soho",
      note: "Free, beautifully styled knitting and crochet patterns and tutorials from the New York shop.",
      href: "https://www.purlsoho.com/create/",
    },
    {
      id: "ck-knitting-help",
      kind: "site",
      title: "Knitting Help",
      note: "The original encyclopaedic knitting video library. Every stitch and fix you will need.",
      href: "https://www.knittinghelp.com/",
    },
    {
      id: "ck-stoller",
      kind: "book",
      title: "Stitch n Bitch",
      by: "Debbie Stoller",
      note: "The 2000s book that revived knitting for a new generation. Still the friendliest first book on the shelf.",
      href: "https://www.goodreads.com/book/show/22335",
    },
  ],
};

const drawing: Craft = {
  id: "drawing-painting",
  name: "Drawing & Painting",
  tagline: "Mileage, then mastery.",
  hue: "#EC4899",
  intro:
    "The path is older than school: draw from life, study the masters, repeat. These are the modern teachers and books that move beginners fastest.",
  resources: [
    {
      id: "dp-right-side",
      kind: "book",
      title: "Drawing on the Right Side of the Brain",
      by: "Betty Edwards",
      note: "The book that famously teaches anyone to draw in a few weeks. Still the best place to start.",
      href: "https://en.wikipedia.org/wiki/Drawing_on_the_Right_Side_of_the_Brain",
    },
    {
      id: "dp-natural-way",
      kind: "book",
      title: "The Natural Way to Draw",
      by: "Kimon Nicolaides",
      note: "A 30-week studio course in a book. Gesture, contour, weight.",
      href: "https://en.wikipedia.org/wiki/Kimon_Nicola%C3%AFdes",
    },
    {
      id: "dp-color-light",
      kind: "book",
      title: "Color and Light",
      by: "James Gurney",
      note: "The most loved working artist's guide to realist colour. Plein air at its core.",
      href: "https://gurneyjourney.blogspot.com/",
    },
    {
      id: "dp-loomis",
      kind: "book",
      title: "Figure Drawing for All It's Worth",
      by: "Andrew Loomis",
      note: "The classic figure drawing manual. The Loomis method is still taught everywhere.",
      href: "https://en.wikipedia.org/wiki/Andrew_Loomis",
    },
    {
      id: "dp-proko",
      kind: "channel",
      title: "Proko",
      by: "Stan Prokopenko",
      note: "Anatomy, gesture, perspective. The most polished free drawing curriculum on the internet.",
      href: "https://www.proko.com/",
    },
    {
      id: "dp-marco-bucci",
      kind: "channel",
      title: "Marco Bucci",
      note: "Colour theory and painting principles taught with quiet authority.",
      href: "https://www.youtube.com/@marcobucci",
    },
    {
      id: "dp-james-gurney",
      kind: "channel",
      title: "James Gurney",
      note: "The Dinotopia author paints in oils, gouache and pencil, on location, on camera.",
      href: "https://www.youtube.com/@JamesGurneyArt",
    },
    {
      id: "dp-line-of-action",
      kind: "site",
      title: "Line of Action",
      note: "Free timed figure-drawing references and gesture practice tools.",
      href: "https://line-of-action.com/",
    },
  ],
};

const music: Craft = {
  id: "music-production",
  name: "Music Production",
  tagline: "From bedroom to record.",
  hue: "#22C55E",
  intro:
    "Modern music is made on screens, but the ear and the song still rule. Books for theory and engineering, channels for the daily craft.",
  resources: [
    {
      id: "mp-mixing-secrets",
      kind: "book",
      title: "Mixing Secrets for the Small Studio",
      by: "Mike Senior",
      note: "The most practical mixing book for the bedroom producer. Explains why every choice matters.",
      href: "https://www.cambridge-mt.com/ms/feedback/",
    },
    {
      id: "mp-mixing-engineer",
      kind: "book",
      title: "The Mixing Engineer's Handbook",
      by: "Bobby Owsinski",
      note: "Six elements of a great mix. The classroom standard for working engineers.",
      href: "https://www.goodreads.com/book/show/2126061",
    },
    {
      id: "mp-rick-beato",
      kind: "channel",
      title: "Rick Beato",
      note: "What Makes This Song Great, ear training, theory in plain speech. A working producer with great ears.",
      href: "https://www.youtube.com/@RickBeato",
    },
    {
      id: "mp-adam-neely",
      kind: "channel",
      title: "Adam Neely",
      note: "The smartest, friendliest music theory channel on the internet.",
      href: "https://www.youtube.com/@AdamNeely",
    },
    {
      id: "mp-andrew-huang",
      kind: "channel",
      title: "Andrew Huang",
      note: "Sampling, sound design, gear, songwriting. A complete modern producer.",
      href: "https://www.youtube.com/@andrewhuang",
    },
    {
      id: "mp-in-the-mix",
      kind: "channel",
      title: "In The Mix",
      by: "Michael Wynne",
      note: "Long-form mixing tutorials with real songs, no fluff.",
      href: "https://www.youtube.com/@MichaelWynneInTheMix",
    },
    {
      id: "mp-tape-notes",
      kind: "talk",
      title: "Tape Notes Podcast",
      note: "Producers and artists walk through their records, channel by channel.",
      href: "https://tapenotes.co.uk/",
    },
    {
      id: "mp-sos",
      kind: "site",
      title: "Sound on Sound",
      note: "The deepest, longest-running magazine of recording and mixing technique.",
      href: "https://www.soundonsound.com/",
    },
  ],
};

const photography: Craft = {
  id: "photography",
  name: "Photography",
  tagline: "Seeing, framed.",
  hue: "#F59E0B",
  intro:
    "Great photography is a long apprenticeship in looking. These are the books, channels and bodies of work that train the eye.",
  resources: [
    {
      id: "ph-sontag",
      kind: "book",
      title: "On Photography",
      by: "Susan Sontag",
      note: "The defining book of essays on what a photograph is, what it does to us, and what it costs.",
      href: "https://en.wikipedia.org/wiki/On_Photography",
    },
    {
      id: "ph-camera-lucida",
      kind: "book",
      title: "Camera Lucida",
      by: "Roland Barthes",
      note: "The slim, devastating meditation on the photograph and the mother. Every serious photographer reads this.",
      href: "https://en.wikipedia.org/wiki/Camera_Lucida",
    },
    {
      id: "ph-eye",
      kind: "book",
      title: "The Photographer's Eye",
      by: "Michael Freeman",
      note: "The most cited modern textbook on composition, design and visual logic.",
      href: "https://www.goodreads.com/book/show/1827712.The_Photographer_s_Eye",
    },
    {
      id: "ph-understanding-exposure",
      kind: "book",
      title: "Understanding Exposure",
      by: "Bryan Peterson",
      note: "The clearest first book on aperture, shutter, and ISO ever written.",
      href: "https://www.goodreads.com/book/show/7187825-understanding-exposure-3rd-edition",
    },
    {
      id: "ph-sean-tucker",
      kind: "channel",
      title: "Sean Tucker",
      note: "Calm, philosophical videos on seeing and the inner life of the photographer.",
      href: "https://www.youtube.com/@seantucker",
    },
    {
      id: "ph-art-of-photography",
      kind: "channel",
      title: "The Art of Photography",
      by: "Ted Forbes",
      note: "Long-running channel on the masters, the history and the craft.",
      href: "https://www.youtube.com/@theartofphotography",
    },
    {
      id: "ph-magnum",
      kind: "site",
      title: "Magnum Photos",
      note: "The cooperative agency of Cartier-Bresson and Capa. The free editorial archive is a school in itself.",
      href: "https://www.magnumphotos.com/",
    },
    {
      id: "ph-cartier-bresson",
      kind: "master",
      title: "Henri Cartier-Bresson",
      note: "The decisive moment. The patron saint of street photography.",
      href: "https://en.wikipedia.org/wiki/Henri_Cartier-Bresson",
    },
    {
      id: "ph-vivian-maier",
      kind: "master",
      title: "Vivian Maier",
      note: "The Chicago nanny who shot 150,000 frames in private. Now considered one of the great street photographers.",
      href: "https://en.wikipedia.org/wiki/Vivian_Maier",
    },
    {
      id: "ph-saul-leiter",
      kind: "master",
      title: "Saul Leiter",
      note: "Colour, weather, glass, patience. New York seen sideways.",
      href: "https://en.wikipedia.org/wiki/Saul_Leiter",
    },
    {
      id: "ph-ansel-adams",
      kind: "master",
      title: "Ansel Adams",
      note: "The Zone System and the American landscape at its most cathedral.",
      href: "https://en.wikipedia.org/wiki/Ansel_Adams",
    },
  ],
};

const writing: Craft = {
  id: "writing",
  name: "Writing",
  tagline: "Sentences that earn the next sentence.",
  hue: "#0EA5E9",
  intro:
    "Reading widely and writing daily is the whole secret. These are the books and houses that working writers actually keep open.",
  resources: [
    {
      id: "wr-on-writing",
      kind: "book",
      title: "On Writing",
      by: "Stephen King",
      note: "Half memoir, half toolbox. The closest thing to a friendly working master in your hand.",
      href: "https://en.wikipedia.org/wiki/On_Writing:_A_Memoir_of_the_Craft",
    },
    {
      id: "wr-bird",
      kind: "book",
      title: "Bird by Bird",
      by: "Anne Lamott",
      note: "The shitty first draft. Permission and stamina for anyone afraid of the page.",
      href: "https://en.wikipedia.org/wiki/Bird_by_Bird",
    },
    {
      id: "wr-elements",
      kind: "book",
      title: "The Elements of Style",
      by: "Strunk and White",
      note: "Read it once a year. The shortest book that will most improve your prose.",
      href: "https://en.wikipedia.org/wiki/The_Elements_of_Style",
    },
    {
      id: "wr-war-art",
      kind: "book",
      title: "The War of Art",
      by: "Steven Pressfield",
      note: "On Resistance, the inner force that stops every creative person. Brutally short and useful.",
      href: "https://en.wikipedia.org/wiki/The_War_of_Art",
    },
    {
      id: "wr-zinsser",
      kind: "book",
      title: "On Writing Well",
      by: "William Zinsser",
      note: "The classic guide to non-fiction. Clarity, simplicity, brevity, humanity.",
      href: "https://en.wikipedia.org/wiki/William_Zinsser",
    },
    {
      id: "wr-sanderson",
      kind: "course",
      title: "Brandon Sanderson's BYU Lectures",
      note: "A free, full-length university course on writing genre fiction, taught by a working master.",
      href: "https://www.youtube.com/@WriteAboutDragons",
    },
    {
      id: "wr-paris-review",
      kind: "site",
      title: "The Paris Review Interviews",
      note: "Sixty years of long-form Q and As with the great writers, on writing. Free archive.",
      href: "https://www.theparisreview.org/interviews",
    },
    {
      id: "wr-marginalian",
      kind: "site",
      title: "The Marginalian",
      by: "Maria Popova",
      note: "Twenty years of essays on art, science, and what it means to live a full life. A house library on the open web.",
      href: "https://www.themarginalian.org/",
    },
    {
      id: "wr-lithub",
      kind: "site",
      title: "Literary Hub",
      note: "Daily essays, craft pieces, and excerpts from working writers and editors.",
      href: "https://lithub.com/",
    },
    {
      id: "wr-just-write",
      kind: "channel",
      title: "Just Write",
      note: "Story craft video essays focused on what makes a script or scene actually work.",
      href: "https://www.youtube.com/@JustWrite",
    },
  ],
};

const acting: Craft = {
  id: "acting",
  name: "Acting",
  tagline: "Truthful behaviour under imaginary circumstances.",
  hue: "#A855F7",
  intro:
    "Every serious tradition of acting comes back to the same problem: live truthfully on cue. These are the foundational books, teachers, and conversations.",
  resources: [
    {
      id: "act-stanislavski",
      kind: "book",
      title: "An Actor Prepares",
      by: "Konstantin Stanislavski",
      note: "The first book of the System and the source of nearly every acting school you have heard of.",
      href: "https://en.wikipedia.org/wiki/An_Actor_Prepares",
    },
    {
      id: "act-uta-hagen",
      kind: "book",
      title: "Respect for Acting",
      by: "Uta Hagen",
      note: "Practical, demanding, humane. The book most working stage actors quote when pressed.",
      href: "https://en.wikipedia.org/wiki/Uta_Hagen",
    },
    {
      id: "act-meisner",
      kind: "book",
      title: "Sanford Meisner on Acting",
      by: "Sanford Meisner and Dennis Longwell",
      note: "A year inside the Meisner classroom, exercise by exercise. Reality of doing.",
      href: "https://en.wikipedia.org/wiki/Sanford_Meisner",
    },
    {
      id: "act-shurtleff",
      kind: "book",
      title: "Audition",
      by: "Michael Shurtleff",
      note: "The twelve guideposts. Still the most clear-eyed audition book ever written.",
      href: "https://en.wikipedia.org/wiki/Michael_Shurtleff",
    },
    {
      id: "act-true-false",
      kind: "book",
      title: "True and False",
      by: "David Mamet",
      note: "A short, contrarian provocation about heresy and common sense in acting.",
      href: "https://en.wikipedia.org/wiki/True_and_False:_Heresy_and_Common_Sense_for_the_Actor",
    },
    {
      id: "act-stagemilk",
      kind: "site",
      title: "StageMilk",
      note: "Free monologues, scene work and Shakespeare breakdowns from working actors.",
      href: "https://www.stagemilk.com/",
    },
    {
      id: "act-bafta-guru",
      kind: "site",
      title: "BAFTA Guru",
      note: "Long-form on-stage interviews with working screen actors and directors.",
      href: "https://guru.bafta.org/",
    },
    {
      id: "act-actors-studio",
      kind: "talk",
      title: "Inside the Actors Studio",
      note: "Three decades of long, unhurried conversations with the great screen actors.",
      href: "https://en.wikipedia.org/wiki/Inside_the_Actors_Studio",
    },
    {
      id: "act-strasberg",
      kind: "master",
      title: "Lee Strasberg and the Method",
      note: "The American adaptation of Stanislavski. Origin of Brando, De Niro and Pacino.",
      href: "https://en.wikipedia.org/wiki/Lee_Strasberg",
    },
    {
      id: "act-adler",
      kind: "master",
      title: "Stella Adler",
      note: "Imagination over emotional memory. Brando's most important teacher.",
      href: "https://en.wikipedia.org/wiki/Stella_Adler",
    },
    {
      id: "act-day-lewis",
      kind: "master",
      title: "Daniel Day-Lewis",
      note: "The contemporary high-water mark for preparation and full immersion.",
      href: "https://en.wikipedia.org/wiki/Daniel_Day-Lewis",
    },
    {
      id: "act-streep",
      kind: "master",
      title: "Meryl Streep",
      note: "Range, accent, listening. Watch Sophie's Choice and Kramer vs. Kramer.",
      href: "https://en.wikipedia.org/wiki/Meryl_Streep",
    },
  ],
};

const filmmaking: Craft = {
  id: "filmmaking",
  name: "Filmmaking",
  tagline: "Light, time, and human attention.",
  hue: "#E11D48",
  intro:
    "From the first cut to the last colour pass, filmmaking is the orchestration of every art form at once. These are the most-cited works that working directors, editors, and cinematographers actually return to.",
  resources: [
    {
      id: "fm-blink",
      kind: "book",
      title: "In the Blink of an Eye",
      by: "Walter Murch",
      note: "The editor of Apocalypse Now on the rule of six and why we cut where we cut. The shortest masterclass in cinema you will ever read.",
      href: "https://en.wikipedia.org/wiki/In_the_Blink_of_an_Eye_(Murch_book)",
    },
    {
      id: "fm-story",
      kind: "book",
      title: "Story",
      by: "Robert McKee",
      note: "Substance, structure, style and the principles of screenwriting. The bible most working screenwriters argue with and never throw away.",
      href: "https://en.wikipedia.org/wiki/Story_(McKee_book)",
    },
    {
      id: "fm-sculpting",
      kind: "book",
      title: "Sculpting in Time",
      by: "Andrei Tarkovsky",
      note: "Tarkovsky's reflections on cinema as an art that captures the texture of lived time. Read it slowly.",
      href: "https://en.wikipedia.org/wiki/Sculpting_in_Time",
    },
    {
      id: "fm-lumet",
      kind: "book",
      title: "Making Movies",
      by: "Sidney Lumet",
      note: "An honest, set-by-set tour of every department by the director of Network and 12 Angry Men.",
      href: "https://en.wikipedia.org/wiki/Making_Movies_(book)",
    },
    {
      id: "fm-mamet",
      kind: "book",
      title: "On Directing Film",
      by: "David Mamet",
      note: "Brutal, useful, and very short. Tells you exactly what a shot is for.",
      href: "https://en.wikipedia.org/wiki/On_Directing_Film",
    },
    {
      id: "fm-efap",
      kind: "channel",
      title: "Every Frame a Painting",
      by: "Tony Zhou and Taylor Ramos",
      note: "The video essay channel that taught a generation to look at staging, sound, and silence.",
      href: "https://www.youtube.com/@everyframeapainting",
    },
    {
      id: "fm-lfts",
      kind: "channel",
      title: "Lessons from the Screenplay",
      note: "Scene-by-scene breakdowns of how scripts actually work on the page and on screen.",
      href: "https://www.youtube.com/@LFTScreenplay",
    },
    {
      id: "fm-nerdwriter",
      kind: "channel",
      title: "Nerdwriter1",
      by: "Evan Puschak",
      note: "Patient close-readings of single shots, performances, and edits.",
      href: "https://www.youtube.com/@Nerdwriter1",
    },
    {
      id: "fm-likestories",
      kind: "channel",
      title: "Like Stories of Old",
      note: "Philosophy through cinema. Long-form, meditative, beautifully scored essays.",
      href: "https://www.youtube.com/@LikeStoriesofOld",
    },
    {
      id: "fm-cinema-cartography",
      kind: "channel",
      title: "The Cinema Cartography",
      note: "Deep, sometimes contrarian video essays on form, technique and theory.",
      href: "https://www.youtube.com/@TheCinemaCartography",
    },
    {
      id: "fm-nfs",
      kind: "site",
      title: "No Film School",
      note: "The working filmmaker's daily read: gear, craft interviews, and indie business.",
      href: "https://nofilmschool.com/",
    },
    {
      id: "fm-criterion",
      kind: "site",
      title: "The Criterion Collection",
      note: "Essays, top-ten lists from filmmakers, and the closet picks. A canonical taste-making library.",
      href: "https://www.criterion.com/current",
    },
    {
      id: "fm-kurosawa",
      kind: "master",
      title: "Akira Kurosawa",
      note: "Composition, weather, motion. Watch Seven Samurai, Ran, and Ikiru.",
      href: "https://en.wikipedia.org/wiki/Akira_Kurosawa",
    },
    {
      id: "fm-kubrick",
      kind: "master",
      title: "Stanley Kubrick",
      note: "Single-point perspective, obsession, and the long preparation. Watch 2001 and Barry Lyndon.",
      href: "https://en.wikipedia.org/wiki/Stanley_Kubrick",
    },
    {
      id: "fm-varda",
      kind: "master",
      title: "Agnes Varda",
      note: "The mother of the French New Wave. Curiosity as form. Watch Cleo from 5 to 7 and The Gleaners and I.",
      href: "https://en.wikipedia.org/wiki/Agn%C3%A8s_Varda",
    },
    {
      id: "fm-miyazaki",
      kind: "master",
      title: "Hayao Miyazaki",
      note: "Animation as a way of seeing the natural world. Watch Spirited Away and Princess Mononoke.",
      href: "https://en.wikipedia.org/wiki/Hayao_Miyazaki",
    },
  ],
};

export const CRAFTS: Craft[] = [
  filmmaking,
  acting,
  writing,
  photography,
  music,
  songwriting,
  drawing,
  crochet,
  cooking,
  woodworking,
  programming,
  standup,
];

