export const DEMO_DATA_NOTICE = "Demo content for gameplay only. Prices are fantasy credits; stats, transfers, and shirt designs are sample records, not a live or authoritative football database.";

export const clubs = [
  { name: "Sporting CP", city: "Lisbon", initials: "SCP", colors: ["#138343", "#f4f1e5"] },
  { name: "Manchester United", city: "Manchester", initials: "MUN", colors: ["#d71920", "#f5c344"] },
  { name: "Real Madrid", city: "Madrid", initials: "RMA", colors: ["#f7f5ed", "#e9c955"] },
  { name: "Juventus", city: "Turin", initials: "JUV", colors: ["#f2f2ee", "#22282c"] },
  { name: "Al Nassr", city: "Riyadh", initials: "NAS", colors: ["#f5d33e", "#174a32"] },
  { name: "Barcelona", city: "Barcelona", initials: "BAR", colors: ["#a91f48", "#164b91"] },
  { name: "Paris Saint-Germain", city: "Paris", initials: "PSG", colors: ["#163b73", "#ed3348"] },
  { name: "Inter Miami", city: "Miami", initials: "MIA", colors: ["#f18ab3", "#24252b"] },
  { name: "Santos", city: "Santos", initials: "SAN", colors: ["#f7f6ee", "#252525"] },
  { name: "AS Monaco", city: "Monaco", initials: "ASM", colors: ["#d91f3d", "#f5f0e5"] },
  { name: "Manchester City", city: "Manchester", initials: "MCI", colors: ["#72c9ed", "#f6f5ec"] },
  { name: "Borussia Dortmund", city: "Dortmund", initials: "BVB", colors: ["#f4d52c", "#202326"] },
  { name: "Red Bull Salzburg", city: "Salzburg", initials: "RBS", colors: ["#e42336", "#f7f5ee"] },
  { name: "Liverpool", city: "Liverpool", initials: "LIV", colors: ["#d82935", "#f4eee2"] },
  { name: "Chelsea", city: "London", initials: "CHE", colors: ["#1768b4", "#f5f3ea"] },
  { name: "AS Roma", city: "Rome", initials: "ROM", colors: ["#92253d", "#e8a844"] },
  { name: "Bayern Munich", city: "Munich", initials: "FCB", colors: ["#d9233c", "#f1f1ec"] },
  { name: "Borussia Mönchengladbach", city: "Mönchengladbach", initials: "BMG", colors: ["#16894e", "#f6f4e8"] },
  { name: "Ajax", city: "Amsterdam", initials: "AJA", colors: ["#e43840", "#f4f3e9"] },
  { name: "Arsenal", city: "London", initials: "ARS", colors: ["#dd2738", "#f5eee3"] },
  { name: "AC Milan", city: "Milan", initials: "MIL", colors: ["#c92237", "#25272a"] },
  { name: "Tottenham Hotspur", city: "London", initials: "TOT", colors: ["#f5f5ef", "#19396b"] },
  { name: "Wolfsburg", city: "Wolfsburg", initials: "WOB", colors: ["#5bbd48", "#f5f5ed"] },
  { name: "Al-Hilal", city: "Riyadh", initials: "HIL", colors: ["#2584d5", "#f4f4ef"] },
  { name: "Leeds United", city: "Leeds", initials: "LEE", colors: ["#f5f4ed", "#f0d743"] },
];

export const players = [
  { id: "ronaldo", name: "Cristiano Ronaldo", aliases: ["ronaldo", "cr7"], nationality: "Portugal", positions: ["FWD"], clubs: ["Sporting CP", "Manchester United", "Real Madrid", "Juventus", "Al Nassr"], credits: 38, uclGoals2324: 0 },
  { id: "messi", name: "Lionel Messi", aliases: ["messi"], nationality: "Argentina", positions: ["FWD"], clubs: ["Barcelona", "Paris Saint-Germain", "Inter Miami"], credits: 40, uclGoals2324: 4 },
  { id: "neymar", name: "Neymar", aliases: ["neymar jr"], nationality: "Brazil", positions: ["FWD"], clubs: ["Santos", "Barcelona", "Paris Saint-Germain", "Al-Hilal"], credits: 29, uclGoals2324: 2 },
  { id: "mbappe", name: "Kylian Mbappé", aliases: ["mbappe", "kylian mbappe"], nationality: "France", positions: ["FWD"], clubs: ["AS Monaco", "Paris Saint-Germain", "Real Madrid"], credits: 37, uclGoals2324: 7 },
  { id: "haaland", name: "Erling Haaland", aliases: ["haaland"], nationality: "Norway", positions: ["FWD"], clubs: ["Red Bull Salzburg", "Borussia Dortmund", "Manchester City"], credits: 39, uclGoals2324: 12 },
  { id: "salah", name: "Mohamed Salah", aliases: ["salah", "mo salah"], nationality: "Egypt", positions: ["FWD"], clubs: ["Chelsea", "AS Roma", "Liverpool"], credits: 34, uclGoals2324: 8 },
  { id: "debruyne", name: "Kevin De Bruyne", aliases: ["de bruyne", "kdb"], nationality: "Belgium", positions: ["MID"], clubs: ["Chelsea", "Wolfsburg", "Manchester City"], credits: 32, uclGoals2324: 2 },
  { id: "ramos", name: "Sergio Ramos", aliases: ["ramos"], nationality: "Spain", positions: ["DEF"], clubs: ["Sevilla", "Real Madrid", "Paris Saint-Germain"], credits: 18, uclGoals2324: 0 },
  { id: "suarez", name: "Luis Suárez", aliases: ["suarez"], nationality: "Uruguay", positions: ["FWD"], clubs: ["Ajax", "Liverpool", "Barcelona", "Atlético Madrid"], credits: 22, uclGoals2324: 0 },
  { id: "lewandowski", name: "Robert Lewandowski", aliases: ["lewandowski"], nationality: "Poland", positions: ["FWD"], clubs: ["Borussia Dortmund", "Bayern Munich", "Barcelona"], credits: 30, uclGoals2324: 5 },
  { id: "casemiro", name: "Casemiro", aliases: [], nationality: "Brazil", positions: ["MID"], clubs: ["Real Madrid", "Manchester United"], credits: 20, uclGoals2324: 0 },
  { id: "saka", name: "Bukayo Saka", aliases: ["saka"], nationality: "England", positions: ["FWD"], clubs: ["Arsenal"], credits: 31, uclGoals2324: 4 },
  { id: "alisson", name: "Alisson Becker", aliases: ["alisson"], nationality: "Brazil", positions: ["GK"], clubs: ["AS Roma", "Liverpool"], credits: 21, uclGoals2324: 0 },
  { id: "ben-white", name: "Ben White", aliases: ["ben white"], nationality: "England", positions: ["DEF"], clubs: ["Leeds United", "Brighton", "Arsenal"], credits: 19, uclGoals2324: 0 },
  { id: "theo", name: "Theo Hernández", aliases: ["theo hernandez"], nationality: "France", positions: ["DEF"], clubs: ["Real Madrid", "AC Milan"], credits: 25, uclGoals2324: 0 },
  { id: "frenkie", name: "Frenkie de Jong", aliases: ["frenkie de jong"], nationality: "Netherlands", positions: ["MID"], clubs: ["Ajax", "Barcelona"], credits: 26, uclGoals2324: 0 },
  { id: "neves", name: "Rúben Neves", aliases: ["ruben neves", "neves"], nationality: "Portugal", positions: ["MID"], clubs: ["Wolverhampton Wanderers", "Al-Hilal"], credits: 22, uclGoals2324: 0 },
  { id: "kroos", name: "Toni Kroos", aliases: ["kroos"], nationality: "Germany", positions: ["MID"], clubs: ["Bayern Munich", "Real Madrid"], credits: 23, uclGoals2324: 0 },
  { id: "ozil", name: "Mesut Özil", aliases: ["ozil"], nationality: "Germany", positions: ["MID"], clubs: ["Real Madrid", "Arsenal"], credits: 15, uclGoals2324: 0 },
  { id: "pique", name: "Gerard Piqué", aliases: ["pique"], nationality: "Spain", positions: ["DEF"], clubs: ["Manchester United", "Barcelona"], credits: 14, uclGoals2324: 0 },
  { id: "fabregas", name: "Cesc Fàbregas", aliases: ["fabregas"], nationality: "Spain", positions: ["MID"], clubs: ["Arsenal", "Barcelona", "Chelsea"], credits: 16, uclGoals2324: 0 },
  { id: "tevez", name: "Carlos Tévez", aliases: ["tevez"], nationality: "Argentina", positions: ["FWD"], clubs: ["Manchester United", "Manchester City", "Juventus"], credits: 15, uclGoals2324: 0 },
  { id: "jesus", name: "Gabriel Jesus", aliases: ["gabriel jesus"], nationality: "Brazil", positions: ["FWD"], clubs: ["Manchester City", "Arsenal"], credits: 24, uclGoals2324: 4 },
  { id: "sane", name: "Leroy Sané", aliases: ["sane"], nationality: "Germany", positions: ["FWD"], clubs: ["Manchester City", "Bayern Munich"], credits: 25, uclGoals2324: 3 },
  { id: "xabi", name: "Xabi Alonso", aliases: ["xabi alonso"], nationality: "Spain", positions: ["MID"], clubs: ["Liverpool", "Real Madrid", "Bayern Munich"], credits: 17, uclGoals2324: 0 },
  { id: "modric", name: "Luka Modrić", aliases: ["modric"], nationality: "Croatia", positions: ["MID"], clubs: ["Tottenham Hotspur", "Real Madrid"], credits: 21, uclGoals2324: 0 },
  { id: "van-dijk", name: "Virgil van Dijk", aliases: ["van dijk"], nationality: "Netherlands", positions: ["DEF"], clubs: ["Southampton", "Liverpool"], credits: 29, uclGoals2324: 0 },
  { id: "hakimi", name: "Achraf Hakimi", aliases: ["hakimi"], nationality: "Morocco", positions: ["DEF"], clubs: ["Real Madrid", "Borussia Dortmund", "Paris Saint-Germain"], credits: 28, uclGoals2324: 0 },
  { id: "iniesta", name: "Andrés Iniesta", aliases: ["iniesta"], nationality: "Spain", positions: ["MID"], clubs: ["Barcelona"], credits: 18, uclGoals2324: 0 },
  { id: "dani-alves", name: "Dani Alves", aliases: ["alves"], nationality: "Brazil", positions: ["DEF"], clubs: ["Barcelona", "Juventus", "Paris Saint-Germain"], credits: 13, uclGoals2324: 0 },
  { id: "de-gea", name: "David de Gea", aliases: ["de gea"], nationality: "Spain", positions: ["GK"], clubs: ["Manchester United"], credits: 18, uclGoals2324: 0 },
  { id: "pickford", name: "Jordan Pickford", aliases: ["pickford"], nationality: "England", positions: ["GK"], clubs: ["Everton"], credits: 20, uclGoals2324: 0 },
  { id: "henderson", name: "Jordan Henderson", aliases: ["henderson"], nationality: "England", positions: ["MID"], clubs: ["Liverpool"], credits: 14, uclGoals2324: 0 },
];

export const transferEvents = [
  { playerId: "ronaldo", from: "Manchester United", to: "Real Madrid", season: "2009", fee: "about €94m" },
  { playerId: "messi", from: "Barcelona", to: "Paris Saint-Germain", season: "2021", fee: "free transfer" },
  { playerId: "neymar", from: "Barcelona", to: "Paris Saint-Germain", season: "2017", fee: "€222m release clause" },
  { playerId: "mbappe", from: "AS Monaco", to: "Paris Saint-Germain", season: "2017–18", fee: "reported €180m" },
  { playerId: "haaland", from: "Borussia Dortmund", to: "Manchester City", season: "2022", fee: "reported €60m release clause" },
  { playerId: "salah", from: "AS Roma", to: "Liverpool", season: "2017", fee: "reported £36.9m" },
];

export const tournamentRuns = [
  {
    team: "Argentina", year: "2022 World Cup",
    route: ["Saudi Arabia (lost 1–2)", "Mexico (won 2–0)", "Poland (won 2–0)", "Australia (won 2–1)", "Netherlands (drew 2–2; won on penalties)", "Croatia (won 3–0)", "France (drew 3–3; won on penalties)"],
  },
  {
    team: "France", year: "2022 World Cup",
    route: ["Australia (won 4–1)", "Denmark (won 2–1)", "Tunisia (lost 0–1)", "Poland (won 3–1)", "England (won 2–1)", "Morocco (won 2–0)", "Argentina (drew 3–3; lost on penalties)"],
  },
  {
    team: "Brazil", year: "2022 World Cup",
    route: ["Serbia (won 2–0)", "Switzerland (won 1–0)", "Cameroon (lost 0–1)", "South Korea (won 4–1)", "Croatia (drew 1–1; lost on penalties)"],
  },
  {
    team: "Portugal", year: "2022 World Cup",
    route: ["Ghana (won 3–2)", "Uruguay (won 2–0)", "South Korea (lost 1–2)", "Switzerland (won 6–1)", "Morocco (lost 0–1)"],
  },
];

export const clubGrid = {
  rows: ["Real Madrid", "Barcelona", "Manchester City"],
  columns: ["Manchester United", "Arsenal", "Bayern Munich"],
};