/* ==========================================================================
   gamesData.ts : données mockées + types des 3 mini-jeux
   Les images vont dans  publicC:\\Users\\Admin\\Documents\\jeu-mascotte\\src\\logos\\  (ex : publicC:\\Users\\Admin\\Documents\\jeu-mascotte\\src\\logos\\apple.png)
   ========================================================================== */

/** Tableau de longueur fixe : utile pour forcer exactement 3 indices ou 4 options */
export type Tuple3<T> = [T, T, T];
export type Tuple4<T> = [T, T, T, T];

export type Difficulty = "easy" | "medium" | "hard";

const logoUrl = (fileName: string) => new URL(`../logos/${fileName}`, import.meta.url).href;

/* ==========================================================================
   JEU 1 : ZOOM
   ========================================================================== */

export type LogoCategory = "tech" | "gaming" | "sport" | "automotive" | "entertainment";

export interface ZoomRound {
  id: string;
  image: string;
  answer: string;
  acceptedAnswers: string[];
  category: LogoCategory;
  options: Tuple4<string>;
  hints: Tuple3<string>;
  focus: { x: number; y: number };
}

export const ZOOM_STAGE_SCALES: [number, number, number, number, number] = [8, 5.5, 3.5, 2, 1];

export const zoomRounds: ZoomRound[] = [
  // --- TECH ---
  {
    id: "zoom-apple",
    image: logoUrl("apple.png"),
    answer: "Apple",
    acceptedAnswers: ["apple", "apple inc", "apple inc."],
    category: "tech",
    options: ["Apple", "Samsung", "Sony", "Huawei"],
    hints: [
      "The logo is a fruit with a bite taken out of it.",
      "The company was co-founded by Steve Jobs in 1976.",
      "It makes the iPhone and the Mac.",
    ],
    focus: { x: 62, y: 28 },
  },
  {
    id: "zoom-google",
    image: logoUrl("google.png"),
    answer: "Google",
    acceptedAnswers: ["google"],
    category: "tech",
    options: ["Google", "Bing", "Yahoo", "DuckDuckGo"],
    hints: [
      "The name comes from googol, an enormous number.",
      "It started as a search engine in 1998.",
      "Its parent company is called Alphabet.",
    ],
    focus: { x: 50, y: 50 },
  },
  {
    id: "zoom-microsoft",
    image: logoUrl("microsoft.png"),
    answer: "Microsoft",
    acceptedAnswers: ["microsoft", "ms"],
    category: "tech",
    options: ["Microsoft", "IBM", "Intel", "Dell"],
    hints: [
      "The logo consists of four colored squares.",
      "Bill Gates co-founded this company.",
      "They created the Windows operating system.",
    ],
    focus: { x: 25, y: 25 },
  },
  {
    id: "zoom-meta",
    image: logoUrl("meta.png"),
    answer: "Meta",
    acceptedAnswers: ["meta", "facebook"],
    category: "tech",
    options: ["Meta", "Twitter", "Snapchat", "Reddit"],
    hints: [
      "The logo looks like an infinity symbol.",
      "It's the new name of a famous social media empire.",
      "Mark Zuckerberg is the CEO.",
    ],
    focus: { x: 70, y: 50 },
  },
  {
    id: "zoom-amazon",
    image: logoUrl("amazon.png"),
    answer: "Amazon",
    acceptedAnswers: ["amazon", "amazon.com"],
    category: "tech",
    options: ["Amazon", "eBay", "Alibaba", "Shopify"],
    hints: [
      "The logo features a curved yellow arrow.",
      "The arrow points from A to Z.",
      "It started as an online bookstore created by Jeff Bezos.",
    ],
    focus: { x: 45, y: 65 },
  },
  {
    id: "zoom-discord",
    image: logoUrl("discord.png"),
    answer: "Discord",
    acceptedAnswers: ["discord"],
    category: "tech",
    options: ["Discord", "Slack", "Skype", "Teams"],
    hints: [
      "The logo features a mascot shaped like a game controller named Clyde.",
      "It uses blurple as its primary brand color.",
      "It is a popular voice, video, and text communication platform for gamers.",
    ],
    focus: { x: 50, y: 48 },
  },

  // --- GAMING ---
  {
    id: "zoom-playstation",
    image: logoUrl("playstation.png"),
    answer: "PlayStation",
    acceptedAnswers: ["playstation", "play station", "ps", "sony playstation"],
    category: "gaming",
    options: ["PlayStation", "Xbox", "Nintendo Switch", "Steam"],
    hints: [
      "The first console of the brand came out in Japan in 1994.",
      "It belongs to Sony.",
      "Its controller buttons are a triangle, a circle, a cross and a square.",
    ],
    focus: { x: 38, y: 50 },
  },
  {
    id: "zoom-nintendo",
    image: logoUrl("nintendo.png"),
    answer: "Nintendo",
    acceptedAnswers: ["nintendo"],
    category: "gaming",
    options: ["Nintendo", "Sega", "Atari", "Capcom"],
    hints: [
      "The logo is often red with pill-shaped borders.",
      "They created the most famous Italian plumber.",
      "Creators of the Switch and Game Boy.",
    ],
    focus: { x: 20, y: 50 },
  },
  {
    id: "zoom-xbox",
    image: logoUrl("xbox.png"),
    answer: "Xbox",
    acceptedAnswers: ["xbox", "x box"],
    category: "gaming",
    options: ["Xbox", "PlayStation", "Alienware", "Razer"],
    hints: [
      "The logo is a sphere with a green 'X' cut into it.",
      "It is owned by Microsoft.",
      "Master Chief from Halo is its iconic mascot.",
    ],
    focus: { x: 50, y: 50 },
  },
  {
    id: "zoom-steam",
    image: logoUrl("steam.png"),
    answer: "Steam",
    acceptedAnswers: ["steam", "valve steam"],
    category: "gaming",
    options: ["Steam", "Epic Games", "GOG", "Origin"],
    hints: [
      "The logo represents a locomotive piston connecting arm.",
      "It was developed by Valve Corporation.",
      "It is the dominant digital distribution platform for PC gaming.",
    ],
    focus: { x: 42, y: 55 },
  },
  {
    id: "zoom-sega",
    image: logoUrl("sega.png"),
    answer: "Sega",
    acceptedAnswers: ["sega"],
    category: "gaming",
    options: ["Sega", "Bandai Namco", "Konami", "Square Enix"],
    hints: [
      "The logo features blue text with inline white stripes.",
      "They created the Genesis/Mega Drive console.",
      "Sonic the Hedgehog is their flagship mascot.",
    ],
    focus: { x: 30, y: 50 },
  },

  // --- ENTERTAINMENT ---
  {
    id: "zoom-netflix",
    image: logoUrl("netflix.png"),
    answer: "Netflix",
    acceptedAnswers: ["netflix"],
    category: "entertainment",
    options: ["Netflix", "Hulu", "Disney+", "HBO"],
    hints: [
      "The logo is a bold red 'N'.",
      "It started as a DVD rental service by mail.",
      "You hear 'Ta-dum' when you open the app.",
    ],
    focus: { x: 35, y: 60 },
  },
  {
    id: "zoom-spotify",
    image: logoUrl("spotify.png"),
    answer: "Spotify",
    acceptedAnswers: ["spotify"],
    category: "entertainment",
    options: ["Spotify", "Apple Music", "SoundCloud", "Deezer"],
    hints: [
      "The logo is a green circle with three black sound waves.",
      "It's a Swedish audio streaming and media service.",
      "You wait for your 'Wrapped' every December.",
    ],
    focus: { x: 50, y: 30 },
  },
  {
    id: "zoom-youtube",
    image: logoUrl("youtube.png"),
    answer: "YouTube",
    acceptedAnswers: ["youtube", "yt"],
    category: "entertainment",
    options: ["YouTube", "Vimeo", "Twitch", "Dailymotion"],
    hints: [
      "The logo features a red rounded rectangle with a white play triangle.",
      "The first video uploaded was titled 'Me at the zoo'.",
      "It was acquired by Google in 2006.",
    ],
    focus: { x: 52, y: 48 },
  },
  {
    id: "zoom-twitch",
    image: logoUrl("twitch.png"),
    answer: "Twitch",
    acceptedAnswers: ["twitch", "twitch tv", "twitch.tv"],
    category: "entertainment",
    options: ["Twitch", "Kick", "Mixer", "YouTube Gaming"],
    hints: [
      "The logo is a blocky purple chat bubble with two eyes.",
      "It originated as a spin-off of Justin.tv.",
      "It is the leading live-streaming platform for gamers.",
    ],
    focus: { x: 45, y: 40 },
  },

  // --- SPORT & AUTOMOTIVE ---
  {
    id: "zoom-nike",
    image: logoUrl("nike.png"),
    answer: "Nike",
    acceptedAnswers: ["nike"],
    category: "sport",
    options: ["Nike", "Adidas", "Puma", "Reebok"],
    hints: [
      "Its logo is called the Swoosh.",
      "The brand is named after the Greek goddess of victory.",
      "Its slogan is \"Just Do It\".",
    ],
    focus: { x: 32, y: 62 },
  },
  {
    id: "zoom-adidas",
    image: logoUrl("adidas.png"),
    answer: "Adidas",
    acceptedAnswers: ["adidas"],
    category: "sport",
    options: ["Adidas", "Nike", "Under Armour", "New Balance"],
    hints: [
      "Its logo features three parallel diagonal stripes.",
      "It is a German sports apparel brand founded by Adolf Dassler.",
      "Its popular shoes include the Stan Smith and Superstar.",
    ],
    focus: { x: 40, y: 55 },
  },
  {
    id: "zoom-tesla",
    image: logoUrl("tesla.png"),
    answer: "Tesla",
    acceptedAnswers: ["tesla", "tesla motors"],
    category: "automotive",
    options: ["Tesla", "Ford", "BMW", "Toyota"],
    hints: [
      "The logo is a stylised letter T.",
      "The company is named after the inventor Nikola Tesla.",
      "Elon Musk is its CEO.",
    ],
    focus: { x: 50, y: 40 },
  },
  {
    id: "zoom-ferrari",
    image: logoUrl("ferrari.png"),
    answer: "Ferrari",
    acceptedAnswers: ["ferrari"],
    category: "automotive",
    options: ["Ferrari", "Lamborghini", "Porsche", "Maserati"],
    hints: [
      "The logo depicts a prancing black horse on a yellow shield.",
      "It is an iconic Italian luxury sports car manufacturer.",
      "Its Formula 1 racing team is known as the Scuderia.",
    ],
    focus: { x: 50, y: 35 },
  },
  {
    id: "zoom-porsche",
    image: logoUrl("porche.png"),
    answer: "Porsche",
    acceptedAnswers: ["porsche"],
    category: "automotive",
    options: ["Porsche", "Audi", "Mercedes-Benz", "BMW"],
    hints: [
      "The crest includes antler antlers and black-and-red stripes from Württemberg's coat of arms.",
      "Headquartered in Stuttgart, Germany.",
      "Famous for the iconic 911 sports car model.",
    ],
    focus: { x: 50, y: 50 },
  },
];

/* ==========================================================================
   JEU 2 : CONNEXIONS
   ========================================================================== */

export interface ConnectionsGroup {
  id: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4;
  points: 10 | 20 | 30 | 40;
  words: Tuple4<string>;
}

export interface ConnectionsRound {
  id: string;
  groups: Tuple4<ConnectionsGroup>;
}

export const GRID_SIZE = 4;
export const CONNECTIONS_MAX_MISTAKES = 4;

/** Compatibilité avec l'ancienne API utilisée par le jeu et le store. */
export const connectionsRound: ConnectionsRound = {
  id: "connections-1",
  groups: [
    {
      id: "conn-web-languages",
      category: "Web languages",
      difficulty: 1,
      points: 10,
      words: ["HTML", "CSS", "JavaScript", "PHP"],
    },
    {
      id: "conn-browsers",
      category: "Web browsers",
      difficulty: 2,
      points: 20,
      words: ["Chrome", "Firefox", "Safari", "Edge"],
    },
    {
      id: "conn-operating-systems",
      category: "Operating systems",
      difficulty: 3,
      points: 30,
      words: ["Windows", "Linux", "macOS", "Android"],
    },
    {
      id: "conn-smartphone-brands",
      category: "Smartphone brands",
      difficulty: 4,
      points: 40,
      words: ["Samsung", "Xiaomi", "Huawei", "Oppo"],
    },
  ],
};

export const connectionsWords = connectionsRound.groups.flatMap((group) => group.words);

export const connectionsRounds: ConnectionsRound[] = [
  {
    id: "connections-1",
    groups: [
      {
        id: "conn-web-languages",
        category: "Web languages",
        difficulty: 1,
        points: 10,
        words: ["HTML", "CSS", "JavaScript", "PHP"],
      },
      {
        id: "conn-browsers",
        category: "Web browsers",
        difficulty: 2,
        points: 20,
        words: ["Chrome", "Firefox", "Safari", "Edge"],
      },
      {
        id: "conn-operating-systems",
        category: "Operating systems",
        difficulty: 3,
        points: 30,
        words: ["Windows", "Linux", "macOS", "Android"],
      },
      {
        id: "conn-smartphone-brands",
        category: "Smartphone brands",
        difficulty: 4,
        points: 40,
        words: ["Samsung", "Xiaomi", "Huawei", "Oppo"],
      },
    ],
  },
  {
    id: "connections-2",
    groups: [
      {
        id: "conn-game-engines",
        category: "Game Engines",
        difficulty: 1,
        points: 10,
        words: ["Unity", "Unreal", "Godot", "Source"],
      },
      {
        id: "conn-cloud-providers",
        category: "Cloud Providers",
        difficulty: 2,
        points: 20,
        words: ["AWS", "Azure", "GCP", "DigitalOcean"],
      },
      {
        id: "conn-js-frameworks",
        category: "JS Frameworks",
        difficulty: 3,
        points: 30,
        words: ["React", "Vue", "Angular", "Svelte"],
      },
      {
        id: "conn-design-tools",
        category: "Design Tools",
        difficulty: 4,
        points: 40,
        words: ["Figma", "Sketch", "XD", "InVision"],
      },
    ],
  },
  {
    id: "connections-3",
    groups: [
      {
        id: "conn-billionaires",
        category: "Tech Billionaires",
        difficulty: 1,
        points: 10,
        words: ["Musk", "Gates", "Bezos", "Zuckerberg"],
      },
      {
        id: "conn-databases",
        category: "Databases",
        difficulty: 2,
        points: 20,
        words: ["MySQL", "MongoDB", "PostgreSQL", "Redis"],
      },
      {
        id: "conn-retro-consoles",
        category: "Retro Consoles",
        difficulty: 3,
        points: 30,
        words: ["NES", "Genesis", "Dreamcast", "N64"],
      },
      {
        id: "conn-shortcuts",
        category: "Keyboard Shortcuts",
        difficulty: 4,
        points: 40,
        words: ["Copy", "Paste", "Undo", "Save"],
      },
    ],
  },
  {
    id: "connections-4",
    groups: [
      {
        id: "conn-prog-languages",
        category: "Backend Languages",
        difficulty: 1,
        points: 10,
        words: ["Python", "Java", "Rust", "Go"],
      },
      {
        id: "conn-streaming-apps",
        category: "Video Streaming Services",
        difficulty: 2,
        points: 20,
        words: ["Hulu", "Disney+", "Max", "Prime"],
      },
      {
        id: "conn-social-media",
        category: "Social Platforms",
        difficulty: 3,
        points: 30,
        words: ["TikTok", "LinkedIn", "Pinterest", "Reddit"],
      },
      {
        id: "conn-hardware-parts",
        category: "Computer Hardware",
        difficulty: 4,
        points: 40,
        words: ["CPU", "GPU", "RAM", "SSD"],
      },
    ],
  },
  {
    id: "connections-5",
    groups: [
      {
        id: "conn-fast-food",
        category: "Fast Food Chains",
        difficulty: 1,
        points: 10,
        words: ["McDonalds", "KFC", "Subway", "Wendy's"],
      },
      {
        id: "conn-car-makers",
        category: "Car Manufacturers",
        difficulty: 2,
        points: 20,
        words: ["Toyota", "Honda", "Ford", "Chevrolet"],
      },
      {
        id: "conn-game-genres",
        category: "Video Game Genres",
        difficulty: 3,
        points: 30,
        words: ["RPG", "FPS", "MOBA", "RTS"],
      },
      {
        id: "conn-css-units",
        category: "CSS Sizing Units",
        difficulty: 4,
        points: 40,
        words: ["Pixel", "Rem", "Em", "Percent"],
      },
    ],
  },
  {
    id: "connections-6",
    groups: [
      {
        id: "conn-hero-teams",
        category: "Superhero Teams",
        difficulty: 1,
        points: 10,
        words: ["Avengers", "X-Men", "Guardians", "Defenders"],
      },
      {
        id: "conn-audio-formats",
        category: "Audio File Formats",
        difficulty: 2,
        points: 20,
        words: ["MP3", "WAV", "FLAC", "AAC"],
      },
      {
        id: "conn-planets",
        category: "Solar System Planets",
        difficulty: 3,
        points: 30,
        words: ["Mars", "Venus", "Jupiter", "Saturn"],
      },
      {
        id: "conn-git-commands",
        category: "Git Commands",
        difficulty: 4,
        points: 40,
        words: ["Commit", "Push", "Pull", "Merge"],
      },
    ],
  },
  {
    id: "connections-7",
    groups: [
      {
        id: "conn-apple-devices",
        category: "Apple Products",
        difficulty: 1,
        points: 10,
        words: ["iPhone", "iPad", "MacBook", "AirPods"],
      },
      {
        id: "conn-code-editors",
        category: "Code Editors & IDEs",
        difficulty: 2,
        points: 20,
        words: ["VSCode", "Vim", "Sublime", "Eclipse"],
      },
      {
        id: "conn-cyberpunk-media",
        category: "Cyberpunk Media",
        difficulty: 3,
        points: 30,
        words: ["Matrix", "Blade Runner", "Akira", "Tron"],
      },
      {
        id: "conn-http-status",
        category: "HTTP Status Words",
        difficulty: 4,
        points: 40,
        words: ["OK", "NotFound", "Unauthorized", "Forbidden"],
      },
    ],
  },
];

/* ==========================================================================
   JEU 3 : TIMELINE
   ========================================================================== */

export interface TimelineEvent {
  id: string;
  title: string;
  year: number;
  fact: string;
}

export interface TimelineRound {
  id: string;
  difficulty: Difficulty;
  events: Tuple4<TimelineEvent>;
}

export const ALL_TIMELINE_ROUNDS: TimelineRound[] = [
  {
    id: "timeline-1",
    difficulty: "easy",
    events: [
      {
        id: "tl1-moon",
        title: "First humans walk on the Moon",
        year: 1969,
        fact: "Neil Armstrong and Buzz Aldrin landed with Apollo 11 on July 20, 1969.",
      },
      {
        id: "tl1-facebook",
        title: "Facebook is created",
        year: 2004,
        fact: "Mark Zuckerberg launched it from his Harvard dorm room.",
      },
      {
        id: "tl1-iphone",
        title: "The first iPhone is unveiled",
        year: 2007,
        fact: "Steve Jobs presented it in January 2007, and it went on sale that June.",
      },
      {
        id: "tl1-chatgpt",
        title: "ChatGPT is released",
        year: 2022,
        fact: "OpenAI opened it to the public on November 30, 2022.",
      },
    ],
  },
  {
    id: "timeline-2",
    difficulty: "medium",
    events: [
      {
        id: "tl2-berlin",
        title: "The Berlin Wall falls",
        year: 1989,
        fact: "The border crossings opened on the night of November 9, 1989.",
      },
      {
        id: "tl2-google",
        title: "Google is founded",
        year: 1998,
        fact: "Larry Page and Sergey Brin started it as a Stanford research project.",
      },
      {
        id: "tl2-euro",
        title: "Euro banknotes and coins enter circulation",
        year: 2002,
        fact: "The euro cash launched on January 1, 2002 in twelve countries.",
      },
      {
        id: "tl2-twitter",
        title: "Twitter is launched",
        year: 2006,
        fact: "Its very first tweet was posted in March 2006, before the public launch in July.",
      },
    ],
  },
  {
    id: "timeline-3",
    difficulty: "hard",
    events: [
      {
        id: "tl3-linux",
        title: "Linus Torvalds announces Linux",
        year: 1991,
        fact: "He announced his \"just a hobby\" operating system in August 1991.",
      },
      {
        id: "tl3-win95",
        title: "Windows 95 is released",
        year: 1995,
        fact: "It introduced the Start menu and the taskbar on August 24, 1995.",
      },
      {
        id: "tl3-wikipedia",
        title: "Wikipedia goes online",
        year: 2001,
        fact: "It was launched on January 15, 2001.",
      },
      {
        id: "tl3-bitcoin",
        title: "The Bitcoin white paper is published",
        year: 2008,
        fact: "Satoshi Nakamoto shared it on October 31, 2008.",
      },
    ],
  },
  {
    id: "timeline-4",
    difficulty: "easy",
    events: [
      {
        id: "tl4-email",
        title: "First network email is sent",
        year: 1971,
        fact: "Ray Tomlinson sent the first email and introduced the '@' symbol.",
      },
      {
        id: "tl4-apple",
        title: "Apple Computer is founded",
        year: 1976,
        fact: "Jobs, Wozniak, and Wayne founded it in Jobs' parents' garage.",
      },
      {
        id: "tl4-www",
        title: "World Wide Web is invented",
        year: 1989,
        fact: "Tim Berners-Lee invented it while working at CERN.",
      },
      {
        id: "tl4-amazon",
        title: "Amazon is founded",
        year: 1994,
        fact: "Jeff Bezos started it as an online bookstore.",
      },
    ],
  },
  {
    id: "timeline-5",
    difficulty: "medium",
    events: [
      {
        id: "tl5-y2k",
        title: "The Y2K Bug scare",
        year: 2000,
        fact: "People feared computers would crash when dates rolled over to 2000.",
      },
      {
        id: "tl5-youtube",
        title: "YouTube is founded",
        year: 2005,
        fact: "The first video ever uploaded is 'Me at the zoo'.",
      },
      {
        id: "tl5-instagram",
        title: "Instagram is launched",
        year: 2010,
        fact: "It was acquired by Facebook just two years later for $1 billion.",
      },
      {
        id: "tl5-tiktok",
        title: "TikTok merges with Musical.ly",
        year: 2018,
        fact: "This merger created the global sensation we know today.",
      },
    ],
  },
  {
    id: "timeline-6",
    difficulty: "hard",
    events: [
      {
        id: "tl6-eniac",
        title: "ENIAC is completed",
        year: 1945,
        fact: "It was the first programmable, electronic, general-purpose digital computer.",
      },
      {
        id: "tl6-pong",
        title: "Atari releases Pong",
        year: 1972,
        fact: "It was the first commercially successful video game.",
      },
      {
        id: "tl6-mario",
        title: "Super Mario Bros is released",
        year: 1985,
        fact: "It revolutionized the platformer genre on the NES.",
      },
      {
        id: "tl6-oculus",
        title: "Oculus Rift Kickstarter launches",
        year: 2012,
        fact: "It raised $2.4 million and kickstarted the modern VR revolution.",
      },
    ],
  },
  {
    id: "timeline-7",
    difficulty: "easy",
    events: [
      {
        id: "tl7-sputnik",
        title: "Sputnik 1 becomes the first artificial satellite",
        year: 1957,
        fact: "The Soviet Union launched it on October 4, 1957, triggering the Space Race.",
      },
      {
        id: "tl7-hubble",
        title: "Hubble Space Telescope launches",
        year: 1990,
        fact: "Space Shuttle Discovery carried Hubble into orbit on April 24, 1990.",
      },
      {
        id: "tl7-curiosity",
        title: "Curiosity Rover lands on Mars",
        year: 2012,
        fact: "It executed a famous 'sky crane' maneuver to land safely in Gale Crater.",
      },
      {
        id: "tl7-jwst",
        title: "James Webb Space Telescope releases its first images",
        year: 2022,
        fact: "NASA unveiled the deepest infrared vision of the universe on July 11, 2022.",
      },
    ],
  },
  {
    id: "timeline-8",
    difficulty: "medium",
    events: [
      {
        id: "tl8-atari2600",
        title: "Atari 2600 is released",
        year: 1977,
        fact: "It popularized home video game consoles with interchangeable cartridges.",
      },
      {
        id: "tl8-gameboy",
        title: "Nintendo Game Boy launches",
        year: 1989,
        fact: "Bundled with Tetris in many markets, it became an instant handheld legend.",
      },
      {
        id: "tl8-ps2",
        title: "PlayStation 2 launches",
        year: 2000,
        fact: "It remains the best-selling video game console of all time.",
      },
      {
        id: "tl8-switch",
        title: "Nintendo Switch is released",
        year: 2017,
        fact: "A hybrid console that can be docked or played on the go.",
      },
    ],
  },
  {
    id: "timeline-9",
    difficulty: "hard",
    events: [
      {
        id: "tl9-arpanet",
        title: "First message sent over ARPANET",
        year: 1969,
        fact: "Charley Kline tried to type 'LOGIN' but the system crashed after 'LO'.",
      },
      {
        id: "tl9-creeper",
        title: "Creeper virus infects TENEX operating system",
        year: 1971,
        fact: "Considered the first computer worm, displaying 'I'm the creeper, catch me if you can!'.",
      },
      {
        id: "tl9-mp3",
        title: "The MP3 audio standard is published",
        year: 1993,
        fact: "Developed by the Fraunhofer Society, it transformed digital music storage.",
      },
      {
        id: "tl9-btc-genesis",
        title: "Bitcoin Genesis Block is mined",
        year: 2009,
        fact: "Satoshi Nakamoto mined Block 0 on January 3, 2009.",
      },
    ],
  },
  {
    id: "timeline-10",
    difficulty: "easy",
    events: [
      {
        id: "tl10-starwars",
        title: "Star Wars: A New Hope premieres",
        year: 1977,
        fact: "George Lucas revolutionized cinematic special effects with Industrial Light & Magic.",
      },
      {
        id: "tl10-jurassic",
        title: "Jurassic Park hits theaters",
        year: 1993,
        fact: "Steven Spielberg's blockbuster showcased ground-breaking CGI dinosaurs.",
      },
      {
        id: "tl10-avatar",
        title: "Avatar releases in theaters",
        year: 2009,
        fact: "James Cameron's film set a new bar for 3D film technology.",
      },
      {
        id: "tl10-endgame",
        title: "Avengers: Endgame releases",
        year: 2019,
        fact: "It concluded the 22-movie Infinity Saga of the Marvel Cinematic Universe.",
      },
    ],
  },
  {
    id: "timeline-11",
    difficulty: "medium",
    events: [
      {
        id: "tl11-motorola",
        title: "First handheld cellular phone call",
        year: 1973,
        fact: "Martin Cooper of Motorola placed the call on a DynaTAC prototype.",
      },
      {
        id: "tl11-nokia3310",
        title: "Nokia 3310 is released",
        year: 2000,
        fact: "Famous for its durability, battery life, and the game Snake II.",
      },
      {
        id: "tl11-android",
        title: "First commercial Android phone (HTC Dream) released",
        year: 2008,
        fact: "It came with a slide-out physical keyboard and the Android 1.0 OS.",
      },
      {
        id: "tl11-5g",
        title: "First commercial 5G networks launch globally",
        year: 2019,
        fact: "South Korea and several US carriers launched the first public 5G services.",
      },
    ],
  },
  {
    id: "timeline-12",
    difficulty: "hard",
    events: [
      {
        id: "tl12-turingtest",
        title: "Alan Turing proposes the Turing Test",
        year: 1950,
        fact: "Published in his paper 'Computing Machinery and Intelligence'.",
      },
      {
        id: "tl12-deepblue",
        title: "Deep Blue defeats Garry Kasparov",
        year: 1997,
        fact: "IBM's supercomputer became the first to beat a reigning world chess champion.",
      },
      {
        id: "tl12-alphago",
        title: "AlphaGo beats Lee Sedol at Go",
        year: 2016,
        fact: "DeepMind's AI won 4-1 against one of the world's best Go players.",
      },
      {
        id: "tl12-gpt4",
        title: "GPT-4 multimodal model is released",
        year: 2023,
        fact: "OpenAI unveiled GPT-4 on March 14, 2023.",
      },
    ],
  },
];

const TIMELINE_ROUND_SELECTION = [0, 3, 8] as const;

export const timelineRounds: TimelineRound[] = TIMELINE_ROUND_SELECTION.map(
  (index) => ALL_TIMELINE_ROUNDS[index]
);

/* ==========================================================================
   Export groupé
   ========================================================================== */

export interface GamesData {
  zoom: ZoomRound[];
  connections: ConnectionsRound[];
  timeline: TimelineRound[];
}

export const gamesData: GamesData = {
  zoom: zoomRounds,
  connections: connectionsRounds,
  timeline: timelineRounds,
};