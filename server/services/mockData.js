// Mock data for when APIs are unavailable (demo/fallback mode)

const mockLiveMatches = [
  {
    id: "mock-1",
    name: "India vs Australia - 2nd Test",
    matchType: "test",
    status: "India won the toss and elected to bat",
    venue: "Melbourne Cricket Ground, Melbourne",
    date: new Date().toISOString(),
    dateTimeGMT: new Date().toISOString(),
    teams: ["India", "Australia"],
    teamInfo: [
      { name: "India", shortname: "IND", img: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" },
      { name: "Australia", shortname: "AUS", img: "https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg" }
    ],
    score: [
      { r: 342, w: 6, o: 87.3, inning: "India Inning 1" },
      { r: 198, w: 10, o: 68.4, inning: "Australia Inning 1" }
    ],
    matchStarted: true,
    matchEnded: false,
    ms: "live"
  },
  {
    id: "mock-2",
    name: "England vs Pakistan - 1st ODI",
    matchType: "odi",
    status: "Pakistan need 78 runs from 52 balls",
    venue: "Lord's Cricket Ground, London",
    date: new Date().toISOString(),
    dateTimeGMT: new Date().toISOString(),
    teams: ["England", "Pakistan"],
    teamInfo: [
      { name: "England", shortname: "ENG", img: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg" },
      { name: "Pakistan", shortname: "PAK", img: "https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg" }
    ],
    score: [
      { r: 287, w: 8, o: 50, inning: "England Inning 1" },
      { r: 210, w: 4, o: 41.2, inning: "Pakistan Inning 1" }
    ],
    matchStarted: true,
    matchEnded: false,
    ms: "live"
  },
  {
    id: "mock-3",
    name: "South Africa vs New Zealand - T20",
    matchType: "t20",
    status: "South Africa won by 42 runs",
    venue: "Newlands Cricket Ground, Cape Town",
    date: new Date(Date.now() - 86400000).toISOString(),
    dateTimeGMT: new Date(Date.now() - 86400000).toISOString(),
    teams: ["South Africa", "New Zealand"],
    teamInfo: [
      { name: "South Africa", shortname: "SA", img: "https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg" },
      { name: "New Zealand", shortname: "NZ", img: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg" }
    ],
    score: [
      { r: 189, w: 4, o: 20, inning: "South Africa Inning 1" },
      { r: 147, w: 10, o: 18.3, inning: "New Zealand Inning 1" }
    ],
    matchStarted: true,
    matchEnded: true,
    ms: "result"
  },
  {
    id: "mock-4",
    name: "West Indies vs Sri Lanka - 3rd T20",
    matchType: "t20",
    status: "Match starts in 2 hours",
    venue: "Kensington Oval, Bridgetown",
    date: new Date(Date.now() + 7200000).toISOString(),
    dateTimeGMT: new Date(Date.now() + 7200000).toISOString(),
    teams: ["West Indies", "Sri Lanka"],
    teamInfo: [
      { name: "West Indies", shortname: "WI", img: "https://upload.wikimedia.org/wikipedia/commons/1/18/WestIndiesCricket_flag.svg" },
      { name: "Sri Lanka", shortname: "SL", img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Sri_Lanka.svg" }
    ],
    score: [],
    matchStarted: false,
    matchEnded: false,
    ms: "upcoming"
  }
];

const mockPlayers = [
  {
    id: "mock-p1",
    name: "Virat Kohli",
    country: "India",
    playerImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Virat_Kohli_in_ICC_Cricket_World_Cup_Final_2023.jpg/220px-Virat_Kohli_in_ICC_Cricket_World_Cup_Final_2023.jpg",
    role: "Batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    stats: {
      test: { matches: 113, runs: 9230, avg: 48.85, sr: 56.15, centuries: 30, fifties: 31 },
      odi: { matches: 295, runs: 13906, avg: 57.32, sr: 93.17, centuries: 50, fifties: 72 },
      t20: { matches: 125, runs: 4188, avg: 52.35, sr: 137.96, centuries: 1, fifties: 38 }
    }
  },
  {
    id: "mock-p2",
    name: "Joe Root",
    country: "England",
    playerImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Joe_Root_on_Day_1_of_the_2nd_Ashes_Test%2C_2023.jpg/220px-Joe_Root_on_Day_1_of_the_2nd_Ashes_Test%2C_2023.jpg",
    role: "Batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off-break",
    stats: {
      test: { matches: 143, runs: 12473, avg: 50.50, sr: 57.0, centuries: 35, fifties: 66 },
      odi: { matches: 162, runs: 6207, avg: 45.28, sr: 88.65, centuries: 16, fifties: 40 },
      t20: { matches: 32, runs: 893, avg: 36.91, sr: 126.24, centuries: 0, fifties: 4 }
    }
  },
  {
    id: "mock-p3",
    name: "Babar Azam",
    country: "Pakistan",
    playerImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Babar_Azam_%28cropped%29.jpg/220px-Babar_Azam_%28cropped%29.jpg",
    role: "Batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    stats: {
      test: { matches: 53, runs: 3898, avg: 45.27, sr: 54.35, centuries: 10, fifties: 22 },
      odi: { matches: 109, runs: 5318, avg: 57.80, sr: 88.76, centuries: 20, fifties: 30 },
      t20: { matches: 110, runs: 3987, avg: 40.27, sr: 129.87, centuries: 3, fifties: 36 }
    }
  }
];

const mockNews = [
  {
    title: "India dominates with record-breaking partnership in Melbourne Test",
    description: "Kohli and Gill forge an unbeaten 247-run stand to put India in command on Day 2 of the second Test against Australia.",
    url: "#",
    urlToImage: "https://via.placeholder.com/400x200/1a1a2e/00d4ff?text=Cricket+News",
    publishedAt: new Date().toISOString(),
    source: { name: "ESPN Cricinfo" },
    category: "international"
  },
  {
    title: "IPL 2025: Mumbai Indians announce star-studded squad for upcoming season",
    description: "Mumbai Indians have retained their core squad and made two high-profile overseas additions ahead of the IPL 2025 auction.",
    url: "#",
    urlToImage: "https://via.placeholder.com/400x200/1a1a2e/ff6b35?text=IPL+News",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: "Cricket.com" },
    category: "domestic"
  },
  {
    title: "Bumrah breaks Kapil Dev's record, becomes India's leading wicket-taker in Tests",
    description: "Jasprit Bumrah scalps his 435th Test wicket to surpass the legendary Kapil Dev and become India's all-time leading Test wicket-taker.",
    url: "#",
    urlToImage: "https://via.placeholder.com/400x200/1a1a2e/4ecdc4?text=Record+Breaking",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: "BBC Sport" },
    category: "trending"
  },
  {
    title: "Pakistan's batting collapse raises concerns ahead of England series",
    description: "Pakistan were bowled out for 147 in the second T20I against West Indies, raising serious batting concerns.",
    url: "#",
    urlToImage: "https://via.placeholder.com/400x200/1a1a2e/f7b731?text=Pakistan+Cricket",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    source: { name: "Sky Sports" },
    category: "international"
  },
  {
    title: "BBL 2025 schedule announced: Melbourne Stars to host opener at MCG",
    description: "Cricket Australia has released the full Big Bash League 2025-26 schedule with 61 matches across seven weeks.",
    url: "#",
    urlToImage: "https://via.placeholder.com/400x200/1a1a2e/a29bfe?text=BBL+2025",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: { name: "Cricket Australia" },
    category: "domestic"
  },
  {
    title: "Stokes reveals England's aggressive Test strategy ahead of India series",
    description: "Ben Stokes explains Bazball philosophy and how England plan to take the game to India in the upcoming five-Test series.",
    url: "#",
    urlToImage: "https://via.placeholder.com/400x200/1a1a2e/fd79a8?text=England+Cricket",
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    source: { name: "The Guardian" },
    category: "trending"
  }
];

const mockStadiums = [
  { id: 1, name: "Melbourne Cricket Ground", city: "Melbourne", country: "Australia", lat: -37.8200, lng: 144.9834, capacity: 100024, matches: 112 },
  { id: 2, name: "Lord's Cricket Ground", city: "London", country: "England", lat: 51.5262, lng: -0.1728, capacity: 30000, matches: 145 },
  { id: 3, name: "Eden Gardens", city: "Kolkata", country: "India", lat: 22.5645, lng: 88.3433, capacity: 68000, matches: 87 },
  { id: 4, name: "Wankhede Stadium", city: "Mumbai", country: "India", lat: 18.9389, lng: 72.8258, capacity: 33108, matches: 76 },
  { id: 5, name: "Narendra Modi Stadium", city: "Ahmedabad", country: "India", lat: 23.0900, lng: 72.0844, capacity: 132000, matches: 45 },
  { id: 6, name: "The Oval", city: "London", country: "England", lat: 51.4837, lng: -0.1146, capacity: 25500, matches: 103 },
  { id: 7, name: "Newlands Cricket Ground", city: "Cape Town", country: "South Africa", lat: -33.9285, lng: 18.4160, capacity: 25000, matches: 55 },
  { id: 8, name: "Sydney Cricket Ground", city: "Sydney", country: "Australia", lat: -33.8915, lng: 151.2248, capacity: 48000, matches: 99 },
  { id: 9, name: "Kensington Oval", city: "Bridgetown", country: "Barbados", lat: 13.0869, lng: -59.6155, capacity: 28000, matches: 48 },
  { id: 10, name: "National Cricket Stadium", city: "Karachi", country: "Pakistan", lat: 24.8937, lng: 67.1603, capacity: 35000, matches: 62 },
  { id: 11, name: "Sinhalese Sports Club", city: "Colombo", country: "Sri Lanka", lat: 6.9022, lng: 79.8612, capacity: 10000, matches: 51 },
  { id: 12, name: "Hagley Oval", city: "Christchurch", country: "New Zealand", lat: -43.5279, lng: 172.6319, capacity: 18000, matches: 30 },
  { id: 13, name: "Shere Bangla National Stadium", city: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.3550, capacity: 26000, matches: 41 },
  { id: 14, name: "Harare Sports Club", city: "Harare", country: "Zimbabwe", lat: -17.8209, lng: 31.0428, capacity: 10000, matches: 35 },
  { id: 15, name: "Dubai International Cricket Stadium", city: "Dubai", country: "UAE", lat: 25.0343, lng: 55.2262, capacity: 25000, matches: 38 }
];

const mockLeagues = {
  ipl: {
    id: "ipl",
    name: "Indian Premier League",
    shortName: "IPL",
    season: "2025",
    logo: "🏆",
    color: "#ff6b35",
    pointsTable: [
      { team: "Mumbai Indians", p: 14, w: 10, l: 4, pts: 20, nrr: "+0.645" },
      { team: "Chennai Super Kings", p: 14, w: 9, l: 5, pts: 18, nrr: "+0.412" },
      { team: "Royal Challengers", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.231" },
      { team: "Kolkata Knight Riders", p: 14, w: 7, l: 7, pts: 14, nrr: "+0.103" },
      { team: "Punjab Kings", p: 14, w: 6, l: 8, pts: 12, nrr: "-0.217" },
      { team: "Delhi Capitals", p: 14, w: 5, l: 9, pts: 10, nrr: "-0.421" },
      { team: "Rajasthan Royals", p: 14, w: 4, l: 10, pts: 8, nrr: "-0.512" },
      { team: "Sunrisers Hyderabad", p: 14, w: 3, l: 11, pts: 6, nrr: "-0.789" }
    ],
    topPlayers: [
      { name: "Rohit Sharma", role: "Batsman", runs: 642, wickets: 0 },
      { name: "Jasprit Bumrah", role: "Bowler", runs: 18, wickets: 24 },
      { name: "Ravindra Jadeja", role: "All-rounder", runs: 312, wickets: 14 }
    ],
    fixtures: [
      { team1: "MI", team2: "CSK", date: new Date(Date.now() + 86400000).toISOString(), venue: "Wankhede" },
      { team1: "RCB", team2: "KKR", date: new Date(Date.now() + 172800000).toISOString(), venue: "Chinnaswamy" },
      { team1: "DC", team2: "PBKS", date: new Date(Date.now() + 259200000).toISOString(), venue: "Feroz Shah" }
    ]
  },
  bbl: {
    id: "bbl",
    name: "Big Bash League",
    shortName: "BBL",
    season: "2024-25",
    logo: "🌟",
    color: "#4ecdc4",
    pointsTable: [
      { team: "Melbourne Stars", p: 14, w: 10, l: 4, pts: 20, nrr: "+0.523" },
      { team: "Sydney Sixers", p: 14, w: 9, l: 5, pts: 18, nrr: "+0.318" },
      { team: "Perth Scorchers", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.187" },
      { team: "Brisbane Heat", p: 14, w: 7, l: 7, pts: 14, nrr: "-0.045" },
      { team: "Adelaide Strikers", p: 14, w: 5, l: 9, pts: 10, nrr: "-0.276" },
      { team: "Hobart Hurricanes", p: 14, w: 3, l: 11, pts: 6, nrr: "-0.651" }
    ],
    topPlayers: [
      { name: "David Warner", role: "Batsman", runs: 524, wickets: 0 },
      { name: "Pat Cummins", role: "Bowler", runs: 45, wickets: 18 },
      { name: "Glenn Maxwell", role: "All-rounder", runs: 398, wickets: 8 }
    ],
    fixtures: [
      { team1: "Stars", team2: "Sixers", date: new Date(Date.now() + 86400000).toISOString(), venue: "MCG" },
      { team1: "Scorchers", team2: "Heat", date: new Date(Date.now() + 172800000).toISOString(), venue: "WACA" }
    ]
  },
  cpl: {
    id: "cpl",
    name: "Caribbean Premier League",
    shortName: "CPL",
    season: "2025",
    logo: "🌴",
    color: "#a29bfe",
    pointsTable: [
      { team: "Trinbago Knight Riders", p: 10, w: 8, l: 2, pts: 16, nrr: "+0.712" },
      { team: "Barbados Royals", p: 10, w: 6, l: 4, pts: 12, nrr: "+0.345" },
      { team: "Jamaica Tallawahs", p: 10, w: 5, l: 5, pts: 10, nrr: "+0.123" },
      { team: "Guyana Amazon Warriors", p: 10, w: 4, l: 6, pts: 8, nrr: "-0.234" },
      { team: "St Lucia Kings", p: 10, w: 2, l: 8, pts: 4, nrr: "-0.678" }
    ],
    topPlayers: [
      { name: "Kieron Pollard", role: "All-rounder", runs: 328, wickets: 6 },
      { name: "Chris Gayle", role: "Batsman", runs: 445, wickets: 0 },
      { name: "Sunil Narine", role: "All-rounder", runs: 287, wickets: 12 }
    ],
    fixtures: [
      { team1: "TKR", team2: "BR", date: new Date(Date.now() + 86400000).toISOString(), venue: "Queen's Park" },
      { team1: "JT", team2: "GAW", date: new Date(Date.now() + 172800000).toISOString(), venue: "Sabina Park" }
    ]
  }
};

module.exports = {
  mockLiveMatches,
  mockPlayers,
  mockNews,
  mockStadiums,
  mockLeagues
};
